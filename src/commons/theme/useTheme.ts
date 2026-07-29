import { useEffect, useState } from "react";
import {
  applyTheme,
  resolveTheme,
  setTheme,
  toggleTheme,
  type AppTheme,
} from "./theme";

export function useTheme() {
  const [theme, setThemeState] = useState<AppTheme>(() => {
    if (typeof document === "undefined") {
      return "light";
    }

    const current = document.documentElement.getAttribute("data-theme");
    if (current === "light" || current === "dark") {
      return current;
    }

    return resolveTheme();
  });

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  const setPreferredTheme = (next: AppTheme) => {
    setTheme(next);
    setThemeState(next);
  };

  const togglePreferredTheme = () => {
    setThemeState((current) => toggleTheme(current));
  };

  return {
    theme,
    isDark: theme === "dark",
    setTheme: setPreferredTheme,
    toggleTheme: togglePreferredTheme,
  };
}
