import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Device } from "@/schema";

import { DeviceInfo } from "./device-info";

const DetailsDialog = ({ device }: { device: Device }) => {
  return (
    <Dialog>
      <DialogTrigger render={<Button variant="outline">Details</Button>} />

      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {device.name} {device.version}
          </DialogTitle>
          <DialogDescription>View full device details</DialogDescription>
        </DialogHeader>

        <DialogPanel>
          <DeviceInfo device={device} />
        </DialogPanel>

        <DialogFooter variant="bare">
          <DialogClose render={<Button variant="outline">Close</Button>} />
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export const DeviceCard = ({ device }: { device: Device }) => {
  const mapping = {
    "Miku UI": device.version,
    Android: device.androidVersion,
    Status: device.status,
    SELinux: device.selinuxStatus,
    "Kernel SU": device.kernelsuVersion,
    "Publish Date": new Date(device.publishAt).toDateString(),
  };

  return (
    <Card className="overflow-clip">
      <div className="flex h-48 justify-center bg-white">
        <img
          src={`/devices/${device.codename.toLocaleLowerCase()}.png`}
          width={192}
          height={192}
          alt={device.name}
          loading="lazy"
          decoding="async"
        />
      </div>

      <CardHeader>
        <CardTitle>
          {device.name}
          <span className="text-muted-foreground/72"> / </span>
          <code>{device.codename}</code>
        </CardTitle>
      </CardHeader>

      <CardContent className="gap-0.5 text-sm">
        {Object.entries(mapping).map(([key, value]) => (
          <div key={key} className="flex gap-2 whitespace-nowrap">
            <b className="w-24">{key}:</b> <span>{value}</span>
          </div>
        ))}
      </CardContent>

      <CardFooter className="gap-1">
        <a href={device.sourcforgeUrl} target="_blank" rel="noreferrer">
          <Button>Download</Button>
        </a>

        <DetailsDialog device={device} />
      </CardFooter>
    </Card>
  );
};
