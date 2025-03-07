"use client";

import {
  Button,
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@libnyanpasu/material-design-react";
import { useInterval, useLockFn } from "ahooks";
import { useState } from "react";
import { TaskStatus } from "@/schema";
import { getTaskById, initDatabase } from "./init-database-actions";

const MessagePolling = ({
  taskId,
  onFinish,
}: {
  taskId: string;
  onFinish: () => void;
}) => {
  const [message, setMessage] = useState<string[]>([]);

  const clearInterval = useInterval(async () => {
    const res = await getTaskById(taskId);

    if (res?.content) {
      if (res.content !== message[message.length - 1]) {
        setMessage((prev) => [...prev, res.content]);
      }
    }

    if (res?.status !== TaskStatus.DOING) {
      clearInterval();
      onFinish();
    }
  }, 3000);

  return message.map((msg, index) => <p key={index}>{msg}</p>);
};

export const InitDatabase = () => {
  const [loading, setLoading] = useState(false);

  const [message, setMessage] = useState<string>();

  const [taskId, setTaskId] = useState<string>();

  const handleClick = useLockFn(async () => {
    try {
      setLoading(true);
      const res = await initDatabase();

      setMessage(res.message);

      if (res.taskId) {
        setTaskId(res.taskId);
      }
    } catch (e) {
      console.error(e);
      setLoading(false);
    }
  });

  return (
    <Card>
      <CardHeader>Init Database</CardHeader>

      {(message || taskId) && (
        <CardContent className="gap-1">
          {taskId && <p>{taskId}</p>}
          {message && <p>{message}</p>}

          {taskId && (
            <MessagePolling
              taskId={taskId}
              onFinish={() => {
                setLoading(false);
              }}
            />
          )}
        </CardContent>
      )}

      <CardFooter>
        <Button variant="flat" loading={loading} onClick={handleClick}>
          Init Database
        </Button>
      </CardFooter>
    </Card>
  );
};
