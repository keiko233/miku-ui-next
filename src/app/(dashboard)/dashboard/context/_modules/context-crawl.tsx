"use client";

import {
  Button,
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  Input,
  Modal,
  ModalClose,
  ModalContent,
  ModalTitle,
  ModalTrigger,
} from "@libnyanpasu/material-design-react";
import { useLockFn, useMemoizedFn } from "ahooks";
import { useState, useTransition } from "react";
import { executeCrawl } from "@/actions/task/context-crawl";
import { getLastPostId } from "@/actions/telegram/post";
import { MessagePolling } from "@/components/message-polling";

const CONTEXT_CRAWL_TIPS =
  "Context Crawl process must run within Cloudflare Workers' WaitUntil, " +
  "the total task time needs to be kept under 30 seconds. So, it's best " +
  "not to dispatch too many tasks at once, even though we've already " +
  "implemented a concurrent workaround.";

const GetLastPostID = ({
  onFinish,
}: {
  onFinish: (lastPostId: number) => void;
}) => {
  const [isPending, startTransition] = useTransition();

  const handleClick = () => {
    startTransition(async () => {
      const id = await getLastPostId();

      if (id) {
        onFinish(id);
      }
    });
  };

  return (
    <Button loading={isPending} onClick={handleClick}>
      Get Last Post ID
    </Button>
  );
};

const ExecuteDialog = ({ from, to }: { from?: number; to?: number }) => {
  const [open, setOpen] = useState(false);

  const [pending, setPending] = useState(false);

  const [taskId, setTaskId] = useState<string>();

  const [isFinished, setIsFinished] = useState(false);

  const handleClick = useLockFn(async () => {
    if (!from || !to) {
      return;
    }
    try {
      setPending(true);
      const { taskId } = await executeCrawl(from, to);

      if (taskId) {
        setTaskId(taskId);
      }
    } catch (e) {
      console.error(e);
      setPending(false);
    }
  });

  const handleFinish = () => {
    setPending(false);
    setIsFinished(true);
  };

  const handleOpenChange = (v: boolean) => {
    setOpen(v);

    if (!v) {
      setPending(false);
      setTaskId(undefined);
      setIsFinished(false);
    }
  };

  return (
    <Modal open={open} onOpenChange={handleOpenChange}>
      <ModalTrigger asChild>
        <Button variant="flat">Execute</Button>
      </ModalTrigger>

      <ModalContent>
        <Card className="min-w-96 max-w-2xl">
          <CardHeader>
            <ModalTitle>Execute Crawl</ModalTitle>
          </CardHeader>

          <CardContent className="gap-1">
            {!taskId && (
              <p>
                Are you sure you want to crawl the content from {from} to {to}?
              </p>
            )}

            {taskId && (
              <MessagePolling taskId={taskId} onFinish={handleFinish} />
            )}
          </CardContent>

          <CardFooter className="gap-1">
            {!isFinished && (
              <Button variant="flat" loading={pending} onClick={handleClick}>
                Yes
              </Button>
            )}

            <ModalClose>Close</ModalClose>
          </CardFooter>
        </Card>
      </ModalContent>
    </Modal>
  );
};

export const ContentCrawl = () => {
  const [lastPostId, setLastPostId] = useState<number>();

  const [from, setFrom] = useState<number>();

  const [to, setTo] = useState<number>();

  const handleChangeLastPostId = useMemoizedFn((id: number) => {
    setLastPostId(id);

    if (!from) {
      setFrom(id);
    }

    if (!to) {
      setTo(id);
    }
  });

  return (
    <Card>
      <CardHeader>Context Crawl</CardHeader>

      <CardContent>
        <p className="text-sm text-zinc-700 dark:text-zinc-300">
          {CONTEXT_CRAWL_TIPS}
        </p>

        <Input
          type="number"
          placeholder="Starting from which Post ID"
          label="From"
          value={from}
          onChange={(e) => setFrom(parseInt(e.target.value))}
        />

        <Input
          type="number"
          placeholder="Ending to which Post ID"
          label="To"
          value={to}
          onChange={(e) => setTo(parseInt(e.target.value))}
        />

        {lastPostId && (
          <p className="text-sm text-zinc-700 dark:text-zinc-300">
            Last Post ID: {lastPostId}
          </p>
        )}
      </CardContent>

      <CardFooter className="gap-1">
        <ExecuteDialog from={from} to={to} />

        <GetLastPostID onFinish={handleChangeLastPostId} />
      </CardFooter>
    </Card>
  );
};
