"use server";

import { getCloudflareContext } from "@opennextjs/cloudflare";
import { CHANNEL_ID, INIT_DATABASE_TASK_TITLE } from "@/consts";
import { getKysely } from "@/lib/kysely";
import { getChannelLastPostId } from "@/lib/telegram";
import { TaskStatus } from "@/schema";

const haveTask = async () => {
  const kysely = await getKysely();

  return await kysely
    .selectFrom("Tasks")
    .where("title", "=", INIT_DATABASE_TASK_TITLE)
    .where((eb) =>
      eb.or([
        eb("status", "=", TaskStatus.TODO),
        eb("status", "=", TaskStatus.DOING),
      ]),
    )
    .selectAll()
    .executeTakeFirst();
};

const createTask = async (content?: string) => {
  const kysely = await getKysely();

  const id = crypto.randomUUID();

  await kysely
    .insertInto("Tasks")
    .values({
      id,
      title: INIT_DATABASE_TASK_TITLE,
      status: TaskStatus.DOING,
      content: content ?? "",
      createdAt: new Date().getTime(),
      updatedAt: new Date().getTime(),
    })
    .execute();

  return { id };
};

const updateTask = async (
  id: string,
  content?: string,
  status: TaskStatus = TaskStatus.DOING,
) => {
  const kysely = await getKysely();

  return await kysely
    .updateTable("Tasks")
    .where("id", "=", id)
    .set({
      status,
      content,
      updatedAt: new Date().getTime(),
    })
    .execute();
};

const execute = async (taskId: string) => {
  await updateTask(taskId, "Getting last post ID");

  const lastPostId = await getChannelLastPostId(CHANNEL_ID);

  await updateTask(taskId, `Last post ID: ${lastPostId}`, TaskStatus.DONE);

  // TODO: Implement database initialization logic
};

export const initDatabase = async (): Promise<{
  message: string;
  taskId?: string;
}> => {
  const existTask = await haveTask();

  if (existTask) {
    return {
      message: "Database initialization task is already in progress",
      taskId: existTask.id,
    };
  }

  const { id } = await createTask("Initializing database");

  const { ctx } = await getCloudflareContext({ async: true });

  ctx.waitUntil(
    execute(id).catch(async (e) => {
      console.error("Failed to initialize database:", e);
      await updateTask(id, e.message, TaskStatus.FAILED);
    }),
  );

  return {
    message: "Database initialization task has been started",
    taskId: id,
  };
};

export const getTaskById = async (id: string) => {
  const kysely = await getKysely();

  return await kysely
    .selectFrom("Tasks")
    .where("title", "=", INIT_DATABASE_TASK_TITLE)
    .where("id", "=", id)
    .orderBy("createdAt", "desc")
    .selectAll()
    .limit(1)
    .executeTakeFirst();
};
