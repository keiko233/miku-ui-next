"use client";

import { Button } from "@libnyanpasu/material-design-react";
import { useThemeContext } from "./providers/theme-provider";

export const DrakMode = () => {
  const { toggle } = useThemeContext();

  return (
    <Button icon variant="flat" onClick={toggle}>
      T
    </Button>
  );
};
