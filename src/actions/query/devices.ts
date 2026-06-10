import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { DEFAULT_CARD_PAGE_SIZE } from "@/consts";
import { getKysely } from "@/lib/kysely";
import { Device } from "@/schema";

const getDevicesInput = z.object({
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().default(DEFAULT_CARD_PAGE_SIZE),
  codename: z.string().optional(),
});

export const getDevices = createServerFn({ method: "GET" })
  .validator(getDevicesInput)
  .handler(async ({ data }) => {
    const kysely = await getKysely();
    const offset = (data.page - 1) * data.limit;

    let devicesQuery = kysely.selectFrom("Devices").selectAll().orderBy("publishAt", "desc");

    let countQuery = kysely.selectFrom("Devices").select((eb) => [eb.fn.count("id").as("total")]);

    if (data.codename) {
      devicesQuery = devicesQuery.where("codename", "=", data.codename);
      countQuery = countQuery.where("codename", "=", data.codename);
    }

    const [devices, totalCountResult] = await Promise.all([
      devicesQuery.limit(data.limit).offset(offset).execute(),
      countQuery.executeTakeFirstOrThrow(),
    ]);

    return {
      devices,
      pagination: {
        page: data.page,
        limit: data.limit,
        total: Number(totalCountResult.total),
        totalPages: Math.ceil(Number(totalCountResult.total) / data.limit),
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
    const kysely = await getKysely();

    if (data.unique?.version || data.unique?.codename) {
      let query = kysely.selectFrom("Devices").selectAll();
      if (data.unique.version) {
        query = query.where("version", "=", data.values.version);
      }
      if (data.unique.codename) {
        query = query.where("codename", "=", data.values.codename);
      }
      const exist = await query.executeTakeFirst();

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
          await kysely
            .updateTable("Devices")
            .set({
              ...data.values,
              updatedAt: new Date().getTime(),
            })
            .where("id", "=", exist.id)
            .execute();
        }
        return { id: exist.id };
      }
    }

    const id = crypto.randomUUID();
    await kysely
      .insertInto("Devices")
      .values({
        id,
        ...data.values,
        createdAt: new Date().getTime(),
        updatedAt: new Date().getTime(),
      })
      .execute();
    return { id };
  });

export const deleteDevice = createServerFn({ method: "POST" })
  .validator(z.object({ id: z.string() }))
  .handler(async ({ data }) => {
    const kysely = await getKysely();
    await kysely.deleteFrom("Devices").where("id", "=", data.id).execute();
  });
