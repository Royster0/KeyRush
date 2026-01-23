"use client";

import { motion, AnimatePresence } from "framer-motion";
import {
  Trophy,
  Swords,
  Clock,
  Users,
  Link2,
  Copy,
  ChevronRight,
  Zap,
  Sparkles,
  Timer,
  Shield,
  Gamepad2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getRankColor } from "./multiplayer-utils";
import { InviteLinkDetails } from "./InviteLinkDetails";

type QueueMode = "ranked" | "unranked";

type QueueScreenProps = {
  user: { profile?: { username?: string } } | null | undefined;
  queueMode: QueueMode;
  setQueueMode: (mode: QueueMode) => void;
  duration: 30 | 60;
  setDuration: (duration: 30 | 60) => void;
  queuePhase: "idle" | "queue";
  eloRecord: { elo: number; matchesPlayed: number };
  rankLabel: string;
  placementRemaining: number;
  inviteLink: string | null;
  inviteExpiresAt: number | null;
  onQueue: () => void;
  onCreateInvite: () => void;
  onCopyInvite: () => void;
  onCancelQueue: () => void;
  errorMessage: string | null;
};

export function QueueScreen({
  user,
  queueMode,
  setQueueMode,
  duration,
  setDuration,
  queuePhase,
  eloRecord,
  rankLabel,
  placementRemaining,
  inviteLink,
  inviteExpiresAt,
  onQueue,
  onCreateInvite,
  onCopyInvite,
  onCancelQueue,
  errorMessage,
}: QueueScreenProps) {
  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="text-center space-y-2">
        <motion.div
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          className="inline-flex items-center gap-3 mb-2"
        >
          <Swords className="h-8 w-8 text-primary" />
          <h1 className="text-4xl font-bold tracking-tight">Multiplayer</h1>
        </motion.div>
        <p className="text-muted-foreground">
          Challenge opponents in real-time typing battles
        </p>
      </div>

      {/* Rank Display Card (for logged-in users) */}
      {user && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="border-none bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 overflow-hidden">
            <CardContent className="p-6">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <div className="h-16 w-16 rounded-full bg-primary/20 flex items-center justify-center">
                      <Trophy className={`h-8 w-8 ${getRankColor(rankLabel)}`} />
                    </div>
                    {placementRemaining > 0 && (
                      <div className="absolute -bottom-1 -right-1 bg-primary text-primary-foreground text-xs font-bold px-1.5 py-0.5 rounded-full">
                        {placementRemaining}
                      </div>
                    )}
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Your Rank</p>
                    <p className={`text-2xl font-bold ${getRankColor(rankLabel)}`}>
                      {rankLabel}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-8">
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">Elo Rating</p>
                    <p className="text-3xl font-bold font-mono">{eloRecord.elo}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">Matches</p>
                    <p className="text-3xl font-bold font-mono">{eloRecord.matchesPlayed}</p>
                  </div>
                  {placementRemaining > 0 && (
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground">Placements Left</p>
                      <p className="text-3xl font-bold font-mono text-primary">{placementRemaining}</p>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Mode Selection */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="space-y-3"
      >
        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
          <Gamepad2 className="h-4 w-4" />
          <span>Select Mode</span>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {/* Ranked Mode Card */}
          <motion.button
            type="button"
            onClick={() => setQueueMode("ranked")}
            disabled={queuePhase === "queue" || !user}
            whileHover={{ scale: user ? 1.02 : 1 }}
            whileTap={{ scale: user ? 0.98 : 1 }}
            className={`relative rounded-xl border-2 p-5 text-left transition-all overflow-hidden ${
              queueMode === "ranked"
                ? "border-primary bg-primary/5 shadow-lg shadow-primary/10"
                : "border-border/60 hover:border-primary/40"
            } ${!user ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            {queueMode === "ranked" && (
              <motion.div
                layoutId="mode-indicator"
                className="absolute top-3 right-3"
              >
                <span className="flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-primary" />
                </span>
              </motion.div>
            )}
            <div className="flex items-start gap-4">
              <div className={`p-3 rounded-lg ${queueMode === "ranked" ? "bg-primary/20" : "bg-muted"}`}>
                <Trophy className={`h-6 w-6 ${queueMode === "ranked" ? "text-primary" : "text-muted-foreground"}`} />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold">Ranked</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Compete for Elo rating and climb the ranks
                </p>
                {user && (
                  <div className="mt-4 flex flex-wrap items-center gap-3 text-xs">
                    <span className={`px-2 py-1 rounded-full bg-muted font-medium ${getRankColor(rankLabel)}`}>
                      {rankLabel}
                    </span>
                    <span className="text-muted-foreground">
                      {eloRecord.elo} Elo
                    </span>
                  </div>
                )}
              </div>
            </div>
            {!user && (
              <p className="mt-4 text-xs text-muted-foreground flex items-center gap-1">
                <Shield className="h-3 w-3" />
                Sign in to play ranked matches
              </p>
            )}
          </motion.button>

          {/* Unranked Mode Card */}
          <motion.button
            type="button"
            onClick={() => setQueueMode("unranked")}
            disabled={queuePhase === "queue"}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`relative rounded-xl border-2 p-5 text-left transition-all overflow-hidden ${
              queueMode === "unranked"
                ? "border-primary bg-primary/5 shadow-lg shadow-primary/10"
                : "border-border/60 hover:border-primary/40"
            }`}
          >
            {queueMode === "unranked" && (
              <motion.div
                layoutId="mode-indicator"
                className="absolute top-3 right-3"
              >
                <span className="flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-primary" />
                </span>
              </motion.div>
            )}
            <div className="flex items-start gap-4">
              <div className={`p-3 rounded-lg ${queueMode === "unranked" ? "bg-primary/20" : "bg-muted"}`}>
                <Sparkles className={`h-6 w-6 ${queueMode === "unranked" ? "text-primary" : "text-muted-foreground"}`} />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold">Unranked</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Practice and play casually without Elo changes
                </p>
                <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
                  <Zap className="h-3 w-3" />
                  <span>Perfect for warming up</span>
                </div>
              </div>
            </div>
          </motion.button>
        </div>
      </motion.div>

      {/* Invite Section (Unranked only) */}
      <AnimatePresence>
        {queueMode === "unranked" && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <Card className="border-dashed border-2 border-primary/30 bg-primary/5">
              <CardContent className="p-5">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/20">
                      <Link2 className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">Challenge a Friend</p>
                      <p className="text-sm text-muted-foreground">
                        Create a private match link
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="secondary"
                      onClick={onCreateInvite}
                      disabled={queuePhase === "queue"}
                      className="gap-2"
                    >
                      <Link2 className="h-4 w-4" />
                      Create Invite
                    </Button>
                    {inviteLink && (
                      <Button variant="ghost" size="icon" onClick={onCopyInvite}>
                        <Copy className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
                {inviteLink && (
                  <InviteLinkDetails link={inviteLink} expiresAt={inviteExpiresAt} />
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Match Settings */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid gap-4 md:grid-cols-2"
      >
        {/* Match Format */}
        <Card className="border-none bg-muted/40">
          <CardContent className="p-5">
            <div className="flex items-center gap-2 mb-4">
              <Users className="h-4 w-4 text-muted-foreground" />
              <p className="text-sm font-medium">Match Format</p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Button
                variant="default"
                disabled
                className="gap-2"
              >
                <Swords className="h-4 w-4" />
                1v1
              </Button>
              <Button variant="secondary" disabled className="opacity-50">
                3-Way
              </Button>
              <Button variant="secondary" disabled className="opacity-50">
                4-Way
              </Button>
            </div>
            <p className="mt-3 text-xs text-muted-foreground">
              More formats coming soon
            </p>
          </CardContent>
        </Card>

        {/* Duration */}
        <Card className="border-none bg-muted/40">
          <CardContent className="p-5">
            <div className="flex items-center gap-2 mb-4">
              <Timer className="h-4 w-4 text-muted-foreground" />
              <p className="text-sm font-medium">Duration</p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Button
                variant={duration === 30 ? "default" : "secondary"}
                onClick={() => setDuration(30)}
                disabled={queuePhase === "queue"}
                className="gap-2"
              >
                <Clock className="h-4 w-4" />
                30s
              </Button>
              <Button
                variant={duration === 60 ? "default" : "secondary"}
                onClick={() => setDuration(60)}
                disabled={queuePhase === "queue"}
                className="gap-2"
              >
                <Clock className="h-4 w-4" />
                60s
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Queue Button Section */}
      <div className="pt-4">
        {queuePhase === "queue" ? (
          <div className="flex flex-col items-center gap-4">
            <div className="relative">
              <div className="h-20 w-20 rounded-full border-4 border-primary/30 flex items-center justify-center">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  className="h-16 w-16 rounded-full border-4 border-transparent border-t-primary"
                />
              </div>
              <Swords className="h-6 w-6 text-primary absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
            </div>
            <div className="text-center">
              <p className="text-lg font-medium">Searching for opponent...</p>
              <p className="text-sm text-muted-foreground">
                {queueMode === "ranked" ? "Ranked" : "Unranked"} · {duration}s
              </p>
            </div>
            <Button variant="ghost" onClick={onCancelQueue}>
              Cancel Queue
            </Button>
          </div>
        ) : (
          <div className="flex justify-center">
            <Button
              onClick={onQueue}
              size="lg"
              className="gap-3 px-8 py-6 text-lg font-semibold"
            >
              <Swords className="h-5 w-5" />
              Find Match
              <ChevronRight className="h-5 w-5" />
            </Button>
          </div>
        )}
        {errorMessage && (
          <p className="text-sm text-destructive text-center mt-4">
            {errorMessage}
          </p>
        )}
      </div>
    </div>
  );
}
