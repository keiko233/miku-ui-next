"use client";

import { useInterval } from "ahooks";
import { useState } from "react";
import { getTaskById } from "@/actions/query/tasks";
import { TaskStatus } from "@/schema";

export const MessagePolling = ({
  taskId,
  onFinish,
  intervalTime,
}: {
  taskId: string;
  onFinish?: () => void;
  intervalTime?: number;
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
      onFinish?.();
    }
  }, intervalTime ?? 3000);

  return message.map((msg, index) => <p key={index}>{msg}</p>);
};
