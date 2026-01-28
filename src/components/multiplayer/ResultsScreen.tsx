"use client";

import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import {
  Trophy,
  Swords,
  Crown,
  TrendingUp,
  TrendingDown,
  Minus,
  Sparkles,
  Zap,
  Target,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getRankColor, getResultType, getResultColorClass } from "./multiplayer-utils";
import { MatchState } from "@/types/multiplayer.types";
import { getRankLabel } from "@/lib/multiplayer";
import { RankIcon } from "@/components/RankIcon";

const ResultsChart = dynamic(() => import("../typing_test/ResultsChart"), { ssr: false });

type PlayerStats = {
  id: string;
  name: string;
  wpm: number;
  rawWpm?: number;
  accuracy: number;
  rank?: string;
};

type ResultsScreenProps = {
  matchState: MatchState;
  player: PlayerStats | undefined;
  opponent: PlayerStats | null;
  resultLabel: string | null;
  eloRecord: { elo: number; matchesPlayed: number };
  rankLabel: string;
  animatedElo: number | null;
  animatedDelta: number | null;
  eloDelta: number;
  playerHistory: { time: number; wpm: number }[];
  opponentHistory: { time: number; wpm: number }[];
  onPlayAgain: () => void;
};

export function ResultsScreen({
  matchState,
  player,
  opponent,
  resultLabel,
  eloRecord,
  rankLabel,
  animatedElo,
  animatedDelta,
  eloDelta,
  playerHistory,
  opponentHistory,
  onPlayAgain,
}: ResultsScreenProps) {
  const resultType = getResultType(resultLabel);
  const resultColorClass = getResultColorClass(resultType);
  const currentRank = getRankLabel(eloRecord.elo, eloRecord.matchesPlayed);

  const getResultIcon = () => {
    if (resultType === "victory") return <Crown className="h-8 w-8" />;
    if (resultType === "defeat") return <TrendingDown className="h-8 w-8" />;
    return <Minus className="h-8 w-8" />;
  };

  const getBannerClass = () => {
    if (resultType === "victory") {
      return "bg-gradient-to-br from-emerald-500/20 via-emerald-500/10 to-transparent border-2 border-emerald-500/30";
    }
    if (resultType === "defeat") {
      return "bg-gradient-to-br from-red-500/20 via-red-500/10 to-transparent border-2 border-red-500/30";
    }
    return "bg-gradient-to-br from-yellow-500/20 via-yellow-500/10 to-transparent border-2 border-yellow-500/30";
  };

  const getIconBgClass = () => {
    if (resultType === "victory") return "bg-emerald-500/20";
    if (resultType === "defeat") return "bg-red-500/20";
    return "bg-yellow-500/20";
  };

  return (
    <div className="space-y-6">
      {/* Result Banner */}
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", duration: 0.5 }}
        className={`relative overflow-hidden rounded-2xl p-8 text-center ${getBannerClass()}`}
      >
        {/* Decorative Elements */}
        {resultType === "victory" && (
          <>
            <motion.div
              initial={{ y: -100, opacity: 0 }}
              animate={{ y: 0, opacity: 0.1 }}
              className="absolute top-4 left-8"
            >
              <Sparkles className="h-16 w-16 text-emerald-500" />
            </motion.div>
            <motion.div
              initial={{ y: -100, opacity: 0 }}
              animate={{ y: 0, opacity: 0.1 }}
              transition={{ delay: 0.1 }}
              className="absolute top-8 right-12"
            >
              <Trophy className="h-12 w-12 text-emerald-500" />
            </motion.div>
          </>
        )}

        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring" }}
          className={`inline-flex items-center justify-center h-20 w-20 rounded-full mb-4 ${getIconBgClass()}`}
        >
          <span className={resultColorClass}>
            {getResultIcon()}
          </span>
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className={`text-4xl font-bold ${resultColorClass}`}
        >
          {resultLabel ?? "Match Complete"}
        </motion.h2>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="flex items-center justify-center gap-3 mt-3"
        >
          <span className="px-3 py-1 rounded-full bg-background/50 text-sm text-muted-foreground">
            {matchState.mode === "ranked" ? "Ranked" : "Unranked"}
          </span>
          <span className="px-3 py-1 rounded-full bg-background/50 text-sm text-muted-foreground">
            {matchState.duration}s
          </span>
        </motion.div>
      </motion.div>

      {/* Stats Comparison */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card className="border-none bg-muted/40 overflow-hidden">
          <CardContent className="p-0">
            {/* Header Row */}
            <div className="grid grid-cols-[1fr,auto,1fr] items-center gap-4 p-4 border-b border-border/50">
              <div className="text-center">
                <div className="h-12 w-12 mx-auto rounded-full bg-primary/20 flex items-center justify-center mb-2">
                  <span className="text-lg font-bold">{(player?.name ?? "You").charAt(0).toUpperCase()}</span>
                </div>
                <p className="font-semibold">{player?.name ?? "You"}</p>
                {matchState.mode === "ranked" && (
                  <div className="flex items-center justify-center gap-1 text-xs">
                    <RankIcon
                      rank={player?.rank ?? rankLabel}
                      size={14}
                      title={player?.rank ?? rankLabel}
                    />
                    <span className={getRankColor(player?.rank ?? rankLabel)}>
                      {player?.rank ?? rankLabel}
                    </span>
                  </div>
                )}
              </div>
              <div className="text-center">
                <Swords className="h-6 w-6 text-muted-foreground mx-auto" />
              </div>
              <div className="text-center">
                <div className="h-12 w-12 mx-auto rounded-full bg-sky-500/20 flex items-center justify-center mb-2">
                  <span className="text-lg font-bold text-sky-500">{(opponent?.name ?? "?").charAt(0).toUpperCase()}</span>
                </div>
                <p className="font-semibold">{opponent?.name ?? "Opponent"}</p>
                {matchState.mode === "ranked" && (
                  <div className="flex items-center justify-center gap-1 text-xs">
                    <RankIcon
                      rank={opponent?.rank ?? "Placement"}
                      size={14}
                      title={opponent?.rank ?? "Placement"}
                    />
                    <span className={getRankColor(opponent?.rank ?? "Placement")}>
                      {opponent?.rank ?? "Placement"}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* WPM Comparison */}
            <div className="p-4 border-b border-border/50">
              <div className="grid grid-cols-[1fr,auto,1fr] items-center gap-4">
                <motion.div
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="text-right"
                >
                  <p className={`text-3xl font-bold font-mono ${
                    (player?.wpm ?? 0) > (opponent?.wpm ?? 0) ? "text-emerald-500" : ""
                  }`}>
                    {player?.wpm.toFixed(1) ?? "0"}
                  </p>
                </motion.div>
                <div className="text-center">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Zap className="h-4 w-4" />
                    <span className="text-xs font-medium">WPM</span>
                  </div>
                </div>
                <motion.div
                  initial={{ x: 20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="text-left"
                >
                  <p className={`text-3xl font-bold font-mono ${
                    (opponent?.wpm ?? 0) > (player?.wpm ?? 0) ? "text-sky-500" : ""
                  }`}>
                    {opponent?.wpm.toFixed(1) ?? "0"}
                  </p>
                </motion.div>
              </div>
              {/* WPM Bar Comparison */}
              <div className="mt-3 flex items-center gap-2">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(100, ((player?.wpm ?? 0) / Math.max(player?.wpm ?? 1, opponent?.wpm ?? 1)) * 100)}%` }}
                  transition={{ delay: 0.5, duration: 0.8, ease: "easeOut" }}
                  className="h-2 bg-primary rounded-full ml-auto"
                />
                <div className="w-1" />
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(100, ((opponent?.wpm ?? 0) / Math.max(player?.wpm ?? 1, opponent?.wpm ?? 1)) * 100)}%` }}
                  transition={{ delay: 0.5, duration: 0.8, ease: "easeOut" }}
                  className="h-2 bg-sky-500 rounded-full"
                />
              </div>
            </div>

            {/* Accuracy Comparison */}
            <div className="p-4 border-b border-border/50">
              <div className="grid grid-cols-[1fr,auto,1fr] items-center gap-4">
                <motion.div
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="text-right"
                >
                  <p className={`text-2xl font-bold font-mono ${
                    (player?.accuracy ?? 0) > (opponent?.accuracy ?? 0) ? "text-emerald-500" : ""
                  }`}>
                    {player?.accuracy ?? 100}%
                  </p>
                </motion.div>
                <div className="text-center">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Target className="h-4 w-4" />
                    <span className="text-xs font-medium">Accuracy</span>
                  </div>
                </div>
                <motion.div
                  initial={{ x: 20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="text-left"
                >
                  <p className={`text-2xl font-bold font-mono ${
                    (opponent?.accuracy ?? 0) > (player?.accuracy ?? 0) ? "text-sky-500" : ""
                  }`}>
                    {opponent?.accuracy ?? 100}%
                  </p>
                </motion.div>
              </div>
            </div>

            {/* Raw WPM Comparison */}
            <div className="p-4">
              <div className="grid grid-cols-[1fr,auto,1fr] items-center gap-4">
                <motion.div
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="text-right"
                >
                  <p className="text-xl font-medium font-mono text-muted-foreground">
                    {player?.rawWpm?.toFixed(1) ?? "0"}
                  </p>
                </motion.div>
                <div className="text-center">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <TrendingUp className="h-4 w-4" />
                    <span className="text-xs font-medium">Raw WPM</span>
                  </div>
                </div>
                <motion.div
                  initial={{ x: 20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="text-left"
                >
                  <p className="text-xl font-medium font-mono text-muted-foreground">
                    {opponent?.rawWpm?.toFixed(1) ?? "0"}
                  </p>
                </motion.div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Elo Update Section (Ranked only) */}
      {matchState.mode === "ranked" ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className={`border-2 overflow-hidden ${
            (animatedDelta ?? eloDelta) > 0
              ? "border-emerald-500/30 bg-emerald-500/5"
              : (animatedDelta ?? eloDelta) < 0
              ? "border-red-500/30 bg-red-500/5"
              : "border-border"
          }`}>
            <CardContent className="p-6">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className={`h-14 w-14 rounded-full flex items-center justify-center ${
                    (animatedDelta ?? eloDelta) > 0
                      ? "bg-emerald-500/20"
                      : (animatedDelta ?? eloDelta) < 0
                      ? "bg-red-500/20"
                      : "bg-muted"
                  }`}>
                    {(animatedDelta ?? eloDelta) > 0 ? (
                      <TrendingUp className="h-6 w-6 text-emerald-500" />
                    ) : (animatedDelta ?? eloDelta) < 0 ? (
                      <TrendingDown className="h-6 w-6 text-red-500" />
                    ) : (
                      <Minus className="h-6 w-6 text-muted-foreground" />
                    )}
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Elo Rating</p>
                    <div className="flex items-baseline gap-2">
                      <motion.span
                        key={animatedElo}
                        initial={{ scale: 1.2 }}
                        animate={{ scale: 1 }}
                        className="text-3xl font-bold font-mono"
                      >
                        {animatedElo ?? eloRecord.elo}
                      </motion.span>
                      <span className={`text-lg font-semibold ${
                        (animatedDelta ?? eloDelta) > 0
                          ? "text-emerald-500"
                          : (animatedDelta ?? eloDelta) < 0
                          ? "text-red-500"
                          : "text-muted-foreground"
                      }`}>
                        {(animatedDelta ?? eloDelta) >= 0 ? "+" : ""}{animatedDelta ?? eloDelta}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Current Rank</p>
                  <div className="flex items-center justify-end gap-2">
                    <RankIcon
                      rank={currentRank}
                      size={24}
                      title={currentRank}
                    />
                    <p className={`text-2xl font-bold ${getRankColor(currentRank)}`}>
                      {currentRank}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-center py-4 rounded-lg bg-muted/30 text-muted-foreground"
        >
          <Sparkles className="h-5 w-5 mx-auto mb-2 opacity-50" />
          <p className="text-sm">Unranked match — no Elo changes</p>
        </motion.div>
      )}

      {/* WPM Charts */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="grid gap-4 md:grid-cols-2"
      >
        <Card className="border-none bg-muted/40">
          <CardContent className="p-5">
            <div className="flex items-center gap-2 mb-2">
              <div className="h-3 w-3 rounded-full bg-primary" />
              <p className="text-sm font-medium">{player?.name ?? "You"}</p>
            </div>
            {playerHistory.length > 1 ? (
              <ResultsChart data={playerHistory} duration={matchState.duration} />
            ) : (
              <div className="h-64 flex items-center justify-center text-muted-foreground">
                <p className="text-sm">No chart data available</p>
              </div>
            )}
          </CardContent>
        </Card>
        <Card className="border-none bg-muted/40">
          <CardContent className="p-5">
            <div className="flex items-center gap-2 mb-2">
              <div className="h-3 w-3 rounded-full bg-sky-500" />
              <p className="text-sm font-medium">{opponent?.name ?? "Opponent"}</p>
            </div>
            {opponentHistory.length > 1 ? (
              <ResultsChart data={opponentHistory} duration={matchState.duration} />
            ) : (
              <div className="h-64 flex items-center justify-center text-muted-foreground">
                <p className="text-sm">No chart data available</p>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Play Again Button */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="flex justify-center pt-4"
      >
        <Button
          onClick={onPlayAgain}
          size="lg"
          className="gap-3 px-8 py-6 text-lg font-semibold"
        >
          <Swords className="h-5 w-5" />
          Play Again
          <ChevronRight className="h-5 w-5" />
        </Button>
      </motion.div>
    </div>
  );
}
