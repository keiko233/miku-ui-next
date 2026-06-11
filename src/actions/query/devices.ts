import { createServerFn } from "@tanstack/react-start";
import { and, count, desc, eq } from "drizzle-orm";
import { z } from "zod";

import { DEFAULT_CARD_PAGE_SIZE } from "@/consts";
import { devices } from "@/db/schema";
import { getDb } from "@/lib/db";
import { Device } from "@/schema";

const getDevicesInput = z.object({
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().default(DEFAULT_CARD_PAGE_SIZE),
  codename: z.string().optional(),
});

export const getDevices = createServerFn({ method: "GET" })
  .validator(getDevicesInput)
  .handler(async ({ data }) => {
    const db = getDb();
    const offset = (data.page - 1) * data.limit;

    const where = data.codename ? eq(devices.codename, data.codename) : undefined;

    const [rows, totalCountResult] = await Promise.all([
      db
        .select()
        .from(devices)
        .where(where)
        .orderBy(desc(devices.publishAt))
        .limit(data.limit)
        .offset(offset),
      db.select({ total: count(devices.id) }).from(devices).where(where),
    ]);

    const total = Number(totalCountResult[0]?.total ?? 0);

    return {
      devices: rows,
      pagination: {
        page: data.page,
        limit: data.limit,
        total,
        totalPages: Math.ceil(total / data.limit),
      },
    };
  });

export type CreateDeviceValues = Omit<Device, "id" | "createdAt" | "updatedAt">;

export const createDevice = createServerFn({ method: "POST" })
  .validator(
    z.object({
      values: z.custom<CreateDeviceValues>(),
      unique: z
        .object({
          codename: z.boolean().optional(),
          version: z.boolean().optional(),
        })
        .optional(),
    }),
  )
  .handler(async ({ data }) => {
    const db = getDb();

    if (data.unique?.version || data.unique?.codename) {
      const conditions = [
        data.unique.version ? eq(devices.version, data.values.version) : undefined,
        data.unique.codename ? eq(devices.codename, data.values.codename) : undefined,
      ].filter(Boolean) as ReturnType<typeof eq>[];

      const where = conditions.length === 1 ? conditions[0] : and(...conditions);

      const exist = (await db.select().from(devices).where(where).limit(1))[0];

      if (exist) {
        const hasUpdates = Object.keys(data.values).some((key) => {
          if (key === "createdAt" || key === "updatedAt" || key === "id") {
            return false;
          }
          return (
            data.values[key as keyof CreateDeviceValues] !==
            (exist as unknown as Record<string, unknown>)[key]
          );
        });
        if (hasUpdates) {
          await db
            .update(devices)
            .set({
              ...data.values,
              updatedAt: new Date().getTime(),
            })
            .where(eq(devices.id, exist.id));
        }
        return { id: exist.id };
      }
    }

    const id = crypto.randomUUID();
    await db.insert(devices).values({
      id,
      ...data.values,
      createdAt: new Date().getTime(),
      updatedAt: new Date().getTime(),
    });
    return { id };
  });

export const deleteDevice = createServerFn({ method: "POST" })
  .validator(z.object({ id: z.string() }))
  .handler(async ({ data }) => {
    const db = getDb();
    await db.delete(devices).where(eq(devices.id, data.id));
  });
