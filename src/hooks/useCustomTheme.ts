"use client";

import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { hexToHsl } from "@/lib/colors";

export type ThemeColors = {
  background: string;
  foreground: string;
  card: string;
  cardForeground: string;
  popover: string;
  popoverForeground: string;
  primary: string;
  primaryForeground: string;
  secondary: string;
  secondaryForeground: string;
  muted: string;
  mutedForeground: string;
  accent: string;
  accentForeground: string;
  destructive: string;
  destructiveForeground: string;
  border: string;
  input: string;
  ring: string;
};

export type CustomTheme = {
  id: string;
  name: string;
  colors: ThemeColors;
};

export const DEFAULT_THEME_COLORS: ThemeColors = {
  background: "0 0% 100%",
  foreground: "240 10% 3.9%",
  card: "0 0% 100%",
  cardForeground: "240 10% 3.9%",
  popover: "0 0% 100%",
  popoverForeground: "240 10% 3.9%",
  primary: "240 5.9% 10%",
  primaryForeground: "0 0% 98%",
  secondary: "240 4.8% 95.9%",
  secondaryForeground: "240 5.9% 10%",
  muted: "240 4.8% 95.9%",
  mutedForeground: "240 3.8% 46.1%",
  accent: "240 4.8% 95.9%",
  accentForeground: "240 5.9% 10%",
  destructive: "0 84.2% 60.2%",
  destructiveForeground: "0 0% 98%",
  border: "240 5.9% 90%",
  input: "240 5.9% 90%",
  ring: "240 10% 3.9%",
};

export const PRESET_THEMES: CustomTheme[] = [
  {
    id: "bliss",
    name: "Bliss",
    colors: {
      background: hexToHsl("#262727"),
      foreground: hexToHsl("#ffffff"),
      card: hexToHsl("#262727"),
      cardForeground: hexToHsl("#ffffff"),
      popover: hexToHsl("#262727"),
      popoverForeground: hexToHsl("#ffffff"),
      primary: hexToHsl("#f0d3c9"),
      primaryForeground: hexToHsl("#262727"),
      secondary: hexToHsl("#343231"),
      secondaryForeground: hexToHsl("#f0d3c9"),
      muted: hexToHsl("#343231"),
      mutedForeground: hexToHsl("#665957"),
      accent: hexToHsl("#343231"),
      accentForeground: hexToHsl("#f0d3c9"),
      destructive: hexToHsl("#bd4141"),
      destructiveForeground: hexToHsl("#ffffff"),
      border: hexToHsl("#343231"),
      input: hexToHsl("#343231"),
      ring: hexToHsl("#f0d3c9"),
    },
  },
  {
    id: "catppuccin",
    name: "Catppuccin",
    colors: {
      background: hexToHsl("#1e1e2e"),
      foreground: hexToHsl("#cdd6f4"),
      card: hexToHsl("#1e1e2e"),
      cardForeground: hexToHsl("#cdd6f4"),
      popover: hexToHsl("#1e1e2e"),
      popoverForeground: hexToHsl("#cdd6f4"),
      primary: hexToHsl("#cba6f7"),
      primaryForeground: hexToHsl("#1e1e2e"),
      secondary: hexToHsl("#181825"),
      secondaryForeground: hexToHsl("#cba6f7"),
      muted: hexToHsl("#181825"),
      mutedForeground: hexToHsl("#7f849c"),
      accent: hexToHsl("#181825"),
      accentForeground: hexToHsl("#cba6f7"),
      destructive: hexToHsl("#f38ba8"),
      destructiveForeground: hexToHsl("#1e1e2e"),
      border: hexToHsl("#181825"),
      input: hexToHsl("#181825"),
      ring: hexToHsl("#cba6f7"),
    },
  },
  {
    id: "botanical",
    name: "Botanical",
    colors: {
      background: hexToHsl("#121713"),
      foreground: hexToHsl("#e7efe8"),
      card: hexToHsl("#121713"),
      cardForeground: hexToHsl("#e7efe8"),
      popover: hexToHsl("#121713"),
      popoverForeground: hexToHsl("#e7efe8"),
      primary: hexToHsl("#4a7a52"),
      primaryForeground: hexToHsl("#0b100c"),
      secondary: hexToHsl("#1e2a21"),
      secondaryForeground: hexToHsl("#e7efe8"),
      muted: hexToHsl("#1a241d"),
      mutedForeground: hexToHsl("#8fa79a"),
      accent: hexToHsl("#335c3f"),
      accentForeground: hexToHsl("#eef6f0"),
      destructive: hexToHsl("#b91c1c"),
      destructiveForeground: hexToHsl("#ffffff"),
      border: hexToHsl("#1f2c23"),
      input: hexToHsl("#1f2c23"),
      ring: hexToHsl("#4a7a52"),
    },
  },
  {
    id: "coffee-cream",
    name: "Coffee Cream",
    colors: {
      background: hexToHsl("#18120f"),
      foreground: hexToHsl("#f0e7df"),
      card: hexToHsl("#18120f"),
      cardForeground: hexToHsl("#f0e7df"),
      popover: hexToHsl("#18120f"),
      popoverForeground: hexToHsl("#f0e7df"),
      primary: hexToHsl("#8e5f40"),
      primaryForeground: hexToHsl("#140c09"),
      secondary: hexToHsl("#2b201b"),
      secondaryForeground: hexToHsl("#f0e7df"),
      muted: hexToHsl("#241b17"),
      mutedForeground: hexToHsl("#a89184"),
      accent: hexToHsl("#724c35"),
      accentForeground: hexToHsl("#f6efe8"),
      destructive: hexToHsl("#b91c1c"),
      destructiveForeground: hexToHsl("#ffffff"),
      border: hexToHsl("#2f231e"),
      input: hexToHsl("#2f231e"),
      ring: hexToHsl("#8e5f40"),
    },
  },
];

