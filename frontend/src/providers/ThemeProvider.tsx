"use client";

import React, { createContext, useCallback, useEffect, useState } from "react";
import { STORAGE_KEYS } from "@/lib/constants";

export type ThemeMode = "light" | "dark";

export type ThemeContextValue = {
  theme: ThemeMode;
  toggleTheme: () => void;
};

export const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<ThemeMode>("light");

  useEffect(() => {
    if (typeof window === "undefined") return;

    const dayNightTheme = window.localStorage.getItem("daynight-theme");
    if (dayNightTheme === "carbon") {
      setTheme("dark");
      return;
    }

    if (dayNightTheme === "snow") {
      setTheme("light");
      return;
    }

    const stored = window.localStorage.getItem(STORAGE_KEYS.THEME) as ThemeMode | null;
    if (stored) setTheme(stored);
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("carbon", theme === "dark");
    document.documentElement.classList.toggle("snow", theme === "light");

    if (typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_KEYS.THEME, theme);
      window.localStorage.setItem("daynight-theme", theme === "dark" ? "carbon" : "snow");
    }
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  }, []);

  return <ThemeContext.Provider value={{ theme, toggleTheme }}>{children}</ThemeContext.Provider>;
}
