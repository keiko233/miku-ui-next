"use client";

import { useRouter } from "@tanstack/react-router";
import { useState } from "react";
import MaterialSymbolsDeleteForeverRounded from "~icons/material-symbols/delete-forever-rounded";

import { deleteDevice } from "@/actions/query/devices";
import { DeviceInfo } from "@/components/device-info";
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
import { Spinner } from "@/components/ui/spinner";
import { Device } from "@/schema";

const DetailsDialog = ({ data }: { data: Device }) => {
  const mapping = {
    ID: data.id,
    "Miku UI": data.version,
    Android: data.androidVersion,
    Status: data.status,
    SELinux: data.selinuxStatus,
    "Kernel SU": data.kernelsuVersion,
    "Publish Date": new Date(data.publishAt).toDateString(),
    "Created Date": new Date(data.createdAt).toDateString(),
    "Updated Date": new Date(data.updatedAt).toDateString(),
  };

  return (
    <Dialog>
      <DialogTrigger render={<Button variant="outline">Details</Button>} />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {data.name} {data.version}
          </DialogTitle>
          <DialogDescription>Full device record</DialogDescription>
        </DialogHeader>

        <DialogPanel>
          <div className="flex flex-col gap-0.5 text-sm">
            {Object.entries(mapping).map(([key, value]) => (
              <div key={key} className="flex gap-2 whitespace-nowrap">
                <b className="w-28">{key}:</b> <span>{value}</span>
              </div>
            ))}
            <DeviceInfo device={data} />
          </div>
        </DialogPanel>

        <DialogFooter variant="bare">
          <DialogClose render={<Button variant="outline">Close</Button>} />
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

const DeleteButton = ({ data }: { data: Device }) => {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  const handleClick = async () => {
    setPending(true);
    try {
      await deleteDevice({ data: { id: data.id } });
      await router.invalidate();
    } finally {
      setPending(false);
    }
  };

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={handleClick}
      disabled={pending}
      aria-label="Delete device"
    >
      {pending ? <Spinner /> : <MaterialSymbolsDeleteForeverRounded />}
    </Button>
  );
};

export const TableActions = ({ data }: { data: Device }) => {
  return (
    <div className="flex gap-2">
      <DetailsDialog data={data} />
      <DeleteButton data={data} />
    </div>
  );
};
