import { createServerFn } from "@tanstack/react-start";
import { and, desc, eq, or } from "drizzle-orm";
import { z } from "zod";

import { tasks } from "@/db/schema";
import { getDb } from "@/lib/db";
import { TaskStatus } from "@/schema";

export const getTaskById = createServerFn({ method: "GET" })
  .validator(z.object({ id: z.string() }))
  .handler(async ({ data }) => {
    const db = getDb();
    return (await db.select().from(tasks).where(eq(tasks.id, data.id)).limit(1))[0];
  });

export const getPendingTaskByTitle = createServerFn({ method: "GET" })
  .validator(z.object({ title: z.string() }))
  .handler(async ({ data }) => {
    const db = getDb();
    return (
      await db
        .select()
        .from(tasks)
        .where(
          and(
            eq(tasks.title, data.title),
            or(eq(tasks.status, TaskStatus.TODO), eq(tasks.status, TaskStatus.DOING)),
          ),
        )
        .limit(1)
    )[0];
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
    const db = getDb();

    let content = data.content;
    if (content) {
      const existingTask = (
        await db.select({ content: tasks.content }).from(tasks).where(eq(tasks.id, data.id)).limit(1)
      )[0];
      if (existingTask) {
        content = existingTask.content ? `${existingTask.content}\n${content}` : content;
      }
    }

    await db
      .update(tasks)
      .set({
        status: data.status,
        ...(content !== undefined && { content }),
        updatedAt: new Date().getTime(),
      })
      .where(eq(tasks.id, data.id));
  });

export const getTasksWithLimit = createServerFn({ method: "GET" })
  .validator(z.object({ limit: z.number().int().positive() }))
  .handler(async ({ data }) => {
    const db = getDb();
    const rows = await db
      .select()
      .from(tasks)
      .orderBy(desc(tasks.createdAt))
      .limit(data.limit);
    return rows.map((task) => {
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
    const db = getDb();
    const id = crypto.randomUUID();
    await db.insert(tasks).values({
      id,
      title: data.title,
      status: TaskStatus.TODO,
      content: data.content ?? "",
      createdAt: new Date().getTime(),
      updatedAt: new Date().getTime(),
    });
    return { id, content: data.content };
  });
