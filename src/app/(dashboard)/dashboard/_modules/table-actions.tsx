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
import MaterialSymbolsDeleteForeverRounded from "~icons/material-symbols/delete-forever-rounded";
import { DeviceInfo } from "@/components/device-info";
import { Device } from "@/schema";
import { deleteDevice } from "@/actions/query/devices";
import { revalidatePath } from "next/cache";

const DetialsButton = ({ data }: { data: Device }) => {
  const Mapping = {
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
    <Modal>
      <ModalTrigger asChild>
        <Button variant="stroked">Details</Button>
      </ModalTrigger>

      <ModalContent>
        <Card className="max-w-5xl">
          <CardHeader>
            <ModalTitle>
              {data.name} {data.version}
            </ModalTitle>
          </CardHeader>

          <CardContent className="text-sm">
            <div className="flex flex-col gap-0.5">
              {Object.entries(Mapping).map(([key, value]) => (
                <div key={key} className="flex gap-2 whitespace-nowrap">
                  <b className="w-28">{key}:</b> <span>{value}</span>
                </div>
              ))}
            </div>

            <DeviceInfo device={data} />
          </CardContent>

          <CardFooter className="gap-1">
            <ModalClose>Close</ModalClose>
          </CardFooter>
        </Card>
      </ModalContent>
    </Modal>
  );
};

const DeleteButton = ({ data }: { data: Device }) => {
  const handleClick = async () => {
    "use server";

    await deleteDevice(data.id);

    revalidatePath("/");
  }

  return (
    <Button icon variant="stroked">
      <MaterialSymbolsDeleteForeverRounded onClick={handleClick} />
    </Button>
  );
};

export const TableActions = ({ data }: { data: Device }) => {
  return (
    <div className="flex gap-2">
      <DetialsButton data={data} />

      <DeleteButton data={data} />
    </div>
  );
};
