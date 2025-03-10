import { NextResponse, type NextRequest } from "next/server";
import { getDevices } from "@/actions/query/devices";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const page = searchParams.get("page");
  const limit = searchParams.get("limit");
  const codename = searchParams.get("codename");

  const query = await getDevices({
    page: page ? parseInt(page) : undefined,
    limit: limit ? parseInt(limit) : undefined,
    codename: codename || undefined,
  });

  return new NextResponse(JSON.stringify(query), {
    headers: {
      "Content-Type": "application/json",
    },
  });
}
