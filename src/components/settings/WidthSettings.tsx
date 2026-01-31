"use client";

import { motion } from "motion/react";
import { useSettings } from "@/hooks/useSettings";
import { TEST_WIDTH_OPTIONS } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { MoveHorizontal } from "lucide-react";

export function WidthSettings() {
  const {
    singleplayerWidth,
    setSingleplayerWidth,
    multiplayerWidth,
    setMultiplayerWidth,
    mounted,
  } = useSettings();

  if (!mounted) return null;

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: 0.15 }}
      className="space-y-4"
    >
      <div className="flex items-center gap-3">
        <div className="h-9 w-9 rounded-xl bg-primary/10 flex items-center justify-center">
          <MoveHorizontal className="h-4 w-4 text-primary" />
        </div>
        <h2 className="text-xl font-mono uppercase tracking-[0.15em]">
          Test Width
        </h2>
      </div>

      <div className="rounded-2xl bg-card/50 backdrop-blur-sm border border-border/40 p-6 space-y-6">
        {/* Singleplayer Width */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">Singleplayer</label>
            <span className="text-sm text-muted-foreground font-mono">
              {singleplayerWidth}vw
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {TEST_WIDTH_OPTIONS.map((width) => (
              <Button
                key={`sp-${width}`}
                variant={singleplayerWidth === width ? "default" : "outline"}
                onClick={() => setSingleplayerWidth(width)}
                size="sm"
                className="min-w-[60px]"
              >
                {width}%
              </Button>
            ))}
          </div>
          {/* Preview bar */}
          <div className="relative h-2 bg-muted/50 rounded-full overflow-hidden mt-2">
            <div
              className="absolute left-1/2 -translate-x-1/2 h-full bg-primary/50 rounded-full transition-all duration-300"
              style={{ width: `${singleplayerWidth}%` }}
            />
          </div>
        </div>

        {/* Multiplayer Width */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">Multiplayer</label>
            <span className="text-sm text-muted-foreground font-mono">
              {multiplayerWidth}vw
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {TEST_WIDTH_OPTIONS.map((width) => (
              <Button
                key={`mp-${width}`}
                variant={multiplayerWidth === width ? "default" : "outline"}
                onClick={() => setMultiplayerWidth(width)}
                size="sm"
                className="min-w-[60px]"
              >
                {width}%
              </Button>
            ))}
          </div>
          {/* Preview bar */}
          <div className="relative h-2 bg-muted/50 rounded-full overflow-hidden mt-2">
            <div
              className="absolute left-1/2 -translate-x-1/2 h-full bg-sky-500/50 rounded-full transition-all duration-300"
              style={{ width: `${multiplayerWidth}%` }}
            />
          </div>
        </div>
      </div>
    </motion.section>
  );
}
