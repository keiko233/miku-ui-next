import { getCloudflareContext } from "@opennextjs/cloudflare";
import { Kysely } from "kysely";
import { D1Dialect } from "kysely-d1";
import { Database } from "@/schema";
import "server-only";

let cachedKysely: Kysely<Database> | null = null;

export const getKysely = async () => {
  const { env } = await getCloudflareContext({ async: true });

  const dialect = new D1Dialect({ database: env.DB });

  if (cachedKysely) {
    return cachedKysely;
  }

  cachedKysely = new Kysely<Database>({ dialect });

  return cachedKysely;
};
