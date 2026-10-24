import { createContext, useContext, useEffect, useMemo, useState } from "react";
import {
  THEMES,
  CUSTOM_ACCENTS,
  DEFAULT_THEME_KEY,
  DEFAULT_CUSTOM_ACCENT,
} from "./themes";

const THEME_STORAGE_KEY = "chatTheme";
const CUSTOM_ACCENT_STORAGE_KEY = "chatCustomAccent";

const ThemeContext = createContext(null);

export const ThemeProvider = ({ children }) => {
  // Read once on mount from localStorage — this IS the persistence layer
  // the feature spec asked for, so no server round-trip is needed to pick
  // a theme up on page load.
  const [themeKey, setThemeKey] = useState(
    () => localStorage.getItem(THEME_STORAGE_KEY) || DEFAULT_THEME_KEY
  );
  const [customAccentKey, setCustomAccentKey] = useState(
    () => localStorage.getItem(CUSTOM_ACCENT_STORAGE_KEY) || DEFAULT_CUSTOM_ACCENT
  );

  useEffect(() => {
    localStorage.setItem(THEME_STORAGE_KEY, themeKey);
  }, [themeKey]);

  useEffect(() => {
    localStorage.setItem(CUSTOM_ACCENT_STORAGE_KEY, customAccentKey);
  }, [customAccentKey]);

  // Resolve the final theme object every component actually consumes.
  // For "custom", merge in the picked accent preset's colors on top of the
  // base custom layout.
  const theme = useMemo(() => {
    const base = THEMES[themeKey] || THEMES[DEFAULT_THEME_KEY];
    if (themeKey === "custom") {
      const accent = CUSTOM_ACCENTS[customAccentKey] || CUSTOM_ACCENTS[DEFAULT_CUSTOM_ACCENT];
      return { ...base, ...accent };
    }
    return base;
  }, [themeKey, customAccentKey]);

  // Scrollbars can't be styled via Tailwind utility classes (no core
  // utility for ::-webkit-scrollbar-thumb etc. without a plugin), so this
  // is the one place we fall back to plain CSS — driven by custom
  // properties set here and consumed in index.css.
  useEffect(() => {
    document.documentElement.style.setProperty("--scrollbar-thumb", theme.scrollbarThumb);
    document.documentElement.style.setProperty("--scrollbar-track", theme.scrollbarTrack);
  }, [theme]);

  const value = useMemo(
    () => ({
      themeKey,
      setThemeKey,
      customAccentKey,
      setCustomAccentKey,
      theme,
      THEMES,
      CUSTOM_ACCENTS,
    }),
    [themeKey, customAccentKey, theme]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useTheme = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return ctx;
};
