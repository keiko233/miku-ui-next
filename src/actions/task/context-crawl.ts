import { createServerFn } from "@tanstack/react-start";
import { env } from "cloudflare:workers";
import { z } from "zod";

import { CHANNEL_ID, CRAWL_CONTEXT_TASK_TITLE } from "@/consts";
import { parsePostContent } from "@/lib/ai";
import { getRawPostContent } from "@/lib/telegram";
import { TaskStatus } from "@/schema";
import { formatError } from "@/utils/fmt";
import { retry } from "@/utils/retry";

import { createContext, getContextByIndex, updateContextById } from "../query/context";
import { createDevice } from "../query/devices";
import { createTaskByTitle, getPendingTaskByTitle, updateTaskById } from "../query/tasks";

async function execute(id: string, postId: number) {
  const info = `@${CHANNEL_ID}/${postId}`;

  await updateTaskById({
    data: { id, content: `Get post content from channel ${info}` },
  });
  const { content: postContent, publishDate } = await getRawPostContent(CHANNEL_ID, postId);

  if (!postContent) {
    await updateTaskById({
      data: { id, content: `Cannot get post content from channel ${info}` },
    });
    return;
  }

  const existContext = await getContextByIndex({ data: { index: postId } });
  if (existContext?.id) {
    if (existContext.content !== postContent) {
      await updateContextById({ data: { id: existContext.id, values: { content: postContent } } });
    }
  } else {
    await createContext({
      data: {
        values: { index: postId, content: postContent },
        unique: { index: true },
      },
    });
  }

  await updateTaskById({
    data: { id, content: `Parse post content from channel ${info}` },
  });
  const parsedPostContent = await retry(() => parsePostContent(postContent), {
    maxRetries: 3,
    initialDelay: 500,
    maxDelay: 5000,
    factor: 2,
  });

  if (!parsedPostContent) {
    await updateTaskById({
      data: { id, content: `Cannot parse post content from channel ${info}` },
    });
    return;
  }

  await createDevice({
    data: {
      values: {
        ...parsedPostContent,
        publishAt: publishDate ?? Date.now(),
      } as never,
      unique: { codename: true, version: true },
    },
  });
}

const executeCrawlInput = z.object({
  postId: z.number().int().nonnegative(),
  options: z
    .object({
      disableWaitUntil: z.boolean().optional(),
      force: z.boolean().optional(),
    })
    .optional()
    .default({}),
});

export const executeCrawl = createServerFn({ method: "POST" })
  .validator(executeCrawlInput)
  .handler(async ({ data }): Promise<{ message: string; taskId?: string }> => {
    if (!data.options.force) {
      const existTask = await getPendingTaskByTitle({
        data: { title: CRAWL_CONTEXT_TASK_TITLE },
      });
      if (existTask) {
        return {
          message: "Crawl task is already in progress",
          taskId: existTask.id,
        };
      }
    }

    const message = `Create crawl post ${data.postId} task successfully`;
    const { id } = await createTaskByTitle({
      data: { title: CRAWL_CONTEXT_TASK_TITLE, content: message },
    });

    if (!data.options.disableWaitUntil) {
      // In a Cloudflare scheduled/HTTP context, ExecutionContext is on env.
      const ctx = (env as unknown as { waitUntil?: (p: Promise<unknown>) => void }).waitUntil
        ? (env as unknown as { waitUntil: (p: Promise<unknown>) => void })
        : null;
      if (ctx?.waitUntil) {
        ctx.waitUntil(
          execute(id, data.postId)
            .then(async () => {
              await updateTaskById({
                data: { id, content: "Execution completed", status: TaskStatus.DONE },
              });
            })
            .catch(async (e) => {
              console.error(`Error in execute crawl task ${id}`, e);
              await updateTaskById({
                data: { id, content: formatError(e), status: TaskStatus.FAILED },
              });
            }),
        );
      } else {
        await execute(id, data.postId);
        await updateTaskById({
          data: { id, content: "Execution completed", status: TaskStatus.DONE },
        });
        return { message: "Execution completed", taskId: id };
      }
    } else {
      await execute(id, data.postId);
      await updateTaskById({
        data: { id, content: "Execution completed", status: TaskStatus.DONE },
      });
      return { message: "Execution completed", taskId: id };
    }

    return { message, taskId: id };
  });
