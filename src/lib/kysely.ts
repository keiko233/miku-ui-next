"use server";

import { getCloudflareContext } from "@opennextjs/cloudflare";
import { Kysely } from "kysely";
import { D1Dialect } from "kysely-d1";
import { Database } from "@/schema";

let cachedKysely: Kysely<Database> | null = null;

export const getKysely = async (env?: CloudflareEnv) => {
  let finalEnv: CloudflareEnv;

  if (!env) {
    const { env } = await getCloudflareContext({ async: true });
    finalEnv = env;
  } else {
    finalEnv = env;
  }

  const dialect = new D1Dialect({ database: finalEnv.DB });

  if (cachedKysely) {
    return cachedKysely;
  }

  cachedKysely = new Kysely<Database>({ dialect });

  return cachedKysely;
};
