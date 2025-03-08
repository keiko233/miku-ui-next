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
import { Context } from "@/schema";

const DetialsButton = ({ data }: { data: Context }) => {
  const Mapping = {
    ID: data.id,
    Index: data.index,
    "Create Date": new Date(data.createdAt).toDateString(),
    "Update Date": new Date(data.updatedAt).toDateString(),
  };

  return (
    <Modal>
      <ModalTrigger asChild>
        <Button variant="stroked">Details</Button>
      </ModalTrigger>

      <ModalContent>
        <Card className="max-w-5xl">
          <CardHeader>
            <ModalTitle>Context {data.index} Details</ModalTitle>
          </CardHeader>

          <CardContent className="gap-0.5 text-sm">
            {Object.entries(Mapping).map(([key, value]) => (
              <div key={key} className="flex gap-2 whitespace-nowrap">
                <b className="w-24">{key}:</b> <span>{value}</span>
              </div>
            ))}

            <div className="border-surface mt-2 rounded-2xl border p-2 whitespace-break-spaces">
              {data.content}
            </div>
          </CardContent>

          <CardFooter className="gap-1">
            <ModalClose>Close</ModalClose>
          </CardFooter>
        </Card>
      </ModalContent>
    </Modal>
  );
};

export const TableActions = ({ data }: { data: Context }) => {
  return (
    <div className="flex gap-2">
      <DetialsButton data={data} />
    </div>
  );
};
