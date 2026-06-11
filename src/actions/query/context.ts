import { createServerFn } from "@tanstack/react-start";
import { count, desc, eq, type AnyColumn } from "drizzle-orm";
import { z } from "zod";

import { DEFAULT_CARD_PAGE_SIZE } from "@/consts";
import { context } from "@/db/schema";
import { getDb } from "@/lib/db";
import { Context } from "@/schema";

const getContextsInput = z.object({
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().default(DEFAULT_CARD_PAGE_SIZE),
});

export const getContexts = createServerFn({ method: "GET" })
  .validator(getContextsInput)
  .handler(async ({ data }) => {
    const db = getDb();
    const offset = (data.page - 1) * data.limit;

    const [rows, totalCountResult] = await Promise.all([
      db
        .select()
        .from(context)
        .orderBy(desc(context.createdAt))
        .limit(data.limit)
        .offset(offset),
      db.select({ total: count(context.id) }).from(context),
    ]);

    const total = Number(totalCountResult[0]?.total ?? 0);

    return {
      contexts: rows,
      pagination: {
        page: data.page,
        limit: data.limit,
        total,
        totalPages: Math.ceil(total / data.limit),
      },
    };
  });

const orderByMap: Record<"index" | "createdAt" | "updatedAt", AnyColumn> = {
  index: context.index,
  createdAt: context.createdAt,
  updatedAt: context.updatedAt,
};

const getLastContextInput = z.object({
  by: z.enum(["index", "createdAt", "updatedAt"]),
});

export const getLastContext = createServerFn({ method: "GET" })
  .validator(getLastContextInput)
  .handler(async ({ data }) => {
    const db = getDb();
    return (await db.select().from(context).orderBy(desc(orderByMap[data.by])).limit(1))[0];
  });

export const getContextByIndex = createServerFn({ method: "GET" })
  .validator(z.object({ index: z.number().int().nonnegative() }))
  .handler(async ({ data }) => {
    const db = getDb();
    return (
      await db.select().from(context).where(eq(context.index, data.index)).limit(1)
    )[0];
  });

export const updateContextById = createServerFn({ method: "POST" })
  .validator(
    z.object({
      id: z.string(),
      values: z.record(z.string(), z.unknown()),
    }),
  )
  .handler(async ({ data }) => {
    const db = getDb();
    await db
      .update(context)
      .set({
        ...(data.values as Partial<Omit<Context, "id" | "createdAt" | "updatedAt">>),
        updatedAt: Date.now(),
      })
      .where(eq(context.id, data.id));
  });

export type CreateContextValues = Omit<Context, "id" | "createdAt" | "updatedAt">;

export const createContext = createServerFn({ method: "POST" })
  .validator(
    z.object({
      values: z.custom<CreateContextValues>(),
      unique: z
        .object({
          index: z.boolean().optional(),
        })
        .optional(),
    }),
  )
  .handler(async ({ data }) => {
    const db = getDb();

    if (data.unique?.index) {
      const exist = (
        await db.select().from(context).where(eq(context.index, data.values.index)).limit(1)
      )[0];

      if (exist) {
        const hasUpdates = Object.keys(data.values).some((key) => {
          if (key === "createdAt" || key === "updatedAt" || key === "id") {
            return false;
          }
          return (
            data.values[key as keyof CreateContextValues] !==
            (exist as unknown as Record<string, unknown>)[key]
          );
        });

        if (hasUpdates) {
          await db
            .update(context)
            .set({
              ...data.values,
              updatedAt: Date.now(),
            })
            .where(eq(context.id, exist.id));
        }

        return { id: exist.id };
      }
    }

    const id = crypto.randomUUID();
    await db.insert(context).values({
      id,
      ...data.values,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
    return { id };
  });
