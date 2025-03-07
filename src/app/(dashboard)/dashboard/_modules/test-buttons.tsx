"use client";

import {
  Button,
  Card,
  CardContent,
  CardHeader,
} from "@libnyanpasu/material-design-react";
import { useCallback, useTransition } from "react";
import { getLastPostId, parseTestContent } from "./test-actions";

const LastPostId = () => {
  const [isPending, startTransition] = useTransition();

  const handleLastPostId = useCallback(() => {
    startTransition(async () => {
      console.log(await getLastPostId());
    });
  }, [startTransition]);

  return (
    <Button loading={isPending} onClick={handleLastPostId} variant="stroked">
      Get LastPostId
    </Button>
  );
};

const ParseTextContent = () => {
  const [isPending, startTransition] = useTransition();

  const handleLastPostId = useCallback(() => {
    startTransition(async () => {
      console.log(await parseTestContent());
    });
  }, [startTransition]);

  return (
    <Button loading={isPending} onClick={handleLastPostId} variant="stroked">
      Parse Text Content
    </Button>
  );
};

export const TestButtons = () => {
  return (
    <Card>
      <CardHeader>Test Buttons</CardHeader>

      <CardContent className="flex-row flex-wrap">
        <LastPostId />

        <ParseTextContent />
      </CardContent>
    </Card>
  );
};
