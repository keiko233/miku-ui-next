import { createServerFn } from "@tanstack/react-start";
import { waitUntil } from "cloudflare:workers";
import { z } from "zod";

import { createAndRunCrawlTask } from "@/services/context-crawl";

const executeCrawlInput = z.object({
  postId: z.number().int().nonnegative(),
  options: z
    .object({
      disableWaitUntil: z.boolean().optional(),
      force: z.boolean().optional(),
    })
    .optional()
    .default({}),
});

export const executeCrawl = createServerFn({ method: "POST" })
  .validator(executeCrawlInput)
  .handler(async ({ data }): Promise<{ message: string; taskId?: string }> => {
    // Structured log mirrors worker.ts:scheduled-context-crawl so future
    // "client typed 604 but server got 594" mismatches are greppable in the
    // worker logs.
    console.log(
      JSON.stringify({
        event: "execute-crawl",
        postId: data.postId,
        options: data.options,
        requestId: crypto.randomUUID(),
      }),
    );
    return createAndRunCrawlTask(data.postId, {
      disableWaitUntil: data.options.disableWaitUntil,
      force: data.options.force,
      waitUntil,
    });
  });
