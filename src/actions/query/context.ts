"use server";

import { DEFAULT_CARD_PAGE_SIZE } from "@/consts";
import { getKysely } from "@/lib/kysely";
import { Context } from "@/schema";

/**
 * Retrieves all contexts from the database, ordered by creation date in descending order.
 *
 * This function establishes a database connection using Kysely and queries the 'Context' table.
 */
export const getContexts = async (options?: {
  page?: number;
  limit?: number;
}) => {
  const kysely = await getKysely();
  const page = Number(options?.page) || 1;
  const limit = Number(options?.limit) || DEFAULT_CARD_PAGE_SIZE;
  const offset = (page - 1) * limit;

  const [contexts, totalCountResult] = await Promise.all([
    kysely
      .selectFrom("Context")
      .selectAll()
      .orderBy("createdAt", "desc")
      .limit(limit)
      .offset(offset)
      .execute(),
    kysely
      .selectFrom("Context")
      .select(({ fn }) => [fn.count("id").as("total")])
      .executeTakeFirstOrThrow(),
  ]);

  return {
    contexts,
    pagination: {
      page,
      limit,
      total: Number(totalCountResult.total),
      totalPages: Math.ceil(Number(totalCountResult.total) / limit),
    },
  };
};

/**
 * Retrieves the most recent Context record from the database based on the specified field.
 *
 * @param {('index' | 'createdAt' | 'updatedAt')} by - The field to order by.
 *   - 'index': Order by the index field.
 *   - 'createdAt': Order by the creation timestamp.
 *   - 'updatedAt': Order by the last update timestamp.
 */
export const getLastContext = async (
  by: "index" | "createdAt" | "updatedAt",
) => {
  const kysely = await getKysely();

  return await kysely
    .selectFrom("Context")
    .selectAll()
    .orderBy(by, "desc")
    .executeTakeFirst();
};

/**
 * Retrieves a context from the database by its index.
 * @async
 * @param {number} index - The index of the context to retrieve.
 * @returns {Promise<Context | undefined>} A promise that resolves to the context with the specified index,
 * or undefined if no context with the specified index exists.
 */
export const getContextByIndex = async (index: number) => {
  const kysely = await getKysely();

  return await kysely
    .selectFrom("Context")
    .selectAll()
    .where("index", "=", index)
    .executeTakeFirst();
};

/**
 * Updates a context record by its ID with the provided values.
 *
 * @param id - The unique identifier of the context to update
 * @param values - Partial object containing the fields to update, excluding id, createdAt, and updatedAt
 * @returns Promise that resolves when the update operation is complete
 *
 * @example
 * // Update a context's title
 * await updateContextById('context-123', { title: 'New Title' });
 */
export const updateContextById = async (
  id: string,
  values: Partial<Omit<Context, "id" | "createdAt" | "updatedAt">>,
) => {
  const kysely = await getKysely();

  await kysely
    .updateTable("Context")
    .set({
      ...values,
      updatedAt: Date.now(),
    })
    .where("id", "=", id)
    .execute();
};

export type CreateContextValues = Omit<
  Context,
  "id" | "createdAt" | "updatedAt"
>;

/**
 * Creates or updates a context in the database.
 *
 * @param values - The context values to create or update
 * @param unique - Optional configuration for uniqueness checks
 * @param unique.index - If true, checks if a context with the same index exists
 *                       and updates it instead of creating a new one
 * @returns An object containing the ID of the created or updated context
 *
 * @remarks
 * When updating an existing context (when unique.index is true and a matching context exists),
 * the function will only perform the update if there are actual changes to the data.
 * The comparison excludes the createdAt, updatedAt, and id fields.
 *
 * The function will always update the updatedAt timestamp when updating an existing context,
 * and will set both createdAt and updatedAt when creating a new context.
 */
export const createContext = async (
  values: CreateContextValues,
  unique?: {
    index?: boolean;
  },
) => {
  const kysely = await getKysely();

  if (unique?.index) {
    const exist = await kysely
      .selectFrom("Context")
      .selectAll()
      .where("index", "=", values.index)
      .executeTakeFirst();

    if (exist) {
      // Check if there are any updates by comparing props with exist
      // Exclude createdAt and updatedAt from comparison
      const hasUpdates = Object.keys(values).some((key) => {
        // Skip comparison for certain fields
        if (key === "createdAt" || key === "updatedAt" || key === "id") {
          return false;
        }

        return (
          values[key as keyof CreateContextValues] !==
          exist[key as keyof Context]
        );
      });

      if (hasUpdates) {
        // Update the existing context with new properties
        await kysely
          .updateTable("Context")
          .set({
            ...values,
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
      ...values,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    })
    .execute();

  return { id };
};
