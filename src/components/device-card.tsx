import {
  Button,
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@libnyanpasu/material-design-react";
import Image from "next/image";
import { Device } from "@/schema";

export const DeviceCard = ({ device }: { device: Device }) => {
  const Mapping = {
    "Miku UI": device.version,
    Android: device.androidVersion,
    Status: device.status,
    SELinux: device.selinuxStatus,
    "Kernel SU": device.kernelsuVersion,
    "Update Date": new Date(device.updatedAt).toDateString(),
  };

  return (
    <Card key={device.id} className="shadow">
      <div className="grid h-48 place-items-center bg-white">
        <Image
          src={`/devices/${device.codename.toLocaleLowerCase()}.png`}
          width={192}
          height={192}
          alt="banner"
        />
      </div>

      <CardHeader className="drop-shadow-xs">
        <h2>
          {device.name}
          <span className="text-on-surface-variant/50"> / </span>
          {device.codename}
        </h2>
      </CardHeader>

      <CardContent className="gap-0.5 text-sm">
        {Object.entries(Mapping).map(([key, value]) => (
          <div key={key} className="flex gap-2 whitespace-nowrap">
            <b className="w-24">{key}:</b> <span>{value}</span>
          </div>
        ))}
      </CardContent>

      <CardFooter className="gap-1">
        <Button>Download</Button>

        <Button>Detail</Button>
      </CardFooter>
    </Card>
  );
};
