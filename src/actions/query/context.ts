import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { DEFAULT_CARD_PAGE_SIZE } from "@/consts";
import { getKysely } from "@/lib/kysely";
import { Context } from "@/schema";

const getContextsInput = z.object({
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().default(DEFAULT_CARD_PAGE_SIZE),
});

export const getContexts = createServerFn({ method: "GET" })
  .validator(getContextsInput)
  .handler(async ({ data }) => {
    const kysely = await getKysely();
    const offset = (data.page - 1) * data.limit;

    const [contexts, totalCountResult] = await Promise.all([
      kysely
        .selectFrom("Context")
        .selectAll()
        .orderBy("createdAt", "desc")
        .limit(data.limit)
        .offset(offset)
        .execute(),
      kysely
        .selectFrom("Context")
        .select((eb) => [eb.fn.count("id").as("total")])
        .executeTakeFirstOrThrow(),
    ]);

    return {
      contexts,
      pagination: {
        page: data.page,
        limit: data.limit,
        total: Number(totalCountResult.total),
        totalPages: Math.ceil(Number(totalCountResult.total) / data.limit),
      },
    };
  });

const getLastContextInput = z.object({
  by: z.enum(["index", "createdAt", "updatedAt"]),
});

export const getLastContext = createServerFn({ method: "GET" })
  .validator(getLastContextInput)
  .handler(async ({ data }) => {
    const kysely = await getKysely();
    return await kysely
      .selectFrom("Context")
      .selectAll()
      .orderBy(data.by, "desc")
      .executeTakeFirst();
  });

export const getContextByIndex = createServerFn({ method: "GET" })
  .validator(z.object({ index: z.number().int().nonnegative() }))
  .handler(async ({ data }) => {
    const kysely = await getKysely();
    return await kysely
      .selectFrom("Context")
      .selectAll()
      .where("index", "=", data.index)
      .executeTakeFirst();
  });

export const updateContextById = createServerFn({ method: "POST" })
  .validator(
    z.object({
      id: z.string(),
      values: z.record(z.string(), z.unknown()),
    }),
  )
  .handler(async ({ data }) => {
    const kysely = await getKysely();
    await kysely
      .updateTable("Context")
      .set({
        ...(data.values as Partial<Omit<Context, "id" | "createdAt" | "updatedAt">>),
        updatedAt: Date.now(),
      })
      .where("id", "=", data.id)
      .execute();
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
    const kysely = await getKysely();

    if (data.unique?.index) {
      const exist = await kysely
        .selectFrom("Context")
        .selectAll()
        .where("index", "=", data.values.index)
        .executeTakeFirst();

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
          await kysely
            .updateTable("Context")
            .set({
              ...data.values,
              updatedAt: Date.now(),
            })
            .where("id", "=", exist.id)
            .execute();
        }

        return { id: exist.id };
      }
    }

    const id = crypto.randomUUID();
    await kysely
      .insertInto("Context")
      .values({
        id,
        ...data.values,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      })
      .execute();
    return { id };
  });
