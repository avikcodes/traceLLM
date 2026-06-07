"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";

interface ThemeContextValue {
  theme: string;
  setTheme: (theme: string) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

const STORAGE_KEY = "tracellm-theme";

function getInitialTheme(): string {
  if (typeof window === "undefined") return "dark";
  return localStorage.getItem(STORAGE_KEY) || "dark";
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState(getInitialTheme);

  const setTheme = useCallback((newTheme: string) => {
    setThemeState(newTheme);
    localStorage.setItem(STORAGE_KEY, newTheme);
    document.documentElement.setAttribute("data-theme", newTheme);
  }, []);

  const value = useMemo(() => ({ theme, setTheme }), [theme, setTheme]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used inside ThemeProvider");
  }
  return context;
}
