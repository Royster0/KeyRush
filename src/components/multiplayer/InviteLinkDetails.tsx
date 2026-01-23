"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Link2, Clock } from "lucide-react";

type InviteLinkDetailsProps = {
  link: string;
  expiresAt: number | null;
};

export function InviteLinkDetails({ link, expiresAt }: InviteLinkDetailsProps) {
  const [minutesLeft, setMinutesLeft] = useState<number | null>(null);

  useEffect(() => {
    if (!expiresAt) {
      setMinutesLeft(null);
      return;
    }

    const update = () => {
      const remaining = Math.max(0, Math.ceil((expiresAt - Date.now()) / 60000));
      setMinutesLeft(remaining);
    };

    update();
    const timer = setInterval(update, 30000);
    return () => clearInterval(timer);
  }, [expiresAt]);

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      className="mt-3 space-y-2"
    >
      <div className="flex items-center gap-2 p-2 rounded-md bg-background/50 border border-border/50">
        <Link2 className="h-3 w-3 text-muted-foreground flex-shrink-0" />
        <p className="text-xs text-muted-foreground break-all font-mono truncate">{link}</p>
      </div>
      {minutesLeft !== null && (
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Clock className="h-3 w-3" />
          <span>Expires in {minutesLeft} minute{minutesLeft !== 1 ? "s" : ""}</span>
        </div>
      )}
    </motion.div>
  );
}
