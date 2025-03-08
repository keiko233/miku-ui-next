"use server";

import { getKysely } from "@/lib/kysely";
import { Device } from "@/schema";

/**
 * Retrieves all devices from the database.
 *
 * This function queries the "Devices" table, selecting all columns
 * and ordering the results by the "publishAt" column in descending order.
 *
 * @async
 * @returns {Promise<Array<Device>>} A promise that resolves to an array of Device objects.
 * @throws {Error} If there's an issue connecting to the database or executing the query.
 */
export const getDevices = async () => {
  const kysely = await getKysely();

  return await kysely
    .selectFrom("Devices")
    .selectAll()
    .orderBy("publishAt", "desc")
    .execute();
};

export type CreateDeviceValues = Omit<Device, "id" | "createdAt" | "updatedAt">;

/**
 * Creates or updates a device in the database
 *
 * @remarks
 * If `unique.version` is true and a device with the same version exists:
 * - The function compares all properties except createdAt, updatedAt, and id
 * - Updates the existing device only if there are changes
 * - Returns the existing device's ID
 *
 * If no matching device exists or `unique.version` is not provided:
 * - Creates a new device with a random UUID
 * - Sets createdAt and updatedAt timestamps
 * - Returns the new device's ID
 */
export const createDevice = async (
  values: CreateDeviceValues,
  unique?: {
    codename?: boolean;
    version?: boolean;
  },
) => {
  const kysely = await getKysely();

  if (unique?.version || unique?.codename) {
    // Build the query for checking existing devices
    let query = kysely
      .selectFrom("Devices")
      .selectAll();
    
    // Add conditions based on unique constraints
    if (unique.version) {
      query = query.where("version", "=", values.version);
    }
    
    if (unique.codename) {
      query = query.where("codename", "=", values.codename);
    }
    
    const exist = await query.executeTakeFirst();

    if (exist) {
      // Check if there are any updates by comparing props with exist
      // Exclude createdAt and updatedAt from comparison, but keep publishAt
      const hasUpdates = Object.keys(values).some((key) => {
        // Skip comparison for certain fields
        if (key === "createdAt" || key === "updatedAt" || key === "id") {
          return false;
        }

        return (
          values[key as keyof CreateDeviceValues] !== exist[key as keyof Device]
        );
      });

      if (hasUpdates) {
        // Update the existing device with new properties
        await kysely
          .updateTable("Devices")
          .set({
            ...values,
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
      ...values,
      createdAt: new Date().getTime(),
      updatedAt: new Date().getTime(),
    })
    .execute();

  return { id };
};

/**
 * Deletes a device from the database by its ID.
 * 
 * @param id - The unique identifier of the device to delete
 * @returns A Promise that resolves when the device has been successfully deleted
 * @async
 */
export const deleteDevice = async (id: string) => {
  const kysely = await getKysely();

  await kysely.deleteFrom("Devices").where("id", "=", id).execute();
};
