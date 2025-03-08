import {
  Button,
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  Modal,
  ModalClose,
  ModalContent,
  ModalTitle,
  ModalTrigger,
} from "@libnyanpasu/material-design-react";
import Image from "next/image";
import { Device } from "@/schema";
import { DeviceInfo } from "./device-info";

const DetialsDialog = ({ device }: { device: Device }) => {
  return (
    <Modal>
      <ModalTrigger asChild>
        <Button>Details</Button>
      </ModalTrigger>

      <ModalContent>
        <Card className="w-96">
          <CardHeader>
            <ModalTitle>
              {device.name} {device.version}
            </ModalTitle>
          </CardHeader>

          <CardContent>
            <DeviceInfo device={device} />
          </CardContent>

          <CardFooter className="gap-1">
            <ModalClose>Close</ModalClose>
          </CardFooter>
        </Card>
      </ModalContent>
    </Modal>
  );
};

export const DeviceCard = ({ device }: { device: Device }) => {
  const Mapping = {
    "Miku UI": device.version,
    Android: device.androidVersion,
    Status: device.status,
    SELinux: device.selinuxStatus,
    "Kernel SU": device.kernelsuVersion,
    "Publish Date": new Date(device.publishAt).toDateString(),
  };

  // TODO: Image as transparent resource
  return (
    <Card key={device.id} className="overflow-clip shadow">
      <div className="flex h-48 justify-center bg-white">
        <Image
          src={`/devices/${device.codename.toLocaleLowerCase()}.png`}
          width={192}
          height={192}
          alt={`${device.name} device image`}
        />
      </div>

      <CardHeader className="drop-shadow-xs">
        <h2>
          {device.name}
          <span className="text-on-surface-variant/50"> / </span>
          <code>{device.codename}</code>
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
        <a href={device.sourcforgeUrl} target="_blank">
          <Button>Download</Button>
        </a>

        <DetialsDialog device={device} />
      </CardFooter>
    </Card>
  );
};
