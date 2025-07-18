import { NextResponse } from "next/server";
import { getLastContext } from "@/actions/query/context";
import { executeCrawl } from "@/actions/task/context-crawl";
import { getLastPostId } from "@/actions/telegram/post";

export async function POST() {
  // const { searchParams } = new URL(request.url);
  // const cron = searchParams.get("cron");

  const lastContext = await getLastContext("index");

  const lastPostId = await getLastPostId();

  const shouldCrawl =
    lastPostId && lastContext?.index && lastContext.index !== lastPostId;

  const results: { message: string; taskId?: string }[] = [];

  if (shouldCrawl) {
    for (let i = lastContext.index; i < 560; i++) {
      const index = i + 1;
      const result = await executeCrawl(index, {
        disableWaitUntil: true,
        force: true,
      });
      results.push(result);
    }
  }

  return new NextResponse(
    JSON.stringify({
      lastContext: lastContext?.index,
      lastPostId,
      shouldCrawl,
      results,
      length: results.length,
    }),
    {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    },
  );
}
