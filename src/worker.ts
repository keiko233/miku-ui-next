import serverEntry from "@tanstack/react-start/server-entry";

import { runScheduledContextCrawl } from "@/services/context-crawl";

export default {
  async fetch(request) {
    return serverEntry.fetch(request);
  },
  async scheduled(controller, env) {
    const result = await runScheduledContextCrawl(env);
    console.log(
      JSON.stringify({
        event: "scheduled-context-crawl",
        cron: controller.cron,
        ...result,
      }),
    );
  },
} satisfies ExportedHandler<CloudflareEnv>;
