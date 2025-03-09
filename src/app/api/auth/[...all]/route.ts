import { toNextJsHandler } from "better-auth/next-js";
import type { NextRequest } from "next/server";
import { getAuth } from "@/lib/auth";

const getHandlers = async () => {
  const auth = await getAuth();
  return toNextJsHandler(auth);
};

export const POST = async (request: NextRequest) => {
  const handlers = await getHandlers();
  return handlers.POST(request);
};

export const GET = async (request: NextRequest) => {
  const handlers = await getHandlers();
  return handlers.GET(request);
};
