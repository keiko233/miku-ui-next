import { createFileRoute } from "@tanstack/react-router";

import { getDevices } from "@/actions/query/devices";

export const Route = createFileRoute("/api/devices")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const page = Number(url.searchParams.get("page") ?? 1);
        const limit = Number(url.searchParams.get("limit") ?? 12);
        const codename = url.searchParams.get("codename") ?? undefined;
        const result = await getDevices({ data: { page, limit, codename } });
        return Response.json(result);
      },
    },
  },
});
