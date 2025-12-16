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
  const [message, setMessage] = useState<string>();
  const [shouldStop, setShouldStop] = useState(false);

  const clearInterval = useInterval(
    async () => {
      const res = await getTaskById(taskId);

      if (res?.content) {
        setMessage(res.content);
      }

      if (res?.status !== TaskStatus.DOING) {
        setShouldStop(true);
        onFinish?.();
      }
    },
    shouldStop ? undefined : intervalTime ?? 3000,
  );

  return <p className="whitespace-pre-line font-mono">{message}</p>;
};
