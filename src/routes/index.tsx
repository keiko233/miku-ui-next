import { createFileRoute, Link } from "@tanstack/react-router";
import { z } from "zod";

import { getDevices } from "@/actions/query/devices";
import { Container } from "@/components/container";
import { DeviceCard } from "@/components/device-card";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { TaskButton } from "@/routes/-components/task-button";

const searchSchema = z.object({
  page: z.number().int().positive().default(1),
  size: z.number().int().positive().default(12),
});

export const Route = createFileRoute("/")({
  validateSearch: searchSchema,
  loaderDeps: ({ search }) => search,
  loader: async ({ deps }) => getDevices({ data: { page: deps.page, limit: deps.size } }),
  component: HomePage,
});

function HomePage() {
  const { devices, pagination } = Route.useLoaderData();
  const { page, totalPages } = pagination;

  const pageNumbers = getPageNumbers(page, totalPages);

  return (
    <Container title="Miku UI Download" rightContent={<TaskButton />}>
      <div className="mx-auto max-w-7xl">
        {devices.length ? (
          <div className="grid grid-cols-1 gap-4 p-4 sm:grid-cols-2 md:grid-cols-3">
            {devices.map((device) => (
              <DeviceCard key={device.id} device={device} />
            ))}
          </div>
        ) : (
          <div className="grid h-32 place-content-center">
            <p className="text-muted-foreground">No devices found</p>
          </div>
        )}

        {totalPages > 1 && (
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  render={
                    page > 1 ? (
                      <Link
                        from="/"
                        search={(prev) => ({ ...prev, page: page - 1 })}
                        aria-label="Go to previous page"
                      />
                    ) : (
                      <span aria-disabled="true" className="pointer-events-none opacity-50" />
                    )
                  }
                />
              </PaginationItem>

              {pageNumbers.map((item) =>
                typeof item === "string" ? (
                  <PaginationItem key={item}>
                    <PaginationEllipsis />
                  </PaginationItem>
                ) : (
                  <PaginationItem key={item}>
                    <PaginationLink
                      isActive={item === page}
                      render={
                        <Link from="/" search={(prev) => ({ ...prev, page: item })}>
                          {item}
                        </Link>
                      }
                    />
                  </PaginationItem>
                ),
              )}

              <PaginationItem>
                <PaginationNext
                  render={
                    page < totalPages ? (
                      <Link
                        from="/"
                        search={(prev) => ({ ...prev, page: page + 1 })}
                        aria-label="Go to next page"
                      />
                    ) : (
                      <span aria-disabled="true" className="pointer-events-none opacity-50" />
                    )
                  }
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        )}

        <div className="my-4 flex justify-center gap-4 px-4">
          <Link
            to="/dashboard"
            className="text-muted-foreground/72 hover:text-muted-foreground text-sm hover:underline"
          >
            Admin Dashboard
          </Link>

          <a
            className="text-muted-foreground/72 hover:text-muted-foreground text-sm hover:underline"
            href="https://github.com/keiko233/miku-ui-next/"
            target="_blank"
            rel="noreferrer"
          >
            Source Code
          </a>
        </div>
      </div>
    </Container>
  );
}

function getPageNumbers(
  current: number,
  total: number,
): Array<number | "ellipsis-start" | "ellipsis-end"> {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  const pages: Array<number | "ellipsis-start" | "ellipsis-end"> = [1];
  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);

  if (start > 2) pages.push("ellipsis-start");
  for (let i = start; i <= end; i++) pages.push(i);
  if (end < total - 1) pages.push("ellipsis-end");

  pages.push(total);
  return pages;
}
