export type AppTheme = "light" | "dark";

export const THEME_STORAGE_KEY = "beacon-theme";

export const getSystemTheme = (): AppTheme => {
  if (typeof window === "undefined" || !window.matchMedia) {
    return "light";
  }

  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
};

export const readStoredTheme = (): AppTheme | null => {
  try {
    const stored = localStorage.getItem(THEME_STORAGE_KEY);
    if (stored === "light" || stored === "dark") {
      return stored;
    }
  } catch {
    // ignore storage errors
  }

  return null;
};

export const resolveTheme = (): AppTheme => readStoredTheme() ?? getSystemTheme();

export const applyTheme = (theme: AppTheme) => {
  document.documentElement.setAttribute("data-theme", theme);
  document.documentElement.style.colorScheme = theme;

  const meta = document.querySelector('meta[name="color-scheme"]');
  if (meta) {
    meta.setAttribute("content", theme);
  }
};

export const persistTheme = (theme: AppTheme) => {
  try {
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch {
    // ignore storage errors
  }
};

export const setTheme = (theme: AppTheme) => {
  persistTheme(theme);
  applyTheme(theme);
};

export const toggleTheme = (current: AppTheme): AppTheme => {
  const next: AppTheme = current === "dark" ? "light" : "dark";
  setTheme(next);
  return next;
};
