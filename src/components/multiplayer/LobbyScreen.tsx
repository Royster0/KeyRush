"use client";

import { motion } from "framer-motion";
import { Users, Swords, Zap, Link2, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getRankColor } from "./multiplayer-utils";
import { InviteLinkDetails } from "./InviteLinkDetails";
import { MatchState } from "@/types/multiplayer.types";
import { RankIcon } from "@/components/RankIcon";

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
  onReady: (ready: boolean) => void;
  onLeave: () => void;
  onCopyInvite: () => void;
};

export function LobbyScreen({
  matchState,
  player,
  opponent,
  rankLabel,
  inviteLink,
  inviteExpiresAt,
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
        {/* Player Card */}
        <motion.div
          initial={{ x: -50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          <Card className={`border-2 transition-all ${player?.ready ? "border-emerald-500 bg-emerald-500/5" : "border-border"}`}>
            <CardContent className="p-6 text-center">
              <div className="h-16 w-16 mx-auto rounded-full bg-primary/20 flex items-center justify-center mb-4">
                <span className="text-2xl font-bold">{(player?.name ?? "You").charAt(0).toUpperCase()}</span>
              </div>
              <p className="font-bold text-lg">{player?.name ?? "You"}</p>
              {matchState.mode === "ranked" && (
                <div className="flex items-center justify-center gap-1 text-sm">
                  <RankIcon
                    rank={player?.rank ?? rankLabel}
                    size={16}
                    title={player?.rank ?? rankLabel}
                  />
                  <span className={getRankColor(player?.rank ?? rankLabel)}>
                    {player?.rank ?? rankLabel}
                  </span>
                </div>
              )}
              <div className="mt-4">
                {player?.ready ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-500 text-sm font-medium">
                    <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                    Ready
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-muted text-muted-foreground text-sm">
                    Not Ready
                  </span>
                )}
              </div>
            </CardContent>
          </Card>
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

        {/* Opponent Card */}
        <motion.div
          initial={{ x: 50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          <Card className={`border-2 transition-all ${opponent?.ready ? "border-emerald-500 bg-emerald-500/5" : "border-border"}`}>
            <CardContent className="p-6 text-center">
              {opponent ? (
                <>
                  <div className="h-16 w-16 mx-auto rounded-full bg-sky-500/20 flex items-center justify-center mb-4">
                    <span className="text-2xl font-bold text-sky-500">{opponent.name.charAt(0).toUpperCase()}</span>
                  </div>
                  <p className="font-bold text-lg">{opponent.name}</p>
                  {matchState.mode === "ranked" && (
                    <div className="flex items-center justify-center gap-1 text-sm">
                      <RankIcon
                        rank={opponent.rank ?? "Placement"}
                        size={16}
                        title={opponent.rank ?? "Placement"}
                      />
                      <span className={getRankColor(opponent.rank ?? "Placement")}>
                        {opponent.rank ?? "Placement"}
                      </span>
                    </div>
                  )}
                  <div className="mt-4">
                    {opponent.ready ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-500 text-sm font-medium">
                        <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                        Ready
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-muted text-muted-foreground text-sm">
                        Not Ready
                      </span>
                    )}
                  </div>
                </>
              ) : (
                <>
                  <div className="h-16 w-16 mx-auto rounded-full bg-muted flex items-center justify-center mb-4">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                      className="h-8 w-8 rounded-full border-2 border-transparent border-t-muted-foreground"
                    />
                  </div>
                  <p className="font-medium text-muted-foreground">Waiting for opponent...</p>
                </>
              )}
            </CardContent>
          </Card>
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
