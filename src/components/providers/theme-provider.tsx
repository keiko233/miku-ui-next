"use client";

import {
  createContext,
  useContext,
  useEffect,
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
  const [dark, setDark] = useLocalStorage<boolean | null>(
    "custom-darkmode",
    null,
  );

  const toggle = () => {
    const value = dark === null ? !prefersDarkMode : !dark;
    setDark(value);
  };

  const prefersDarkMode = useMediaQuery("(prefers-color-scheme: dark)");

  useEffect(() => {
    const body = window.document.body;

    const value = dark === null ? prefersDarkMode : dark;

    if (value) {
      body.classList.add("dark");
    } else {
      body.classList.remove("dark");
    }
  }, [dark, prefersDarkMode]);

  return (
    <ThemeContext.Provider
      value={{
        dark,
        toggle,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};
