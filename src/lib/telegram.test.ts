import { expect, test } from "vitest";
import { CHANNEL_ID } from "@/consts";
import { getChannelLastPostId, getRawPostContent } from "./telegram";

test("telegram get latest post id", { timeout: 10000, retry: 3 }, async () => {
  const latestPostId = await getChannelLastPostId(CHANNEL_ID);

  expect(latestPostId).toBeDefined();
  expect(typeof latestPostId).toBe("number");
});

test("test get post content", { timeout: 10000, retry: 3 }, async () => {
  const content = await getRawPostContent(CHANNEL_ID, 535);

  expect(content).toBeDefined();
  expect(typeof content).toBe("string");
});
