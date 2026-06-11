import { and, desc, eq, or } from "drizzle-orm";

import {
  CHANNEL_ID,
  CRAWL_CONTEXT_TASK_TITLE,
  CRAWL_TASK_STALE_AFTER_MS,
  SCHEDULED_CRAWL_BATCH_SIZE,
} from "@/consts";
import { context, devices, tasks } from "@/db/schema";
import { parsePostContent } from "@/lib/ai";
import { getDb } from "@/lib/db";
import { getChannelLastPostId, getRawPostContent } from "@/lib/telegram";
import { TaskStatus, type Context, type Device } from "@/schema";
import { formatError } from "@/utils/fmt";
import { retry } from "@/utils/retry";

type Defer = (promise: Promise<unknown>) => void;

type CreateContextValues = Omit<Context, "id" | "createdAt" | "updatedAt">;
type CreateDeviceValues = Omit<Device, "id" | "createdAt" | "updatedAt">;

type RunCrawlTaskOptions = {
  disableWaitUntil?: boolean;
  env?: CloudflareEnv;
  force?: boolean;
  waitUntil?: Defer;
};

type TaskRunResult = {
  message: string;
  status: TaskStatus;
};

export type ScheduledContextCrawlResult = {
  checkedAt: number;
  latestPostId: number | null;
  lastContextIndex: number | null;
  crawledPostIds: number[];
  taskIds: string[];
  message: string;
};

async function getLatestContext(envOverride?: CloudflareEnv) {
  const db = getDb(envOverride);
  return (await db.select().from(context).orderBy(desc(context.index)).limit(1))[0];
}

async function getContextByPostId(postId: number, envOverride?: CloudflareEnv) {
  const db = getDb(envOverride);
  return (await db.select().from(context).where(eq(context.index, postId)).limit(1))[0];
}

async function upsertContext(values: CreateContextValues, envOverride?: CloudflareEnv) {
  const db = getDb(envOverride);
  const existing = await getContextByPostId(values.index, envOverride);

  if (existing) {
    if (existing.content !== values.content) {
      await db
        .update(context)
        .set({
          content: values.content,
          updatedAt: Date.now(),
        })
        .where(eq(context.id, existing.id));
    }
    return { id: existing.id };
  }

  const id = crypto.randomUUID();
  await db.insert(context).values({
    id,
    ...values,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  });
  return { id };
}

async function upsertDevice(values: CreateDeviceValues, envOverride?: CloudflareEnv) {
  const db = getDb(envOverride);
  const existing = (
    await db
      .select()
      .from(devices)
      .where(and(eq(devices.codename, values.codename), eq(devices.version, values.version)))
      .limit(1)
  )[0];

  if (existing) {
    const hasUpdates = (Object.keys(values) as Array<keyof CreateDeviceValues>).some(
      (key) => values[key] !== existing[key],
    );

    if (hasUpdates) {
      await db
        .update(devices)
        .set({
          ...values,
          updatedAt: Date.now(),
        })
        .where(eq(devices.id, existing.id));
    }
    return { id: existing.id };
  }

  const id = crypto.randomUUID();
  await db.insert(devices).values({
    id,
    ...values,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  });
  return { id };
}

async function getPendingCrawlTask(envOverride?: CloudflareEnv) {
  const db = getDb(envOverride);
  return (
    await db
      .select()
      .from(tasks)
      .where(
        and(
          eq(tasks.title, CRAWL_CONTEXT_TASK_TITLE),
          or(eq(tasks.status, TaskStatus.TODO), eq(tasks.status, TaskStatus.DOING)),
        ),
      )
      .orderBy(desc(tasks.updatedAt))
      .limit(1)
  )[0];
}

async function appendTaskContent(
  id: string,
  values: { content?: string; status?: TaskStatus },
  envOverride?: CloudflareEnv,
) {
  const db = getDb(envOverride);
  const existing = (
    await db.select({ content: tasks.content }).from(tasks).where(eq(tasks.id, id)).limit(1)
  )[0];

  let content = values.content;
  if (existing && content) {
    content = existing.content ? `${existing.content}\n${content}` : content;
  }

  await db
    .update(tasks)
    .set({
      status: values.status ?? TaskStatus.DOING,
      ...(content !== undefined && { content }),
      updatedAt: Date.now(),
    })
    .where(eq(tasks.id, id));
}

async function clearStaleCrawlTask(envOverride?: CloudflareEnv) {
  const existing = await getPendingCrawlTask(envOverride);
  if (!existing) return null;

  const age = Date.now() - existing.updatedAt;
  if (age <= CRAWL_TASK_STALE_AFTER_MS) {
    return existing;
  }

  await appendTaskContent(
    existing.id,
    {
      content: `Task stale after ${Math.round(age / 1000)} seconds; marking as failed`,
      status: TaskStatus.FAILED,
    },
    envOverride,
  );
  return null;
}

