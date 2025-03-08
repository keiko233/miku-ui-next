import { cn } from "@libnyanpasu/material-design-libs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@libnyanpasu/material-design-react";
import { getContexts } from "@/actions/query/context";
import { ContentCrawl } from "./_modules/context-crawl";
import { TableActions } from "./_modules/table-actions";

export const dynamic = "force-dynamic";

export default async function Page() {
  const query = await getContexts();

  return (
    <div className="flex flex-col gap-4">
      <div
        className={cn(
          "grid gap-4",
          "md:grid-cols-3",
          "sm:grid-cols-2",
          "grid-cols-1",
        )}
      >
        <ContentCrawl />
      </div>

      <Table variant="stroked" className="caption-bottom">
        <TableHeader>
          <TableRow>
            <TableHead className="w-24">Index</TableHead>
            <TableHead>Content</TableHead>
            <TableHead>Update At</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>

        {query.length ? (
          <TableBody>
            {query.map((item) => (
              <TableRow key={item.id}>
                <TableCell>{item.index}</TableCell>

                <TableCell className="truncate">
                  {item.content.length > 60
                    ? `${item.content.substring(0, 60)}...`
                    : item.content}
                </TableCell>

                <TableCell className="whitespace-nowrap">
                  {new Date(item.updatedAt).toLocaleString()}
                </TableCell>

                <TableCell>
                  <TableActions data={item} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        ) : (
          <caption>
            <div className="flex h-40 flex-col items-center justify-center gap-4 py-8">
              <p>No data</p>
            </div>
          </caption>
        )}
      </Table>
    </div>
  );
}
