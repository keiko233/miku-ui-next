"use server";

import { getCloudflareContext } from "@opennextjs/cloudflare";
import { CHANNEL_ID, CRAWL_CONTEXT_TASK_TITLE } from "@/consts";
import { parsePostContent } from "@/lib/ai";
import { getRawPostContent } from "@/lib/telegram";
import { TaskStatus } from "@/schema";
import { formatError } from "@/utils/fmt";
import { retry } from "@/utils/retry";
import {
  createContext,
  getContextByIndex,
  updateContextById,
} from "../query/context";
import { createDevice } from "../query/devices";
import {
  createTaskByTitle,
  getPendingTaskByTitle,
  updateTaskById,
} from "../query/tasks";

async function execute(id: string, postId: number) {
  const info = `@${CHANNEL_ID}/${postId}`;

  // Get post content
  await updateTaskById(id, `Get post content from channel ${info}`);
  const { content: postContent, publishDate } = await getRawPostContent(
    CHANNEL_ID,
    postId,
  );

  if (!postContent) {
    await updateTaskById(id, `Cannot get post content from channel ${info}`);

    return;
  }

  // Write to database context
  const existContext = await getContextByIndex(postId);
  if (existContext?.id) {
    if (existContext.content !== postContent) {
      await updateContextById(existContext.id, {
        content: postContent,
      });
    }
  } else {
    await createContext(
      {
        index: postId,
        content: postContent,
      },
      { index: true },
    );
  }

  // Parse post content via AI model
  await updateTaskById(id, `Parse post content from channel ${info}`);
  const parsedPostContent = await retry(() => parsePostContent(postContent), {
    maxRetries: 3,
    initialDelay: 500,
    maxDelay: 5000,
    factor: 2,
  });

  if (!parsedPostContent) {
    await updateTaskById(id, `Cannot parse post content from channel ${info}`);

    return;
  }

  // write to database unique device
  await createDevice(
    {
      ...parsedPostContent,
      publishAt: publishDate ?? Date.now(),
    },
    {
      codename: true,
      version: true,
    },
  );
}

export async function executeCrawl(postId: number): Promise<{
  message: string;
  taskId?: string;
}> {
  const existTask = await getPendingTaskByTitle(CRAWL_CONTEXT_TASK_TITLE);

  if (existTask) {
    return {
      message: "Crawl task is already in progress",
      taskId: existTask.id,
    };
  }

  const message = `Create crawl post ${postId} task successfully`;

  const { id } = await createTaskByTitle(CRAWL_CONTEXT_TASK_TITLE, message);

  const { ctx } = await getCloudflareContext({ async: true });

  ctx.waitUntil(
    execute(id, postId)
      .then(async () => {
        await updateTaskById(id, "Execution completed", TaskStatus.DONE);
      })
      .catch(async (e) => {
        console.error(`Error in execute crawl task ${id}`, e);

        await updateTaskById(id, formatError(e), TaskStatus.FAILED);
      }),
  );

  return {
    message,
    taskId: id,
  };
}
