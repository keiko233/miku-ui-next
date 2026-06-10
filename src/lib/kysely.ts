import { env } from "cloudflare:workers";
import { Kysely } from "kysely";
import { D1Dialect } from "kysely-d1";

import type { Database } from "@/schema";

let cachedKysely: Kysely<Database> | null = null;

export const getKysely = async (envOverride?: CloudflareEnv) => {
  const finalEnv = envOverride ?? env;

  if (cachedKysely) {
    return cachedKysely;
  }

  cachedKysely = new Kysely<Database>({
    dialect: new D1Dialect({ database: finalEnv.DB }),
  });

  return cachedKysely;
};
