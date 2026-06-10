import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { getKysely } from "@/lib/kysely";
import { TaskStatus } from "@/schema";

export const getTaskById = createServerFn({ method: "GET" })
  .validator(z.object({ id: z.string() }))
  .handler(async ({ data }) => {
    const kysely = await getKysely();
    return await kysely
      .selectFrom("Tasks")
      .where("id", "=", data.id)
      .selectAll()
      .executeTakeFirst();
  });

export const getPendingTaskByTitle = createServerFn({ method: "GET" })
  .validator(z.object({ title: z.string() }))
  .handler(async ({ data }) => {
    const kysely = await getKysely();
    return await kysely
      .selectFrom("Tasks")
      .where("title", "=", data.title)
      .where((eb) =>
        eb.or([eb("status", "=", TaskStatus.TODO), eb("status", "=", TaskStatus.DOING)]),
      )
      .selectAll()
      .executeTakeFirst();
  });

export const updateTaskById = createServerFn({ method: "POST" })
  .validator(
    z.object({
      id: z.string(),
      content: z.string().optional(),
      status: z.nativeEnum(TaskStatus).optional().default(TaskStatus.DOING),
    }),
  )
  .handler(async ({ data }) => {
    const kysely = await getKysely();

    let content = data.content;
    if (content) {
      const existingTask = await kysely
        .selectFrom("Tasks")
        .where("id", "=", data.id)
        .select(["content"])
        .executeTakeFirst();
      if (existingTask) {
        content = existingTask.content ? `${existingTask.content}\n${content}` : content;
      }
    }

    return await kysely
      .updateTable("Tasks")
      .where("id", "=", data.id)
      .set({
        status: data.status,
        ...(content !== undefined && { content }),
        updatedAt: new Date().getTime(),
      })
      .execute();
  });

export const getTasksWithLimit = createServerFn({ method: "GET" })
  .validator(z.object({ limit: z.number().int().positive() }))
  .handler(async ({ data }) => {
    const kysely = await getKysely();
    const tasks = await kysely
      .selectFrom("Tasks")
      .selectAll()
      .orderBy("createdAt", "desc")
      .limit(data.limit)
      .execute();
    return tasks.map((task) => {
      task.content = task.content ? task.content.split("\n").pop() || "" : "";
      return task;
    });
  });

export const createTaskByTitle = createServerFn({ method: "POST" })
  .validator(
    z.object({
      title: z.string(),
      content: z.string().optional(),
    }),
  )
  .handler(async ({ data }) => {
    const kysely = await getKysely();
    const id = crypto.randomUUID();
    await kysely
      .insertInto("Tasks")
      .values({
        id,
        title: data.title,
        status: TaskStatus.TODO,
        content: data.content ?? "",
        createdAt: new Date().getTime(),
        updatedAt: new Date().getTime(),
      })
      .execute();
    return { id, content: data.content };
  });
