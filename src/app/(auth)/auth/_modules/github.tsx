"use client";

import { Button } from "@libnyanpasu/material-design-react";
import { useLockFn } from "ahooks";
import { useState } from "react";
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
    <Button
      variant="flat"
      loading={loading}
      onClick={handleClick}
    >
      <span>Sign in with GitHub</span>
    </Button>
  );
};
