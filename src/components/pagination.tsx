import { cn } from "@libnyanpasu/material-design-libs";
import { Button } from "@libnyanpasu/material-design-react";
import Link from "next/link";
import { ComponentProps } from "react";

export type PaginationProps = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export const Pagination = ({
  className,
  pagination,
  ...props
}: ComponentProps<"div"> & {
  pagination: PaginationProps;
}) => {
  return (
    <div
      className={cn("flex items-center justify-center gap-4", className)}
      {...props}
    >
      {pagination.page > 1 && (
        <Link
          href={{
            query: { page: pagination.page - 1 },
          }}
        >
          <Button variant="flat">Previous Page</Button>
        </Link>
      )}

      <p className="text-sm">
        Page: {pagination.page} / {pagination.totalPages}
      </p>

      {pagination.page < pagination.totalPages && (
        <Link
          href={{
            query: { page: pagination.page + 1 },
          }}
        >
          <Button variant="flat">Next Page</Button>
        </Link>
      )}
    </div>
  );
};
