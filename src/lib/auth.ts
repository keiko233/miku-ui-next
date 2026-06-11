import { drizzleAdapter } from "@better-auth/drizzle-adapter";
import { createServerFn, createServerOnlyFn } from "@tanstack/react-start";
import { getRequestHeaders } from "@tanstack/react-start/server";
import { betterAuth } from "better-auth";
import { admin } from "better-auth/plugins";
import { tanstackStartCookies } from "better-auth/tanstack-start";
import { env } from "cloudflare:workers";

import { account, session, user, verification } from "@/db/schema";
import { UserRole } from "@/schema";

import { getDb } from "./db";

export const getAuth = createServerOnlyFn(async () =>
  betterAuth({
    database: drizzleAdapter(getDb(), {
      provider: "sqlite",
      schema: { user, session, account, verification },
    }),
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
