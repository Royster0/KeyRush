"use client";

import { motion } from "motion/react";
import { useSettings } from "@/hooks/useSettings";
import { CARET_SPEEDS } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff, MousePointer2 } from "lucide-react";

export function CaretSettings() {
  const {
    caretSpeed,
    setCaretSpeed,
    showOpponentCaret,
    setShowOpponentCaret,
    mounted,
  } = useSettings();

  if (!mounted) return null;

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: 0.1 }}
      className="space-y-4"
    >
      <div className="flex items-center gap-3">
        <div className="h-9 w-9 rounded-xl bg-primary/10 flex items-center justify-center">
          <MousePointer2 className="h-4 w-4 text-primary" />
        </div>
        <h2 className="text-xl font-mono uppercase tracking-[0.15em]">Caret</h2>
      </div>

      <div className="rounded-2xl bg-card/50 backdrop-blur-sm border border-border/40 p-6 space-y-6">
        {/* Caret Speed */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">Caret Speed</label>
            <span className="text-xs text-muted-foreground">
              How quickly the caret follows your typing
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {Object.values(CARET_SPEEDS).map((speed) => (
              <Button
                key={speed}
                variant={caretSpeed === speed ? "default" : "outline"}
                onClick={() => setCaretSpeed(speed)}
                size="sm"
                className="capitalize min-w-[80px]"
              >
                {speed}
              </Button>
            ))}
          </div>
        </div>

        {/* Opponent Caret Toggle */}
        <div className="flex items-center justify-between rounded-xl border border-border/40 bg-background/50 px-4 py-3">
          <div>
            <p className="font-medium text-sm">Opponent Caret</p>
            <p className="text-xs text-muted-foreground">
              Show your opponent&apos;s caret in multiplayer
            </p>
          </div>
          <Button
            variant={showOpponentCaret ? "default" : "outline"}
            size="sm"
            onClick={() => setShowOpponentCaret(!showOpponentCaret)}
          >
            {showOpponentCaret ? (
              <>
                <Eye className="h-4 w-4" />
                On
              </>
            ) : (
              <>
                <EyeOff className="h-4 w-4" />
                Off
              </>
            )}
          </Button>
        </div>
      </div>
    </motion.section>
  );
}
