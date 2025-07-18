import { NextResponse } from "next/server";
import { getLastContext } from "@/actions/query/context";
import { executeCrawl } from "@/actions/task/context-crawl";
import { getLastPostId } from "@/actions/telegram/post";

export async function POST() {
  // const { searchParams } = new URL(request.url);
  // const cron = searchParams.get("cron");

  const lastContext = await getLastContext("index");

  const lastPostId = await getLastPostId();

  if (lastPostId && lastContext?.index && lastContext.index !== lastPostId) {
    for (let i = lastPostId; i < lastContext.index; i++) {
      const index = i + 1;

      await executeCrawl(index);
    }
  }

  return new NextResponse("", {
    status: 200,
  });
}