async function createCrawlTask(postId: number, envOverride?: CloudflareEnv) {
  const db = getDb(envOverride);
  const id = crypto.randomUUID();
  const content = `Create crawl context ${postId} task successfully`;

  await db.insert(tasks).values({
    id,
    title: CRAWL_CONTEXT_TASK_TITLE,
    status: TaskStatus.TODO,
    content,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  });

  return { id, content };
}

async function crawlPost(taskId: string, postId: number, envOverride?: CloudflareEnv) {
  const info = `@${CHANNEL_ID}/${postId}`;

  await appendTaskContent(
    taskId,
    { content: `Get post content from channel ${info}` },
    envOverride,
  );
  const { content: postContent, publishDate } = await getRawPostContent(CHANNEL_ID, postId);

  if (!postContent) {
    await appendTaskContent(
      taskId,
      { content: `Cannot get post content from channel ${info}` },
      envOverride,
    );
    return;
  }

  await upsertContext({ index: postId, content: postContent }, envOverride);

  await appendTaskContent(
    taskId,
    { content: `Parse post content from channel ${info}` },
    envOverride,
  );
  const parsedPostContent = await retry(() => parsePostContent(postContent), {
    maxRetries: 3,
    initialDelay: 500,
    maxDelay: 5000,
    factor: 2,
  });

  if (!parsedPostContent) {
    await appendTaskContent(
      taskId,
      { content: `Cannot parse post content from channel ${info}` },
      envOverride,
    );
    return;
  }

  await upsertDevice(
    {
      ...parsedPostContent,
      publishAt: publishDate ?? Date.now(),
    } as CreateDeviceValues,
    envOverride,
  );
}

async function runCrawlTask(taskId: string, postId: number, envOverride?: CloudflareEnv) {
  try {
    await crawlPost(taskId, postId, envOverride);
    await appendTaskContent(
      taskId,
      { content: "Execution completed", status: TaskStatus.DONE },
      envOverride,
    );
    return { message: "Execution completed", status: TaskStatus.DONE } satisfies TaskRunResult;
  } catch (error) {
    console.error(`Error in execute crawl task ${taskId}`, error);
    const message = formatError(error);
    await appendTaskContent(taskId, { content: message, status: TaskStatus.FAILED }, envOverride);
    return { message, status: TaskStatus.FAILED } satisfies TaskRunResult;
  }
}

export async function createAndRunCrawlTask(
  postId: number,
  options: RunCrawlTaskOptions = {},
): Promise<{ message: string; taskId?: string }> {
  if (!options.force) {
    const existing = await clearStaleCrawlTask(options.env);
    if (existing) {
      return {
        message: "Crawl task is already in progress",
        taskId: existing.id,
      };
    }
  }

  const { id, content } = await createCrawlTask(postId, options.env);
  const work = runCrawlTask(id, postId, options.env);

  if (!options.disableWaitUntil && options.waitUntil) {
    options.waitUntil(work.then(() => undefined));
    return { message: content, taskId: id };
  }

  const result = await work;
  return { message: result.message, taskId: id };
}

export async function runScheduledContextCrawl(
  envOverride?: CloudflareEnv,
): Promise<ScheduledContextCrawlResult> {
  const checkedAt = Date.now();
  const existing = await clearStaleCrawlTask(envOverride);
  if (existing) {
    return {
      checkedAt,
      latestPostId: null,
      lastContextIndex: null,
      crawledPostIds: [],
      taskIds: [existing.id],
      message: "Crawl task is already in progress",
    };
  }

  const latestPostId = await getChannelLastPostId(CHANNEL_ID);
  const latestContext = await getLatestContext(envOverride);
  const lastContextIndex = latestContext?.index ?? null;

  if (!latestPostId) {
    return {
      checkedAt,
      latestPostId,
      lastContextIndex,
      crawledPostIds: [],
      taskIds: [],
      message: "Cannot get latest post id",
    };
  }

  const fromPostId = lastContextIndex === null ? latestPostId : lastContextIndex + 1;
  if (fromPostId > latestPostId) {
    return {
      checkedAt,
      latestPostId,
      lastContextIndex,
      crawledPostIds: [],
      taskIds: [],
      message: "Already up to date",
    };
  }

  const toPostId = Math.min(latestPostId, fromPostId + SCHEDULED_CRAWL_BATCH_SIZE - 1);
  const crawledPostIds: number[] = [];
  const taskIds: string[] = [];

  for (let postId = fromPostId; postId <= toPostId; postId++) {
    // Sequential execution keeps AI/D1/API pressure bounded for scheduled runs.
    // oxlint-disable-next-line no-await-in-loop
    const result = await createAndRunCrawlTask(postId, {
      disableWaitUntil: true,
      env: envOverride,
      force: true,
    });
    crawledPostIds.push(postId);
    if (result.taskId) taskIds.push(result.taskId);
  }

  const message =
    toPostId < latestPostId
      ? `Crawled ${fromPostId}-${toPostId}; latest post is ${latestPostId}`
      : `Crawled ${fromPostId}-${toPostId}`;

  return {
    checkedAt,
    latestPostId,
    lastContextIndex,
    crawledPostIds,
    taskIds,
    message,
  };
}
