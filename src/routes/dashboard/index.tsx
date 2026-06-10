import { createFileRoute, Link } from "@tanstack/react-router";
import { z } from "zod";

import { getDevices } from "@/actions/query/devices";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { TableActions } from "@/routes/dashboard/-components/table-actions";

const searchSchema = z.object({
  page: z.number().int().positive().default(1),
  size: z.number().int().positive().default(10),
});

export const Route = createFileRoute("/dashboard/")({
  validateSearch: searchSchema,
  loaderDeps: ({ search }) => search,
  loader: async ({ deps }) => getDevices({ data: { page: deps.page, limit: deps.size } }),
  component: DashboardIndex,
});

function DashboardIndex() {
  const { devices, pagination } = Route.useLoaderData();
  const { page, totalPages } = pagination;

  const pageNumbers = getPageNumbers(page, totalPages);

  return (
    <div className="flex flex-col gap-4">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Device Name</TableHead>
            <TableHead>Codename</TableHead>
            <TableHead>Miku UI</TableHead>
            <TableHead>Publish Date</TableHead>
            <TableHead>Created Date</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        {devices.length ? (
          <TableBody>
            {devices.map((item) => (
              <TableRow key={item.id}>
                <TableCell className="truncate">{item.name}</TableCell>
                <TableCell className="font-mono">{item.codename}</TableCell>
                <TableCell>
                  {item.version} ({item.androidVersion})
                </TableCell>
                <TableCell>{new Date(item.publishAt).toLocaleString()}</TableCell>
                <TableCell>{new Date(item.createdAt).toLocaleString()}</TableCell>
                <TableCell>
                  <TableActions data={item} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        ) : (
          <TableCaption>
            <div className="flex h-40 flex-col items-center justify-center gap-4 py-8">
              <p>No data</p>
            </div>
          </TableCaption>
        )}
      </Table>

      {totalPages > 1 && (
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                render={
                  page > 1 ? (
                    <Link
                      from="/dashboard/"
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
                      <Link from="/dashboard/" search={(prev) => ({ ...prev, page: item })}>
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
                      from="/dashboard/"
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
    </div>
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
