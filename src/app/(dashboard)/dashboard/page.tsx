import { cn } from "@libnyanpasu/material-design-libs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@libnyanpasu/material-design-react";
import { getDevices } from "@/actions/query/devices";
import { Pagination } from "@/components/pagination";
import { TableActions } from "./_modules/table-actions";

export const dynamic = "force-dynamic";

export default async function Page() {
  const { devices, pagination } = await getDevices();

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
        {/* <ContentCrawl /> */}
      </div>

      <Table variant="stroked" className="caption-bottom">
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

                <TableCell>
                  {new Date(item.publishAt).toLocaleString()}
                </TableCell>

                <TableCell>
                  {new Date(item.createdAt).toLocaleString()}
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

      <Pagination pagination={pagination} />
    </div>
  );
}
