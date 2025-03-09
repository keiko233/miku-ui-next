"use client";

import { adminClient } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";

export const client = createAuthClient({
  plugins: [adminClient()],
});

export const { signIn, signOut, signUp, useSession } = client;
