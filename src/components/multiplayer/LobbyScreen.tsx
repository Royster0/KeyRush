"use client";

import { motion } from "framer-motion";
import { Users, Swords, Zap, Link2, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { InviteLinkDetails } from "./InviteLinkDetails";
import { MatchState } from "@/types/multiplayer.types";
import BannerDisplay from "@/components/banner/BannerDisplay";
import type { ActiveBanner } from "@/types/banner.types";

type PlayerInfo = {
  id: string;
  name: string;
  ready: boolean;
  rank?: string;
};

type LobbyScreenProps = {
  matchState: MatchState;
  player: PlayerInfo | undefined;
  opponent: PlayerInfo | null;
  rankLabel: string;
  inviteLink: string | null;
  inviteExpiresAt: number | null;
  playerBanner?: ActiveBanner | null;
  opponentBanner?: ActiveBanner | null;
  onReady: (ready: boolean) => void;
  onLeave: () => void;
  onCopyInvite: () => void;
};

function ReadyBadge({ ready }: { ready: boolean }) {
  return ready ? (
    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-500 text-sm font-medium">
      <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
      Ready
    </span>
  ) : (
    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-muted text-muted-foreground text-sm">
      Not Ready
    </span>
  );
}

function FallbackPlayerCard({ name, rank }: { name: string; rank?: string }) {
  return (
    <div className="rounded-xl border border-zinc-700/50 bg-gradient-to-br from-zinc-800/80 to-zinc-900/80 overflow-hidden">
      <div className="flex items-center text-left py-5 px-5 gap-3.5">
        <div className="relative flex-shrink-0">
          <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-white/20 to-white/5 border border-white/15 flex items-center justify-center">
            <span className="text-2xl font-black text-white drop-shadow-sm">
              {name.charAt(0).toUpperCase()}
            </span>
          </div>
        </div>
        <div className="flex flex-col min-w-0">
          <span className="text-lg font-bold text-white drop-shadow-md truncate leading-tight">
            {name}
          </span>
          {rank && (
            <span className="text-xs font-medium text-white/40">{rank}</span>
          )}
        </div>
      </div>
    </div>
  );
}

export function LobbyScreen({
  matchState,
  player,
  opponent,
  rankLabel,
  inviteLink,
  inviteExpiresAt,
  playerBanner,
  opponentBanner,
  onReady,
  onLeave,
  onCopyInvite,
}: LobbyScreenProps) {
  return (
    <div className="space-y-6">
      {/* Lobby Header */}
      <div className="text-center space-y-2">
        <motion.div
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          className="inline-flex items-center gap-3"
        >
          <Users className="h-6 w-6 text-primary" />
          <h2 className="text-2xl font-bold">Match Lobby</h2>
        </motion.div>
        <p className="text-muted-foreground">
          {matchState.mode === "ranked" ? "Ranked" : "Unranked"} · {matchState.duration}s
        </p>
      </div>

      {/* VS Layout */}
      <div className="grid gap-4 md:grid-cols-[1fr,auto,1fr] items-center">
        {/* Player */}
        <motion.div
          initial={{ x: -50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="flex flex-col items-center gap-3"
        >
          <div className={`w-full rounded-xl transition-all ${player?.ready ? "ring-2 ring-emerald-500 ring-offset-2 ring-offset-background" : ""}`}>
            {playerBanner ? (
              <BannerDisplay
                banner={playerBanner}
                size="md"
                username={player?.name ?? "You"}
                rank={matchState.mode === "ranked" ? (player?.rank ?? rankLabel) : undefined}
              />
            ) : (
              <FallbackPlayerCard
                name={player?.name ?? "You"}
                rank={matchState.mode === "ranked" ? (player?.rank ?? rankLabel) : undefined}
              />
            )}
          </div>
          <ReadyBadge ready={player?.ready ?? false} />
        </motion.div>

        {/* VS Divider */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring" }}
          className="flex flex-col items-center gap-2 py-4"
        >
          <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center">
            <Swords className="h-6 w-6 text-primary" />
          </div>
          <span className="text-2xl font-bold text-muted-foreground">VS</span>
        </motion.div>

        {/* Opponent */}
        <motion.div
          initial={{ x: 50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="flex flex-col items-center gap-3"
        >
          {opponent ? (
            <>
              <div className={`w-full rounded-xl transition-all ${opponent.ready ? "ring-2 ring-emerald-500 ring-offset-2 ring-offset-background" : ""}`}>
                {opponentBanner ? (
                  <BannerDisplay
                    banner={opponentBanner}
                    size="md"
                    username={opponent.name}
                    rank={matchState.mode === "ranked" ? (opponent.rank ?? "Placement") : undefined}
                  />
                ) : (
                  <FallbackPlayerCard
                    name={opponent.name}
                    rank={matchState.mode === "ranked" ? (opponent.rank ?? "Placement") : undefined}
                  />
                )}
              </div>
              <ReadyBadge ready={opponent.ready} />
            </>
          ) : (
            <div className="w-full rounded-xl border border-dashed border-muted-foreground/30 bg-muted/10 py-10 flex flex-col items-center gap-3">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="h-8 w-8 rounded-full border-2 border-transparent border-t-muted-foreground"
              />
              <p className="font-medium text-muted-foreground text-sm">Waiting for opponent...</p>
            </div>
          )}
        </motion.div>
      </div>

      {/* Action Buttons */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="flex flex-wrap justify-center gap-3"
      >
        <Button
          onClick={() => onReady(!player?.ready)}
          disabled={!opponent}
          size="lg"
          className={`gap-2 ${player?.ready ? "bg-amber-500 hover:bg-amber-600" : ""}`}
        >
          {player?.ready ? (
            <>Cancel Ready</>
          ) : (
            <>
              <Zap className="h-4 w-4" />
              Ready Up
            </>
          )}
        </Button>
        <Button variant="ghost" onClick={onLeave}>
          Leave Lobby
        </Button>
      </motion.div>

      {/* Invite Link (for unranked) */}
      {matchState?.mode === "unranked" && inviteLink && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="border-dashed border-2 border-primary/30 bg-primary/5">
            <CardContent className="p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <Link2 className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium">Invite Link</span>
                </div>
                <Button variant="ghost" size="sm" onClick={onCopyInvite} className="gap-2">
                  <Copy className="h-4 w-4" />
                  Copy
                </Button>
              </div>
              <InviteLinkDetails link={inviteLink} expiresAt={inviteExpiresAt} />
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
}
