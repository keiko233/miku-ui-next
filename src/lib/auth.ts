import { createServerFn, createServerOnlyFn } from "@tanstack/react-start";
import { getRequestHeaders } from "@tanstack/react-start/server";
import { betterAuth } from "better-auth";
import { admin } from "better-auth/plugins";
import { tanstackStartCookies } from "better-auth/tanstack-start";
import { env } from "cloudflare:workers";

import { UserRole } from "@/schema";

import { getKysely } from "./kysely";

export const getAuth = createServerOnlyFn(async () =>
  betterAuth({
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
      admin({
        defaultRole: UserRole.USER,
      }),
      tanstackStartCookies(),
    ],
    trustedOrigins: [
      `${env.BETTER_AUTH_URL}/auth`,
      `${env.BETTER_AUTH_URL}/api/auth`,
      `${env.BETTER_AUTH_URL}`,
    ],
  }),
);

export type Session = Awaited<ReturnType<typeof getAuth>>["$Infer"]["Session"];

export const getSession = createServerFn({ method: "GET" }).handler(async () => {
  const auth = await getAuth();
  return await auth.api.getSession({
    headers: getRequestHeaders(),
  });
});

export const signOut = createServerOnlyFn(async () => {
  const auth = await getAuth();
  return await auth.api.signOut({
    headers: getRequestHeaders(),
  });
});
