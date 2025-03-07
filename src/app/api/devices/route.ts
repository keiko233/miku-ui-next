import { NextResponse } from "next/server";
import { getKysely } from "@/lib/kysely";

export async function GET() {
  const kysely = await getKysely();

  const query = await kysely.selectFrom("Devices").selectAll().execute();

  return new NextResponse(JSON.stringify(query));
}
