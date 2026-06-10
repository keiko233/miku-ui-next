"use client";

import { useLockFn } from "ahooks";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { signIn } from "@/lib/auth-client";

export const GitHub = () => {
  const [loading, setLoading] = useState(false);

  const handleClick = useLockFn(async () => {
    setLoading(true);
    try {
      await signIn.social({
        provider: "github",
        callbackURL: "/dashboard",
      });
    } catch (error) {
      setLoading(false);
      console.error(error);
    }
  });

  return (
    <Button onClick={handleClick} loading={loading}>
      Sign in with GitHub
    </Button>
  );
};
