import { getLastContext } from "@/actions/query/context.js";
import { executeCrawl } from "@/actions/task/context-crawl.js";
import { getLastPostId } from "@/actions/telegram/post.js";
// @ts-ignore `.open-next/worker.ts` is generated at build time
import { default as handler } from "./.open-next/worker.js";

export default {
  fetch: handler.fetch,

  async scheduled(event) {
    const lastContext = await getLastContext("index");

    const lastPostId = await getLastPostId();

    if (lastPostId && lastContext?.index && lastContext.index !== lastPostId) {
      for (let i = lastPostId; i < lastContext.index; i++) {
        const index = i + 1;

        await executeCrawl(index);
      }
    }
  },
} satisfies ExportedHandler<CloudflareEnv>;

// The re-export is only required if your app uses the DO Queue and DO Tag Cache
// See https://opennext.js.org/cloudflare/caching for details
// @ts-ignore `.open-next/worker.ts` is generated at build time
export { DOQueueHandler, DOShardedTagCache } from "./.open-next/worker.js";
