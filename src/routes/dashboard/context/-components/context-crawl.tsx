"use client";

import { useLockFn, useMemoizedFn } from "ahooks";
import { useState, useTransition } from "react";

import { executeCrawl } from "@/actions/task/context-crawl";
import { getLastPostId } from "@/actions/telegram/post";
import { MessagePolling } from "@/components/message-polling";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";

const CONTEXT_CRAWL_TIPS =
  "Context Crawl process must run within Cloudflare Workers' WaitUntil, " +
  "the total task time needs to be kept under 30 seconds. So, it's best " +
  "not to dispatch too many tasks at once, even though we've already " +
  "implemented a concurrent workaround.";

const GetLastPostID = ({ onFinish }: { onFinish: (lastPostId: number) => void }) => {
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
    <Button onClick={handleClick} disabled={isPending}>
      {isPending ? <Spinner /> : "Get Last Post ID"}
    </Button>
  );
};

const ExecuteDialog = ({ from, to }: { from?: number; to?: number }) => {
  const [open, setOpen] = useState(false);
  const [currentPostId, setCurrentPostId] = useState<number>();
  const [pending, setPending] = useState(false);
  const [taskIds, setTaskIds] = useState<string[]>([]);
  const [isFinished, setIsFinished] = useState(false);

  const handleClick = useLockFn(async () => {
    if (!from || !to || from > to) return;
    try {
      setPending(true);
      setCurrentPostId(from);
      const { taskId } = await executeCrawl({ data: { postId: from } });
      if (taskId) setTaskIds((prev) => [...prev, taskId]);
    } catch (e) {
      console.error(e);
      setPending(false);
    }
  });

  const handleFinish = async () => {
    if (currentPostId === to) {
      setPending(false);
      setIsFinished(true);
      return;
    }
    if (currentPostId) {
      const nextPostId = currentPostId + 1;
      setCurrentPostId(nextPostId);
      const { taskId } = await executeCrawl({ data: { postId: nextPostId } });
      if (taskId) setTaskIds((prev) => [...prev, taskId]);
    }
  };

  const handleOpenChange = (v: boolean) => {
    setOpen(v);
    if (!v) {
      setPending(false);
      setTaskIds([]);
      setIsFinished(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger render={<Button variant="outline">Execute</Button>} />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Execute Crawl</DialogTitle>
          <DialogDescription>
            Are you sure you want to crawl the content from {from} to {to}?
          </DialogDescription>
        </DialogHeader>

        <DialogPanel>
          {currentPostId && (
            <p className="text-muted-foreground mb-2 text-sm">
              Current Post: {currentPostId} / {to}
            </p>
          )}

          <div className="max-h-96 divide-y overflow-y-auto">
            {taskIds.map((id) => (
              <MessagePolling key={id} taskId={id} onFinish={handleFinish} />
            ))}
          </div>
        </DialogPanel>

        <DialogFooter variant="bare">
          {!isFinished && (
            <Button onClick={handleClick} disabled={pending}>
              {pending ? <Spinner /> : "Yes"}
            </Button>
          )}
          <DialogClose render={<Button variant="outline">Close</Button>} />
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export const ContentCrawl = () => {
  const [lastPostId, setLastPostId] = useState<number>();
  const [from, setFrom] = useState<number>();
  const [to, setTo] = useState<number>();

  const handleChangeLastPostId = useMemoizedFn((id: number) => {
    setLastPostId(id);
    if (!from) setFrom(id);
    if (!to) setTo(id);
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Context Crawl</CardTitle>
        <CardDescription>{CONTEXT_CRAWL_TIPS}</CardDescription>
      </CardHeader>

      <CardContent>
        <div className="space-y-3">
          <div>
            <label htmlFor="crawl-from" className="mb-1 block text-sm font-medium">
              From
            </label>
            <Input
              id="crawl-from"
              type="number"
              placeholder="Starting from which Post ID"
              value={from ?? ""}
              onChange={(e) => setFrom(e.target.value ? parseInt(e.target.value) : undefined)}
            />
          </div>
          <div>
            <label htmlFor="crawl-to" className="mb-1 block text-sm font-medium">
              To
            </label>
            <Input
              id="crawl-to"
              type="number"
              placeholder="Ending to which Post ID"
              value={to ?? ""}
              onChange={(e) => setTo(e.target.value ? parseInt(e.target.value) : undefined)}
            />
          </div>
          {lastPostId && (
            <p className="text-muted-foreground text-sm">Last Post ID: {lastPostId}</p>
          )}
        </div>
      </CardContent>

      <CardFooter className="gap-2">
        <ExecuteDialog from={from} to={to} />
        <GetLastPostID onFinish={handleChangeLastPostId} />
      </CardFooter>
    </Card>
  );
};
