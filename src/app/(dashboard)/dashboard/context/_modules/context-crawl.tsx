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
  const [pending, setPending] = useState(false);

  const [taskId, setTaskId] = useState<string>();

  const [message, setMessage] = useState<string>();

  const handleClick = useLockFn(async () => {
    if (!from || !to) {
      return;
    }
    try {
      setPending(true);
      const { message, taskId } = await executeCrawl(from, to);

      setMessage(message);

      if (taskId) {
        setTaskId(taskId);
      }
    } catch (e) {
      console.error(e);
      setPending(false);
    }
  });

  return (
    <Modal>
      <ModalTrigger asChild>
        <Button variant="flat">Execute</Button>
      </ModalTrigger>

      <ModalContent>
        <Card className="w-96">
          <CardHeader>
            <ModalTitle>Execute Crawl</ModalTitle>
          </CardHeader>

          <CardContent className="gap-1">
            {message ? (
              <p>{message}</p>
            ) : (
              <p>
                Are you sure you want to crawl the content from {from} to {to}?
              </p>
            )}

            {taskId && (
              <MessagePolling
                taskId={taskId}
                onFinish={() => {
                  setPending(false);
                }}
              />
            )}
          </CardContent>

          <CardFooter className="gap-1">
            <Button variant="flat" loading={pending} onClick={handleClick}>
              Yes
            </Button>

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
