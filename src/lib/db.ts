import { env } from "cloudflare:workers";
import { drizzle } from "drizzle-orm/d1";

import * as schema from "@/db/schema";

type Database = ReturnType<typeof drizzle<typeof schema>>;

let cachedDb: Database | null = null;

export const getDb = (envOverride?: CloudflareEnv): Database => {
  const finalEnv = envOverride ?? env;

  if (cachedDb) {
    return cachedDb;
  }

  cachedDb = drizzle(finalEnv.DB, { schema });
  return cachedDb;
};
