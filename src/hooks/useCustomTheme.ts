"use client";

import { useState, useEffect } from "react";
import { useTheme } from "next-themes";

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

const DEFAULT_THEME_COLORS: ThemeColors = {
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
    const selectedTheme = customThemes.find((t) => t.id === themeId);
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
    const customTheme = customThemes.find(t => t.id === theme);
    if (customTheme) {
       const root = document.documentElement;
      Object.entries(customTheme.colors).forEach(([key, value]) => {
        const cssVar = `--${key.replace(/([A-Z])/g, "-$1").toLowerCase()}`;
        root.style.setProperty(cssVar, value);
      });
    } else {
       // Clean up styles if not custom
       const root = document.documentElement;
       // We only need to clean up if we previously applied a custom theme.
       // However, next-themes handles class switching.
       // We just need to ensure inline styles don't override class styles if we switch to 'dark' or 'light'.
       // But wait, if we set inline styles on :root, they might persist.
       // So we DO need to clear them when switching to a non-custom theme.
       
       // Optimization: Only clear if we suspect we might have set them.
       // For safety, let's clear them.
       Object.keys(DEFAULT_THEME_COLORS).forEach((key) => {
        const cssVar = `--${key.replace(/([A-Z])/g, "-$1").toLowerCase()}`;
        root.style.removeProperty(cssVar);
      });
    }
  }, [theme, customThemes, mounted]);


  return {
    customThemes,
    saveTheme,
    deleteTheme,
    applyTheme,
    mounted,
  };
}
