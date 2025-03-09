import { getCloudflareContext } from "@opennextjs/cloudflare";
import { betterAuth } from "better-auth";
import { nextCookies } from "better-auth/next-js";
import { admin } from "better-auth/plugins";
import { headers } from "next/headers";
import { UserRole } from "@/schema";
import { getKysely } from "./kysely";

export const getAuth = async () => {
  const { env } = await getCloudflareContext({ async: true });

  return betterAuth({
    database: {
      db: await getKysely(),
      type: "sqlite",
    },
    baseURL: env.BETTER_AUTH_URL,
    socialProviders: {
      github: {
        clientId: env.BETTER_AUTH_GITHUB_ID,
        clientSecret: env.BETTER_AUTH_GITHUB_SECRET,
      },
    },
    plugins: [
      nextCookies(),
      admin({
        defaultRole: UserRole.USER,
      }),
    ],
    trustedOrigins: [
      `${env.BETTER_AUTH_URL}/auth`,
      `${env.BETTER_AUTH_URL}/api/auth`,
      `${env.BETTER_AUTH_URL}`,
    ],
  });
};

export type Session = Awaited<ReturnType<typeof getAuth>>["$Infer"]["Session"];

export const getSession = async () => {
  const auth = await getAuth();

  return await auth.api.getSession({
    headers: await headers(),
  });
};

export const signOut = async () => {
  const auth = await getAuth();

  return await auth.api.signOut({
    headers: await headers(),
  });
};
