"use client";

import { Button } from "@libnyanpasu/material-design-react";
import MaterialSymbolsDarkModeOutlineRounded from "~icons/material-symbols/dark-mode-outline-rounded";
import MaterialSymbolsLightModeOutlineRounded from "~icons/material-symbols/light-mode-outline-rounded";
import { useThemeContext } from "./providers/theme-provider";

export const DrakMode = () => {
  const { dark, toggle } = useThemeContext();

  return (
    <Button icon variant="flat" onClick={toggle}>
      {dark ? (
        <MaterialSymbolsLightModeOutlineRounded />
      ) : (
        <MaterialSymbolsDarkModeOutlineRounded />
      )}
    </Button>
  );
};