export function useCustomTheme() {
  const { theme, setTheme } = useTheme();
  const [customThemes, setCustomThemes] = useState<CustomTheme[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const storedThemes = localStorage.getItem("custom-themes");
    if (storedThemes) {
      try {
        setCustomThemes(JSON.parse(storedThemes));
      } catch (e) {
        console.error("Failed to parse custom themes", e);
      }
    }
  }, []);

  const saveTheme = (newTheme: CustomTheme) => {
    const updatedThemes = [...customThemes, newTheme];
    setCustomThemes(updatedThemes);
    localStorage.setItem("custom-themes", JSON.stringify(updatedThemes));
  };

  const deleteTheme = (id: string) => {
    const updatedThemes = customThemes.filter((t) => t.id !== id);
    setCustomThemes(updatedThemes);
    localStorage.setItem("custom-themes", JSON.stringify(updatedThemes));
    if (theme === id) {
      setTheme("system");
    }
  };

  const applyTheme = (themeId: string) => {
    const selectedTheme =
      customThemes.find((t) => t.id === themeId) ||
      PRESET_THEMES.find((t) => t.id === themeId);

    if (selectedTheme) {
      const root = document.documentElement;
      Object.entries(selectedTheme.colors).forEach(([key, value]) => {
        // Convert camelCase to kebab-case for CSS variables
        const cssVar = `--${key.replace(/([A-Z])/g, "-$1").toLowerCase()}`;
        root.style.setProperty(cssVar, value);
      });
      setTheme(themeId);
    } else {
      // If switching back to built-in themes, remove inline styles
      const root = document.documentElement;
      Object.keys(DEFAULT_THEME_COLORS).forEach((key) => {
        const cssVar = `--${key.replace(/([A-Z])/g, "-$1").toLowerCase()}`;
        root.style.removeProperty(cssVar);
      });
      setTheme(themeId);
    }
  };

  // Listen for theme changes to apply custom styles if needed
  useEffect(() => {
    if (!mounted) return;

    // Check if current theme is a custom one
    const customTheme =
      customThemes.find((t) => t.id === theme) ||
      PRESET_THEMES.find((t) => t.id === theme);

    if (customTheme) {
      const root = document.documentElement;
      Object.entries(customTheme.colors).forEach(([key, value]) => {
        const cssVar = `--${key.replace(/([A-Z])/g, "-$1").toLowerCase()}`;
        root.style.setProperty(cssVar, value);
      });
    } else {
      // Clean up styles if not custom
      const root = document.documentElement;
      Object.keys(DEFAULT_THEME_COLORS).forEach((key) => {
        const cssVar = `--${key.replace(/([A-Z])/g, "-$1").toLowerCase()}`;
        root.style.removeProperty(cssVar);
      });
    }
  }, [theme, customThemes, mounted]);

  return {
    customThemes,
    presets: PRESET_THEMES,
    saveTheme,
    deleteTheme,
    applyTheme,
    mounted,
  };
}

export function useThemeColors() {
  const { theme } = useTheme();
  const [colors, setColors] = useState<ThemeColors>(DEFAULT_THEME_COLORS);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const storedThemes = localStorage.getItem("custom-themes");
    let customThemes: CustomTheme[] = [];
    if (storedThemes) {
      try {
        customThemes = JSON.parse(storedThemes);
      } catch (e) {
        console.error("Failed to parse custom themes", e);
      }
    }

    const activeTheme =
      customThemes.find((t) => t.id === theme) ||
      PRESET_THEMES.find((t) => t.id === theme);

    if (activeTheme) {
      setColors(activeTheme.colors);
    } else {
      // Fallback or default themes (light/dark)
      // For built-in themes, we might want to return specific colors or just defaults
      // Since we don't have the exact colors for light/dark in JS (they are in CSS),
      // we can try to approximate or just return defaults.
      // However, for charts, we really want the primary color.
      // Let's try to read from computed styles if possible, or just map 'light'/'dark' to known values.
      if (theme === 'dark') {
         setColors({
             ...DEFAULT_THEME_COLORS,
             primary: hexToHsl("#fafafa"), // dark mode primary is usually white-ish
             background: hexToHsl("#0a0a0a"),
         })
      } else {
          setColors(DEFAULT_THEME_COLORS);
      }
    }
  }, [theme]);

  if (!mounted) return DEFAULT_THEME_COLORS;
  return colors;
}
