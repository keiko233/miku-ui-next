import { createFileRoute, Link } from "@tanstack/react-router";
import { z } from "zod";

import { getContexts } from "@/actions/query/context";
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
import { ContentCrawl } from "@/routes/dashboard/context/-components/context-crawl";
import { TableActions } from "@/routes/dashboard/context/-components/table-actions";

const searchSchema = z.object({
  page: z.number().int().positive().default(1),
  size: z.number().int().positive().default(10),
});

export const Route = createFileRoute("/dashboard/context")({
  validateSearch: searchSchema,
  loaderDeps: ({ search }) => search,
  loader: async ({ deps }) => getContexts({ data: { page: deps.page, limit: deps.size } }),
  component: ContextPage,
});

function ContextPage() {
  const { contexts, pagination } = Route.useLoaderData();
  const { page, totalPages } = pagination;

  const pageNumbers = getPageNumbers(page, totalPages);

  return (
    <div className="flex flex-col gap-4">
      <ContentCrawl />

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-24">Index</TableHead>
            <TableHead>Content</TableHead>
            <TableHead>Update At</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        {contexts.length ? (
          <TableBody>
            {contexts.map((item) => (
              <TableRow key={item.id}>
                <TableCell>{item.index}</TableCell>
                <TableCell className="truncate">
                  {item.content.length > 60 ? `${item.content.substring(0, 60)}...` : item.content}
                </TableCell>
                <TableCell>{new Date(item.updatedAt).toLocaleString()}</TableCell>
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
                      from="/dashboard/context"
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
                      <Link from="/dashboard/context" search={(prev) => ({ ...prev, page: item })}>
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
                      from="/dashboard/context"
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
