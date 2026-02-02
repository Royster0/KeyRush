"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  History,
  Loader2,
  ChevronDown,
  ChevronUp,
  Trophy,
  XCircle,
  Minus,
  Target,
  Gauge,
  Clock,
  Calendar,
  Swords,
  TrendingUp,
  TrendingDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { getMatchHistory } from "@/app/actions";
import { formatDate } from "@/lib/utils";
import UserLink from "@/components/ui/UserLink";
import type { MatchHistoryEntry } from "@/types/match-history.types";

type MatchHistoryClientProps = {
  initialMatches: MatchHistoryEntry[];
  initialHasMore: boolean;
  initialTotal: number;
};

export default function MatchHistoryClient({
  initialMatches,
  initialHasMore,
  initialTotal,
}: MatchHistoryClientProps) {
  const [matches, setMatches] = useState<MatchHistoryEntry[]>(initialMatches);
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [isLoading, setIsLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const loadMore = useCallback(async () => {
    if (isLoading || !hasMore) return;

    setIsLoading(true);
    try {
      const nextPage = page + 1;
      const response = await getMatchHistory(nextPage);
      setMatches((prev) => [...prev, ...response.matches]);
      setHasMore(response.hasMore);
      setPage(nextPage);
    } catch (error) {
      console.error("Failed to load more matches:", error);
    } finally {
      setIsLoading(false);
    }
  }, [page, hasMore, isLoading]);

  const toggleExpand = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  const getResultIcon = (result: "win" | "loss" | "draw") => {
    switch (result) {
      case "win":
        return <Trophy className="h-4 w-4 text-yellow-500" />;
      case "loss":
        return <XCircle className="h-4 w-4 text-red-500" />;
      case "draw":
        return <Minus className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getResultText = (result: "win" | "loss" | "draw") => {
    switch (result) {
      case "win":
        return <span className="text-green-500 font-semibold">Victory</span>;
      case "loss":
        return <span className="text-red-500 font-semibold">Defeat</span>;
      case "draw":
        return <span className="text-muted-foreground font-semibold">Draw</span>;
    }
  };

  const formatDateTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleString("en-US", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  // Calculate stats
  const wins = matches.filter((m) => m.result === "win").length;
  const losses = matches.filter((m) => m.result === "loss").length;
  const draws = matches.filter((m) => m.result === "draw").length;

  return (
    <div className="min-h-screen">
      <div className="container mx-auto max-w-5xl px-4 py-12 space-y-10">
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
              Match History
            </h1>
            <p className="text-muted-foreground max-w-md mx-auto mt-4">
              Review your multiplayer battles and track your progress.
            </p>
          </div>
        </motion.header>

        {/* Stats Summary */}
        {matches.length > 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="flex justify-center"
          >
            <div className="inline-flex items-center gap-8 px-8 py-5 rounded-2xl bg-card/50 backdrop-blur-sm border border-border/40">
              <div className="text-center">
                <div className="text-2xl font-bold text-emerald-500">{wins}</div>
                <div className="text-xs text-muted-foreground uppercase tracking-wider">Wins</div>
              </div>
              <div className="h-8 w-px bg-border/50" />
              <div className="text-center">
                <div className="text-2xl font-bold text-rose-500">{losses}</div>
                <div className="text-xs text-muted-foreground uppercase tracking-wider">Losses</div>
              </div>
              <div className="h-8 w-px bg-border/50" />
              <div className="text-center">
                <div className="text-2xl font-bold text-muted-foreground">{draws}</div>
                <div className="text-xs text-muted-foreground uppercase tracking-wider">Draws</div>
              </div>
              <div className="h-8 w-px bg-border/50" />
              <div className="text-center">
                <div className="text-2xl font-bold">{initialTotal}</div>
                <div className="text-xs text-muted-foreground uppercase tracking-wider">Total</div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Matches Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.15 }}
          className="space-y-4"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-xl bg-primary/10 flex items-center justify-center">
                <Swords className="h-4 w-4 text-primary" />
              </div>
              <h2 className="text-xl font-mono uppercase tracking-[0.15em]">
                Matches
              </h2>
              <span className="text-sm text-muted-foreground">
                {matches.length} of {initialTotal}
              </span>
            </div>
          </div>

          {matches.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border/50 bg-background/30 p-12 text-center">
              <History className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
              <p className="text-lg text-muted-foreground">No match history yet</p>
              <p className="text-sm text-muted-foreground/70 mt-1">
                Play some multiplayer matches to see your history here!
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              <AnimatePresence mode="popLayout">
                {matches.map((match, index) => {
                  const isExpanded = expandedId === match.id;

                  return (
                    <motion.div
                      key={match.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.3, delay: index < 10 ? index * 0.05 : 0 }}
                      className="group relative overflow-hidden rounded-2xl bg-card/50 backdrop-blur-sm border border-border/40 hover:border-primary/30 transition-colors"
                    >
                      {/* Hover gradient */}
                      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                      {/* Main Row - Clickable */}
                      <button
                        onClick={() => toggleExpand(match.id)}
                        className="relative z-10 w-full p-5 flex items-center gap-4 text-left cursor-pointer"
                      >
                        {/* Result Icon */}
                        <div className={`shrink-0 h-10 w-10 rounded-xl flex items-center justify-center ${
                          match.result === "win"
                            ? "bg-emerald-500/10"
                            : match.result === "loss"
                            ? "bg-rose-500/10"
                            : "bg-muted/30"
                        }`}>
                          {getResultIcon(match.result)}
                        </div>

                        {/* Result and Mode */}
                        <div className="w-[100px] shrink-0">
                          {getResultText(match.result)}
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span className="text-xs text-muted-foreground capitalize">
                              {match.mode}
                            </span>
                            {match.mode === "ranked" && match.eloChange !== null && (
                              <span
                                className={`flex items-center gap-0.5 text-xs font-medium ${
                                  match.eloChange > 0
                                    ? "text-emerald-500"
                                    : match.eloChange < 0
                                    ? "text-rose-500"
                                    : "text-muted-foreground"
                                }`}
                              >
                                {match.eloChange > 0 ? (
                                  <TrendingUp className="h-3 w-3" />
                                ) : match.eloChange < 0 ? (
                                  <TrendingDown className="h-3 w-3" />
                                ) : null}
                                {match.eloChange > 0 ? "+" : ""}
                                {match.eloChange}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* WPM Comparison */}
                        <div className="w-[180px] shrink-0 flex items-center justify-center gap-3 text-sm">
                          <span
                            className={`font-mono font-bold text-lg w-[60px] text-right ${
                              match.userWpm > match.opponentWpm
                                ? "text-emerald-500"
                                : match.userWpm < match.opponentWpm
                                ? "text-rose-500"
                                : "text-muted-foreground"
                            }`}
                          >
                            {match.userWpm}
                          </span>
                          <span className="text-muted-foreground/60">vs</span>
                          <span className="font-mono font-bold text-lg w-[60px] text-muted-foreground">
                            {match.opponentWpm}
                          </span>
                        </div>

                        {/* Opponent */}
                        <div className="hidden sm:flex items-center gap-2 w-[120px] shrink-0">
                          <span className="text-sm text-muted-foreground">vs</span>
                          <span className="text-sm font-medium truncate">
                            {match.opponentName}
                          </span>
                        </div>

                        {/* Duration */}
                        <div className="hidden md:flex items-center gap-1.5 w-[60px] shrink-0 text-sm text-muted-foreground">
                          <Clock className="h-3.5 w-3.5" />
                          {match.duration}s
                        </div>

                        {/* Date */}
                        <div className="hidden lg:block flex-1 text-sm text-muted-foreground text-right pr-2">
                          {formatDate(new Date(match.date))}
                        </div>

                        {/* Expand Icon */}
                        <div className="shrink-0 text-muted-foreground">
                          {isExpanded ? (
                            <ChevronUp className="h-5 w-5" />
                          ) : (
                            <ChevronDown className="h-5 w-5" />
                          )}
                        </div>
                      </button>

                      {/* Expanded Details */}
                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="overflow-hidden"
                          >
                            <div className="relative z-10 px-5 pb-5 pt-2 border-t border-border/30">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Your Stats */}
                                <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4 space-y-3">
                                  <h4 className="text-sm font-semibold text-foreground">Your Stats</h4>
                                  <div className="grid grid-cols-2 gap-3">
                                    <div className="flex items-center gap-2 text-sm">
                                      <Gauge className="h-4 w-4 text-primary" />
                                      <span className="text-muted-foreground">WPM:</span>
                                      <span className="font-mono font-semibold">{match.userWpm}</span>
                                    </div>
                                    {match.userRawWpm && (
                                      <div className="flex items-center gap-2 text-sm">
                                        <Gauge className="h-4 w-4 text-muted-foreground" />
                                        <span className="text-muted-foreground">Raw:</span>
                                        <span className="font-mono">{match.userRawWpm}</span>
                                      </div>
                                    )}
                                    <div className="flex items-center gap-2 text-sm">
                                      <Target className="h-4 w-4 text-blue-500" />
                                      <span className="text-muted-foreground">Accuracy:</span>
                                      <span className="font-mono font-semibold">{match.userAccuracy.toFixed(1)}%</span>
                                    </div>
                                  </div>
                                </div>

                                {/* Opponent Stats */}
                                <div className="rounded-xl border border-border/30 bg-muted/20 p-4 space-y-3">
                                  <h4 className="text-sm font-semibold text-foreground">
                                    <UserLink
                                      username={match.opponentName}
                                      className="hover:text-primary transition-colors"
                                    />
                                    &apos;s Stats
                                  </h4>
                                  <div className="grid grid-cols-2 gap-3">
                                    <div className="flex items-center gap-2 text-sm">
                                      <Gauge className="h-4 w-4 text-primary" />
                                      <span className="text-muted-foreground">WPM:</span>
                                      <span className="font-mono font-semibold">{match.opponentWpm}</span>
                                    </div>
                                    {match.opponentRawWpm !== null && (
                                      <div className="flex items-center gap-2 text-sm">
                                        <Gauge className="h-4 w-4 text-muted-foreground" />
                                        <span className="text-muted-foreground">Raw:</span>
                                        <span className="font-mono">{match.opponentRawWpm}</span>
                                      </div>
                                    )}
                                    {match.opponentAccuracy !== null && (
                                      <div className="flex items-center gap-2 text-sm">
                                        <Target className="h-4 w-4 text-blue-500" />
                                        <span className="text-muted-foreground">Accuracy:</span>
                                        <span className="font-mono font-semibold">{match.opponentAccuracy.toFixed(1)}%</span>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>

                              {/* Match Info */}
                              <div className="mt-4 pt-3 border-t border-border/30 flex flex-wrap gap-4 text-sm text-muted-foreground">
                                <div className="flex items-center gap-2">
                                  <Clock className="h-4 w-4" />
                                  <span>Duration: {match.duration}s</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Calendar className="h-4 w-4" />
                                  <span>{formatDateTime(match.date)}</span>
                                </div>
                                {match.mode === "ranked" && match.eloChange !== null && (
                                  <div className="flex items-center gap-2">
                                    {match.eloChange >= 0 ? (
                                      <TrendingUp className="h-4 w-4 text-emerald-500" />
                                    ) : (
                                      <TrendingDown className="h-4 w-4 text-rose-500" />
                                    )}
                                    <span>
                                      Elo:{" "}
                                      <span
                                        className={`font-semibold ${
                                          match.eloChange > 0
                                            ? "text-emerald-500"
                                            : match.eloChange < 0
                                            ? "text-rose-500"
                                            : "text-foreground"
                                        }`}
                                      >
                                        {match.eloChange > 0 ? "+" : ""}
                                        {match.eloChange}
                                      </span>
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          )}

          {/* Load More Button */}
          {hasMore && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="flex justify-center pt-4"
            >
              <Button
                variant="outline"
                onClick={loadMore}
                disabled={isLoading}
                className="gap-2 border-border/50"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Loading...
                  </>
                ) : (
                  <>
                    <ChevronDown className="h-4 w-4" />
                    Load More
                  </>
                )}
              </Button>
            </motion.div>
          )}
        </motion.section>
      </div>
    </div>
  );
}
