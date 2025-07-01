"use server";

import { getKysely } from "@/lib/kysely";
import { TaskStatus } from "@/schema";

/**
 * Fetches a single task by its unique identifier from the database.
 *
 * @param id - The unique identifier of the task to retrieve
 * @returns A Promise that resolves to the task object if found, or undefined if not found
 * @throws Will throw an error if the database query fails
 */
export const getTaskById = async (id: string, env?: CloudflareEnv) => {
  const kysely = await getKysely(env);

  return await kysely
    .selectFrom("Tasks")
    .where("id", "=", id)
    .selectAll()
    .executeTakeFirst();
};

/**
 * Retrieves a pending task with the specified title from the database.
 *
 * A task is considered "pending" if its status is either "TODO" or "DOING".
 *
 * @param title - The title of the task to search for
 * @returns A Promise that resolves to the first matching task or undefined if none is found
 */
export const getPendingTaskByTitle = async (
  title: string,
  env?: CloudflareEnv,
) => {
  const kysely = await getKysely(env);

  return await kysely
    .selectFrom("Tasks")
    .where("title", "=", title)
    .where((eb) =>
      eb.or([
        eb("status", "=", TaskStatus.TODO),
        eb("status", "=", TaskStatus.DOING),
      ]),
    )
    .selectAll()
    .executeTakeFirst();
};

/**
 * Updates a task by its ID in the database.
 *
 * @param id - The unique identifier of the task to update
 * @param content - Optional new content for the task
 * @param status - The new status for the task, defaults to DOING
 * @returns A promise that resolves to the result of the update operation
 */
export const updateTaskById = async (
  id: string,
  content?: string,
  status: TaskStatus = TaskStatus.DOING,
  env?: CloudflareEnv,
) => {
  const kysely = await getKysely(env);

  // If there's content to append, get the existing content first
  if (content) {
    const existingTask = await kysely
      .selectFrom("Tasks")
      .where("id", "=", id)
      .select(["content"])
      .executeTakeFirst();

    if (existingTask) {
      // Append new content to existing content with a line break
      content = existingTask.content
        ? `${existingTask.content}\n${content}`
        : content;
    }
  }

  return await kysely
    .updateTable("Tasks")
    .where("id", "=", id)
    .set({
      status,
      ...(content !== undefined && { content }),
      updatedAt: new Date().getTime(),
    })
    .execute();
};

/**
 * Retrieves a limited number of tasks ordered by creation date in descending order.
 *
 * @param limit - The maximum number of tasks to retrieve
 * @returns A Promise that resolves to an array of Task objects
 * @async
 */
export const getTasksWithLimit = async (limit: number, env?: CloudflareEnv) => {
  const kysely = await getKysely(env);

  const tasks = await kysely
    .selectFrom("Tasks")
    .selectAll()
    .orderBy("createdAt", "desc")
    .limit(limit)
    .execute();

  // Process each task to only keep the last line of content
  return tasks.map((task) => ({
    ...task,
    content: task.content ? task.content.split("\n").pop() || "" : "",
  }));
};

/**
 * Creates a new task in the database with the given title and optional content.
 *
 * @param title - The title of the task to be created
 * @param content - Optional content for the task
 * @returns An object containing the generated UUID and the content of the created task
 * @throws Error if the database operation fails
 */
export const createTaskByTitle = async (
  title: string,
  content?: string,
  env?: CloudflareEnv,
) => {
  const kysely = await getKysely(env);

  const id = crypto.randomUUID();

  await kysely
    .insertInto("Tasks")
    .values({
      id,
      title,
      status: TaskStatus.TODO,
      content: content ?? "",
      createdAt: new Date().getTime(),
      updatedAt: new Date().getTime(),
    })
    .execute();

  return { id, content };
};
