"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogPanel,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Context } from "@/schema";

const DetailsDialog = ({ data }: { data: Context }) => {
  const mapping = {
    ID: data.id,
    Index: data.index,
    "Create Date": new Date(data.createdAt).toDateString(),
    "Update Date": new Date(data.updatedAt).toDateString(),
  };

  return (
    <Dialog>
      <DialogTrigger render={<Button variant="outline">Details</Button>} />

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Context {data.index} Details</DialogTitle>
          <DialogDescription>View the raw crawled content</DialogDescription>
        </DialogHeader>

        <DialogPanel>
          <div className="flex flex-col gap-0.5 text-sm">
            {Object.entries(mapping).map(([key, value]) => (
              <div key={key} className="flex gap-2 whitespace-nowrap">
                <b className="w-24">{key}:</b> <span>{value}</span>
              </div>
            ))}

            <div className="border-border mt-2 rounded-2xl border p-2 whitespace-break-spaces">
              {data.content}
            </div>
          </div>
        </DialogPanel>

        <DialogFooter variant="bare">
          <DialogClose render={<Button variant="outline">Close</Button>} />
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export const TableActions = ({ data }: { data: Context }) => {
  return (
    <div className="flex gap-2">
      <DetailsDialog data={data} />
    </div>
  );
};
