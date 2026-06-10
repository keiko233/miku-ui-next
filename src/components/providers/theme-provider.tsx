"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  type PropsWithChildren,
} from "react";
import { useLocalStorage, useMediaQuery } from "usehooks-ts";

const ThemeContext = createContext<{
  dark: boolean | null;
  toggle: () => void;
} | null>(null);

export const useThemeContext = () => {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error("useThemeContext must be used within a ThemeProvider");
  }

  return context;
};

export const ThemeProvider = ({ children }: PropsWithChildren) => {
  const [dark, setDark] = useLocalStorage<boolean | null>("custom-darkmode", null);
  const prefersDarkMode = useMediaQuery("(prefers-color-scheme: dark)");

  const toggle = useCallback(() => {
    const value = dark === null ? !prefersDarkMode : !dark;
    setDark(value);
  }, [dark, prefersDarkMode, setDark]);

  useEffect(() => {
    const html = window.document.documentElement;

    const value = dark === null ? prefersDarkMode : dark;

    if (value) {
      html.classList.add("dark");
    } else {
      html.classList.remove("dark");
    }
  }, [dark, prefersDarkMode]);

  const contextValue = useMemo(() => ({ dark, toggle }), [dark, toggle]);

  return <ThemeContext.Provider value={contextValue}>{children}</ThemeContext.Provider>;
};
