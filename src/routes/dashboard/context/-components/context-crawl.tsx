"use client";

import { useLockFn, useMemoizedFn } from "ahooks";
import { useEffect, useRef, useState, useTransition } from "react";

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

const parseContextId = (s: string): number | undefined => {
  const n = parseInt(s, 10);
  return Number.isNaN(n) ? undefined : n;
};

const GetLastPostIdButton = ({ onFinish }: { onFinish: (id: number) => void }) => {
  const [isPending, startTransition] = useTransition();

  const handleClick = () => {
    startTransition(async () => {
      const id = await getLastPostId();
      if (id) onFinish(id);
    });
  };

  return (
    <Button onClick={handleClick} disabled={isPending} variant="outline">
      {isPending ? <Spinner /> : "Get Latest Post ID"}
    </Button>
  );
};

const ExecuteDialog = ({
  from,
  to,
  onComplete,
}: {
  from?: number;
  to?: number;
  onComplete: () => void;
}) => {
  const [open, setOpen] = useState(false);
  const [currentId, setCurrentId] = useState<number>();
  const [pending, setPending] = useState(false);
  const [taskIds, setTaskIds] = useState<string[]>([]);
  const [isFinished, setIsFinished] = useState(false);

  // Refs guard async callbacks. handleFinish is invoked by MessagePolling's
  // setInterval (3s), which may outlive the render that started the crawl.
  // Reading via refs guarantees we use the from/to/currentId values that
  // were current at the moment the user clicked Yes — not a stale closure.
  const fromRef = useRef(from);
  const toRef = useRef(to);
  const currentIdRef = useRef(currentId);
  const onCompleteRef = useRef(onComplete);
  useEffect(() => {
    fromRef.current = from;
  }, [from]);
  useEffect(() => {
    toRef.current = to;
  }, [to]);
  useEffect(() => {
    currentIdRef.current = currentId;
  }, [currentId]);
  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  const canStart = from !== undefined && to !== undefined && from <= to;

  const handleStart = useLockFn(async () => {
    const f = fromRef.current;
    const t = toRef.current;
    if (!f || !t || f > t) return;
    setPending(true);
    setIsFinished(false);
    setCurrentId(f);
    try {
      const { taskId } = await executeCrawl({ data: { postId: f } });
      if (taskId) setTaskIds((prev) => [...prev, taskId]);
    } catch (e) {
      console.error(e);
      setPending(false);
    }
  });

  const handleFinish = useMemoizedFn(async () => {
    const t = toRef.current;
    const cur = currentIdRef.current;
    if (cur === undefined || t === undefined) return;
    if (cur >= t) {
      setPending(false);
      setIsFinished(true);
      onCompleteRef.current();
      return;
    }
    const nextId = cur + 1;
    setCurrentId(nextId);
    const { taskId } = await executeCrawl({ data: { postId: nextId } });
    if (taskId) setTaskIds((prev) => [...prev, taskId]);
  });

  const handleOpenChange = (v: boolean) => {
    setOpen(v);
    // Only clear in-dialog state once the entire crawl has finished. If the
    // user hides the dialog mid-crawl, keep the task list and progress; the
    // server-side tasks continue, and re-opening resumes polling.
    if (!v && isFinished) {
      setTaskIds([]);
      setCurrentId(undefined);
      setIsFinished(false);
      setPending(false);
    }
  };

  const total = from !== undefined && to !== undefined ? to - from + 1 : 0;
  const done = isFinished
    ? total
    : currentId !== undefined && from !== undefined
      ? currentId - from
      : 0;
  const progress = total > 0 ? Math.min(Math.max(done / total, 0), 1) : 0;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger render={<Button variant="outline">Execute</Button>} />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Execute Context Crawl</DialogTitle>
          <DialogDescription>
            {canStart
              ? `Are you sure you want to crawl Context ${from} to ${to}?`
              : "Please set valid From and To Context IDs (From must be ≤ To)."}
          </DialogDescription>
        </DialogHeader>

        <DialogPanel>
          {currentId !== undefined && from !== undefined && to !== undefined && (
            <div className="mb-3 space-y-1">
              <p className="text-muted-foreground text-sm">
                Crawled {done} / {total} contexts
                {pending && !isFinished && ` (crawling Context ${currentId})`}
              </p>
              <div className="bg-muted h-1.5 w-full overflow-hidden rounded">
                <div
                  className="bg-primary h-full transition-all"
                  style={{ width: `${progress * 100}%` }}
                />
              </div>
            </div>
          )}

          {pending && !isFinished && (
            <p className="text-muted-foreground mb-2 text-xs italic">
              You can hide this dialog — the crawl continues server-side. Re-open to resume polling.
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
            <Button onClick={handleStart} disabled={pending || !canStart}>
              {pending ? <Spinner /> : "Yes, start"}
            </Button>
          )}
          <DialogClose
            render={<Button variant="outline">{pending && !isFinished ? "Hide" : "Close"}</Button>}
          />
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export const ContextCrawlCard = ({ latestContextIndex }: { latestContextIndex: number | null }) => {
  const [from, setFrom] = useState<number>();
  const [to, setTo] = useState<number>();
  const [userEdited, setUserEdited] = useState(false);

  const handleSetLastPostId = useMemoizedFn((id: number) => {
    if (userEdited) {
      const ok = window.confirm(
        `Replace the current From/To values with the latest Post ID (${id})?`,
      );
      if (!ok) return;
    }
    setFrom(id);
    setTo(id);
    setUserEdited(false);
  });

  const handleFromChange = (v: number | undefined) => {
    setFrom(v);
    setUserEdited(true);
  };
  const handleToChange = (v: number | undefined) => {
    setTo(v);
    setUserEdited(true);
  };

  const handleComplete = useMemoizedFn(() => {
    setUserEdited(false);
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Context Crawl</CardTitle>
        <CardDescription>{CONTEXT_CRAWL_TIPS}</CardDescription>
      </CardHeader>

      <CardContent>
        <div className="space-y-3">
          {latestContextIndex !== null && (
            <p className="text-muted-foreground text-sm">
              Latest Context ID in DB: <span className="font-mono">{latestContextIndex}</span>
            </p>
          )}
          <div>
            <label htmlFor="crawl-from" className="mb-1 block text-sm font-medium">
              From
            </label>
            <Input
              id="crawl-from"
              type="number"
              min={1}
              placeholder="Starting Context ID"
              value={from ?? ""}
              onChange={(e) =>
                handleFromChange(e.target.value ? parseContextId(e.target.value) : undefined)
              }
            />
          </div>
          <div>
            <label htmlFor="crawl-to" className="mb-1 block text-sm font-medium">
              To
            </label>
            <Input
              id="crawl-to"
              type="number"
              min={1}
              placeholder="Ending Context ID"
              value={to ?? ""}
              onChange={(e) =>
                handleToChange(e.target.value ? parseContextId(e.target.value) : undefined)
              }
            />
          </div>
          <p className="text-muted-foreground text-xs">
            Context ID equals the Telegram post ID on the channel.
          </p>
        </div>
      </CardContent>

      <CardFooter className="gap-2">
        <ExecuteDialog from={from} to={to} onComplete={handleComplete} />
        <GetLastPostIdButton onFinish={handleSetLastPostId} />
      </CardFooter>
    </Card>
  );
};
