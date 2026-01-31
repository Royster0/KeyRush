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

  if (matches.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
        <History className="h-12 w-12 mb-4 opacity-50" />
        <p className="text-lg">No match history yet</p>
        <p className="text-sm">Play some multiplayer matches to see your history here!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-6">
        <p className="text-sm text-muted-foreground">
          Showing {matches.length} of {initialTotal} matches
        </p>
      </div>

      <div className="space-y-3">
        <AnimatePresence mode="popLayout">
          {matches.map((match, index) => {
            const isExpanded = expandedId === match.id;

            return (
              <motion.div
                key={match.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: index < 10 ? index * 0.05 : 0 }}
                className="rounded-lg border border-border/60 bg-card/50 overflow-hidden hover:border-border transition-colors"
              >
                {/* Main Row - Clickable */}
                <button
                  onClick={() => toggleExpand(match.id)}
                  className="w-full p-4 flex items-center justify-between gap-4 text-left cursor-pointer hover:bg-muted/30 transition-colors"
                >
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    {/* Result and Mode */}
                    <div className="flex items-center gap-3 min-w-[120px]">
                      {getResultIcon(match.result)}
                      <div className="flex flex-col">
                        {getResultText(match.result)}
                        <span className="text-xs text-muted-foreground capitalize">
                          {match.mode}
                        </span>
                      </div>
                    </div>

                    {/* WPM Comparison */}
                    <div className="flex items-center gap-2 text-sm">
                      <span
                        className={`font-mono font-semibold ${
                          match.userWpm > match.opponentWpm
                            ? "text-green-500"
                            : match.userWpm < match.opponentWpm
                            ? "text-red-500"
                            : "text-muted-foreground"
                        }`}
                      >
                        {match.userWpm}
                      </span>
                      <span className="text-muted-foreground">vs</span>
                      <span className="font-mono font-semibold text-muted-foreground">
                        {match.opponentWpm}
                      </span>
                      <span className="text-muted-foreground text-xs">WPM</span>
                    </div>

                    {/* Opponent */}
                    <div className="flex items-center gap-2 min-w-[100px]">
                      <span className="text-sm text-muted-foreground">vs</span>
                      <span className="text-sm font-medium truncate">
                        {match.opponentName}
                      </span>
                    </div>

                    {/* Duration */}
                    <div className="text-sm text-muted-foreground min-w-[50px] text-center hidden sm:block">
                      {match.duration}s
                    </div>

                    {/* Date */}
                    <div className="text-sm text-muted-foreground min-w-[100px] text-right hidden md:block">
                      {formatDate(new Date(match.date))}
                    </div>
                  </div>

                  {/* Expand Icon */}
                  <div className="text-muted-foreground">
                    {isExpanded ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
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
                      <div className="px-4 pb-4 pt-2 border-t border-border/40 bg-muted/20">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {/* Your Stats */}
                          <div className="space-y-3">
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
                          <div className="space-y-3">
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
                        <div className="mt-4 pt-3 border-t border-border/40 flex flex-wrap gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4" />
                            <span>Duration: {match.duration}s</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            <span>{formatDateTime(match.date)}</span>
                          </div>
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

      {/* Load More Button */}
      {hasMore && (
        <div className="flex justify-center pt-4">
          <Button
            variant="outline"
            onClick={loadMore}
            disabled={isLoading}
            className="gap-2"
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
        </div>
      )}
    </div>
  );
}
