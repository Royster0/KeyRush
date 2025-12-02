"use client";

import * as React from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";

import { useCustomTheme } from "@/hooks/useCustomTheme";

function CustomThemeHandler() {
  useCustomTheme();
  return null;
}

// shadcn Theme Switch
export function ThemeProvider({
  children,
  ...props
}: React.ComponentProps<typeof NextThemesProvider>) {
  return (
    <NextThemesProvider {...props}>
      <CustomThemeHandler />
      {children}
    </NextThemesProvider>
  );
}
