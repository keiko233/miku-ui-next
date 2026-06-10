import { createServerFn } from "@tanstack/react-start";

import { CHANNEL_ID } from "@/consts";
import { getChannelLastPostId } from "@/lib/telegram";

export const getLastPostId = createServerFn({ method: "GET" }).handler(async () => {
  try {
    return await getChannelLastPostId(CHANNEL_ID);
  } catch (error) {
    console.error(error);
    return null;
  }
});
