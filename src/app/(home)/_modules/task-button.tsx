"use server";

import { cn } from "@libnyanpasu/material-design-libs";
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
import { PropsWithChildren } from "react";
import { getTasksWithLimit } from "@/actions/query/tasks";
import { TaskStatus } from "@/schema";

const Badge = ({
  children,
  className,
}: PropsWithChildren & {
  className?: string;
}) => (
  <span
    className={cn(
      "bg-primary text-on-primary rounded-full px-2 py-1 text-sm",
      className,
    )}
  >
    {children}
  </span>
);

export const TaskButton = async () => {
  const query = await getTasksWithLimit(3);

  const TaskStatusMapping = {
    [TaskStatus.TODO]: <Badge className="bg-slate-500">TODO</Badge>,
    [TaskStatus.DOING]: <Badge>DOING</Badge>,
    [TaskStatus.DONE]: <Badge className="bg-green-500">DONE</Badge>,
    [TaskStatus.FAILED]: <Badge className="bg-red-500">FAILED</Badge>,
  };

  return (
    <Modal>
      <ModalTrigger asChild>
        <Button variant="flat">Tasks</Button>
      </ModalTrigger>

      <ModalContent>
        <Card className="w-96">
          <CardHeader>
            <ModalTitle>Server Tasks Queue</ModalTitle>
          </CardHeader>

          <CardContent>
            <p className="text-zinc-500">
              Only the three most recent queues are displayed.
            </p>

            {query.map((task) => (
              <div key={task.id} className="flex items-center justify-between">
                <div>
                  <p className="flex items-center gap-1">
                    <span>{task.title}</span>
                    <code className="text-xs">
                      {new Date(task.updatedAt).toLocaleString()}
                    </code>
                  </p>
                  <p>{task.content}</p>
                </div>

                {TaskStatusMapping[task.status]}
              </div>
            ))}
          </CardContent>

          <CardFooter>
            <ModalClose variant="flat">Close</ModalClose>
          </CardFooter>
        </Card>
      </ModalContent>
    </Modal>
  );
};
