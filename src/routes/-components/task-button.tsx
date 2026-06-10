"use client";

import { useState } from "react";

import { getTasksWithLimit } from "@/actions/query/tasks";
import { Badge } from "@/components/ui/badge";
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
import { ScrollArea } from "@/components/ui/scroll-area";
import { Spinner } from "@/components/ui/spinner";
import { TaskStatus } from "@/schema";

const TaskStatusMapping: Record<TaskStatus, React.ReactNode> = {
  [TaskStatus.TODO]: <Badge variant="secondary">TODO</Badge>,
  [TaskStatus.DOING]: <Badge variant="warning">DOING</Badge>,
  [TaskStatus.DONE]: <Badge variant="success">DONE</Badge>,
  [TaskStatus.FAILED]: <Badge variant="destructive">FAILED</Badge>,
};

export const TaskButton = () => {
  const [open, setOpen] = useState(false);
  const [tasks, setTasks] = useState<
    Array<{
      id: string;
      title: string;
      content: string;
      status: TaskStatus;
      updatedAt: number;
    }>
  >([]);
  const [loading, setLoading] = useState(false);

  const handleOpenChange = async (next: boolean) => {
    setOpen(next);
    if (!next) {
      setTasks([]);
      return;
    }
    setLoading(true);
    try {
      const result = await getTasksWithLimit({ data: { limit: 3 } });
      setTasks(result as never);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger render={<Button variant="ghost">Tasks</Button>} />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Server Tasks Queue</DialogTitle>
          <DialogDescription>Only the three most recent queues are displayed.</DialogDescription>
        </DialogHeader>

        <DialogPanel>
          <ScrollArea className="h-72">
            {loading && (
              <div className="flex items-center gap-2 p-2">
                <Spinner />
                <span>Loading…</span>
              </div>
            )}
            {tasks.map((task) => (
              <div key={task.id} className="flex items-center justify-between p-2">
                <div>
                  <p className="flex items-center gap-1">
                    <span>{task.title}</span>
                    <code className="text-xs">{new Date(task.updatedAt).toLocaleString()}</code>
                  </p>
                  <p>{task.content}</p>
                </div>
                {TaskStatusMapping[task.status]}
              </div>
            ))}
          </ScrollArea>
        </DialogPanel>

        <DialogFooter variant="bare">
          <DialogClose render={<Button variant="outline">Close</Button>} />
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
