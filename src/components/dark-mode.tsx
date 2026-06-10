"use client";

import MaterialSymbolsDarkModeOutlineRounded from "~icons/material-symbols/dark-mode-outline-rounded";
import MaterialSymbolsLightModeOutlineRounded from "~icons/material-symbols/light-mode-outline-rounded";

import { Button } from "@/components/ui/button";

import { useThemeContext } from "./providers/theme-provider";

export const DarkMode = () => {
  const { dark, toggle } = useThemeContext();

  return (
    <Button variant="ghost" size="icon" onClick={toggle} aria-label="Toggle dark mode">
      {dark ? (
        <MaterialSymbolsLightModeOutlineRounded />
      ) : (
        <MaterialSymbolsDarkModeOutlineRounded />
      )}
    </Button>
  );
};
