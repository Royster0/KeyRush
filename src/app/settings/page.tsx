"use client";

import { motion } from "motion/react";
import { Settings } from "lucide-react";
import { ThemeManager } from "@/components/settings/ThemeManager";
import { CaretSettings } from "@/components/settings/CaretSettings";
import { WidthSettings } from "@/components/settings/WidthSettings";

export default function SettingsPage() {
  return (
    <div className="min-h-screen">
      <div className="container mx-auto max-w-4xl px-4 py-12 space-y-10">
        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative text-center space-y-4"
        >
          {/* Background glow */}
          <div className="pointer-events-none absolute inset-0 overflow-hidden">
            <div className="absolute left-1/2 top-0 -translate-x-1/2 h-[200px] w-[400px] rounded-full bg-primary/8 blur-[80px]" />
          </div>

          <div className="relative z-10">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
              Settings
            </h1>
            <p className="text-muted-foreground max-w-md mx-auto mt-4">
              Customize your typing experience.
            </p>
          </div>
        </motion.header>

        {/* Settings Sections */}
        <div className="space-y-8">
          <CaretSettings />
          <WidthSettings />
          <ThemeManager />
        </div>
      </div>
    </div>
  );
}
