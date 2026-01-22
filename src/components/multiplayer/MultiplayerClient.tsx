"use client";

import PartySocket from "partysocket";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { useSearchParams } from "next/navigation";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import {
  Trophy,
  Swords,
  Clock,
  Users,
  Crown,
  Link2,
  Copy,
  ChevronRight,
  Zap,
  Target,
  TrendingUp,
  TrendingDown,
  Minus,
  Sparkles,
  Timer,
  Shield,
  Gamepad2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import MultiplayerMatch from "./MultiplayerMatch";
import { MatchPhase, MatchState, ServerMessage } from "@/types/multiplayer.types";
import {
  ANON_ID_KEY,
  ANON_NAME_KEY,
  calculateEloUpdate,
  getPlacementRemaining,
  getRankLabel,
  loadEloRecord,
  saveEloRecord,
} from "@/lib/multiplayer";
import { UserWithProfile } from "@/types/auth.types";

const ResultsChart = dynamic(() => import("../typing_test/ResultsChart"), { ssr: false });

type MultiplayerClientProps = {
  user?: UserWithProfile | null;
};

type QueuePhase = "idle" | "queue";
type QueueMode = "ranked" | "unranked";
type QueueSize = 2;

const PARTYKIT_HOST =
  process.env.NEXT_PUBLIC_PARTYKIT_HOST || "localhost:1999";
const INVITE_TTL_MS = 10 * 60 * 1000;

const parseMatchId = (
  matchId: string
): { mode: QueueMode; duration: 30 | 60; expiresAt: number | null } | null => {
  const parts = matchId.split("-");
  if (parts.length < 4 || parts[0] !== "match") {
    return null;
  }
  const mode: QueueMode = parts[1] === "unranked" ? "unranked" : "ranked";
  const duration: 30 | 60 = Number(parts[2]) === 60 ? 60 : 30;
  const expiresAt = parts.length >= 5 ? Number(parts[3]) : null;
  return { mode, duration, expiresAt: Number.isFinite(expiresAt) ? expiresAt : null };
};

const MultiplayerClient = ({ user }: MultiplayerClientProps) => {
  const [duration, setDuration] = useState<30 | 60>(30);
  const [queueMode, setQueueMode] = useState<QueueMode>("ranked");
  const [queueSize] = useState<QueueSize>(2);
  const [queuePhase, setQueuePhase] = useState<QueuePhase>("idle");
  const [matchState, setMatchState] = useState<MatchState | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [eloRecord, setEloRecord] = useState(() => ({
    elo: 1000,
    matchesPlayed: 0,
    updatedAt: new Date().toISOString(),
  }));
  const [eloDelta, setEloDelta] = useState(0);
  const [resultLabel, setResultLabel] = useState<string | null>(null);
  const [playerHistory, setPlayerHistory] = useState<{ time: number; wpm: number }[]>([]);
  const [opponentHistory, setOpponentHistory] = useState<{ time: number; wpm: number }[]>([]);
  const [animatedElo, setAnimatedElo] = useState<number | null>(null);
  const [animatedDelta, setAnimatedDelta] = useState<number | null>(null);
  const [inviteLink, setInviteLink] = useState<string | null>(null);
  const [inviteExpiresAt, setInviteExpiresAt] = useState<number | null>(null);

  const queueSocketRef = useRef<PartySocket | null>(null);
  const matchSocketRef = useRef<PartySocket | null>(null);
  const playerIdRef = useRef<string>("");
  const playerNameRef = useRef<string>("Player");
  const hasUpdatedEloRef = useRef(false);
  const lastPlayerSecondRef = useRef<number | null>(null);
  const lastOpponentSecondRef = useRef<number | null>(null);
  const inviteHandledRef = useRef(false);
  const searchParams = useSearchParams();

  useEffect(() => {
    if (user?.profile?.elo != null) {
      setEloRecord({
        elo: user.profile.elo,
        matchesPlayed: user.profile.matches_played ?? 0,
        updatedAt: new Date().toISOString(),
      });
      return;
    }

    setEloRecord(loadEloRecord());
  }, [user]);

  useEffect(() => {
    if (user?.id) {
      playerIdRef.current = user.id;
      playerNameRef.current = user.profile?.username || "Player";
      return;
    }

    const storedId = localStorage.getItem(ANON_ID_KEY);
    const storedName = localStorage.getItem(ANON_NAME_KEY);
    const generatedId = storedId ?? `guest-${crypto.randomUUID().slice(0, 8)}`;
    const generatedName = storedName ?? `Guest-${generatedId.slice(-4)}`;

    localStorage.setItem(ANON_ID_KEY, generatedId);
    localStorage.setItem(ANON_NAME_KEY, generatedName);

    playerIdRef.current = generatedId;
    playerNameRef.current = generatedName;
    setQueueMode("unranked");
  }, [user]);

  const placementRemaining = useMemo(
    () => getPlacementRemaining(eloRecord.matchesPlayed),
    [eloRecord.matchesPlayed]
  );
  const rankLabel = useMemo(
    () => getRankLabel(eloRecord.elo, eloRecord.matchesPlayed),
    [eloRecord.elo, eloRecord.matchesPlayed]
  );

  const cleanSockets = useCallback(() => {
    queueSocketRef.current?.close();
    matchSocketRef.current?.close();
    queueSocketRef.current = null;
    matchSocketRef.current = null;
  }, []);

  const resetMatch = useCallback(() => {
    cleanSockets();
    setMatchState(null);
    setQueuePhase("idle");
    setErrorMessage(null);
    setEloDelta(0);
    setResultLabel(null);
    setPlayerHistory([]);
    setOpponentHistory([]);
    setAnimatedElo(null);
    setAnimatedDelta(null);
    setInviteLink(null);
    setInviteExpiresAt(null);
    hasUpdatedEloRef.current = false;
    lastPlayerSecondRef.current = null;
    lastOpponentSecondRef.current = null;
  }, [cleanSockets]);

  const handleQueue = useCallback(() => {
    if (!user && queueMode === "ranked") {
      setQueueMode("unranked");
      toast.error("Guests can only queue for unranked matches.");
      return;
    }
    resetMatch();
    setQueuePhase("queue");

    const socket = new PartySocket({
      host: PARTYKIT_HOST,
      room: `queue-${queueMode}-${duration}`,
    });

    socket.addEventListener("message", (event) => {
      const data = JSON.parse(event.data) as ServerMessage;
      if (data.type === "match-found") {
        socket.close();
        setQueuePhase("idle");
        connectToMatch(data.matchId, data.duration, queueMode);
      }
    });

    socket.addEventListener("open", () => {
      socket.send(
        JSON.stringify({
          type: "queue-join",
          userId: playerIdRef.current,
          name: playerNameRef.current,
          duration,
          mode: queueMode,
          elo: eloRecord.elo,
          rank: rankLabel,
        })
      );
    });

    socket.addEventListener("close", () => {
      if (queueSocketRef.current === socket) {
        queueSocketRef.current = null;
      }
    });

    queueSocketRef.current = socket;
  }, [duration, eloRecord.elo, rankLabel, resetMatch, queueMode, user]);

  const connectToMatch = useCallback(
    (matchId: string, matchDuration: number, modeOverride?: QueueMode) => {
      const parsed = parseMatchId(matchId);
      const resolvedMode = modeOverride ?? parsed?.mode ?? queueMode;
      const resolvedDuration = parsed?.duration ?? matchDuration;
      setQueueMode(resolvedMode);
      const socket = new PartySocket({
        host: PARTYKIT_HOST,
        room: matchId,
      });

      socket.addEventListener("message", (event) => {
        const data = JSON.parse(event.data) as ServerMessage;
        if (data.type === "match-state") {
          setMatchState(data.state);
        }
        if (data.type === "match-error") {
          setErrorMessage(data.message);
        }
      });

      socket.addEventListener("open", () => {
        socket.send(
          JSON.stringify({
            type: "match-join",
            userId: playerIdRef.current,
            name: playerNameRef.current,
            elo: eloRecord.elo,
            rank: rankLabel,
          })
        );
      });

      socket.addEventListener("close", () => {
        if (matchSocketRef.current === socket) {
          matchSocketRef.current = null;
        }
      });

      matchSocketRef.current = socket;
      setMatchState((prev) =>
        prev ?? {
          matchId,
          mode: resolvedMode,
          duration: resolvedDuration,
          text: "",
          phase: "lobby",
          startAt: null,
          players: {},
        }
      );
    },
    [eloRecord.elo, rankLabel, queueMode]
  );

  const handleCreateInvite = useCallback(async () => {
    if (queueMode !== "unranked") {
      toast.error("Invite links are only for unranked matches.");
      return;
    }
    resetMatch();
    const expiresAt = Date.now() + INVITE_TTL_MS;
    const matchId = `match-unranked-${duration}-${expiresAt}-${crypto.randomUUID()}`;
    const origin = window.location.origin;
    const link = `${origin}/multiplayer?invite=${matchId}`;
    setInviteLink(link);
    setInviteExpiresAt(expiresAt);
    connectToMatch(matchId, duration, "unranked");
    try {
      await navigator.clipboard.writeText(link);
      toast.success("Invite link copied");
    } catch {
      toast.error("Could not copy invite link");
    }
  }, [queueMode, resetMatch, duration, connectToMatch]);

  const handleCopyInvite = useCallback(async () => {
    if (!inviteLink) {
      return;
    }
    try {
      await navigator.clipboard.writeText(inviteLink);
      toast.success("Invite link copied");
    } catch {
      toast.error("Could not copy invite link");
    }
  }, [inviteLink]);

  useEffect(() => {
    const invite = searchParams.get("invite");
    if (!invite || inviteHandledRef.current) {
      return;
    }
    inviteHandledRef.current = true;
    const parsed = parseMatchId(invite);
    if (!parsed || parsed.mode !== "unranked") {
      toast.error("Invalid invite link");
      return;
    }
    if (parsed.expiresAt && Date.now() > parsed.expiresAt) {
      toast.error("Invite link expired");
      return;
    }
    setQueueMode("unranked");
    setDuration(parsed.duration);
    setInviteLink(`${window.location.origin}/multiplayer?invite=${invite}`);
    setInviteExpiresAt(parsed.expiresAt ?? null);
    connectToMatch(invite, parsed.duration, "unranked");
  }, [searchParams, connectToMatch]);

  const handleLeave = useCallback(() => {
    matchSocketRef.current?.send(
      JSON.stringify({ type: "leave", userId: playerIdRef.current })
    );
    if (matchState?.phase === "lobby") {
      resetMatch();
    }
  }, [resetMatch, matchState]);

  const handleReady = useCallback(
    (ready: boolean) => {
      matchSocketRef.current?.send(
        JSON.stringify({ type: "ready", userId: playerIdRef.current, ready })
      );
    },
    []
  );

  const handleProgress = useCallback((progress: number, wpm: number, elapsed: number) => {
    matchSocketRef.current?.send(
      JSON.stringify({
        type: "progress",
        userId: playerIdRef.current,
        progress,
        wpm,
      })
    );

    if (elapsed >= 0 && elapsed <= (matchState?.duration ?? elapsed)) {
      if (lastPlayerSecondRef.current !== elapsed) {
        lastPlayerSecondRef.current = elapsed;
        setPlayerHistory((prev) => [...prev, { time: elapsed, wpm }]);
      }
    }
  }, [matchState?.duration]);

  const handleFinish = useCallback(
    (stats: { wpm: number; rawWpm: number; accuracy: number; progress: number }) => {
      matchSocketRef.current?.send(
        JSON.stringify({
          type: "finish",
          userId: playerIdRef.current,
          ...stats,
        })
      );
    },
    []
  );

  useEffect(() => {
    if (!matchState || matchState.phase !== "finished" || hasUpdatedEloRef.current) {
      return;
    }

    const player = matchState.players[playerIdRef.current];
    const opponent = Object.values(matchState.players).find(
      (entry) => entry.id !== playerIdRef.current
    );

    if (!player || !opponent) {
      return;
    }

    let result: 0 | 0.5 | 1 = 0.5;
    if (opponent.left) {
      result = 1;
      setResultLabel("Victory (opponent left)");
    } else if (player.left) {
      result = 0;
      setResultLabel("Defeat (you left)");
    } else if (player.wpm > opponent.wpm) {
      result = 1;
      setResultLabel("Victory");
    } else if (player.wpm < opponent.wpm) {
      result = 0;
      setResultLabel("Defeat");
    } else {
      result = 0.5;
      setResultLabel("Draw");
    }

    if (!user || matchState.mode === "unranked") {
      hasUpdatedEloRef.current = true;
      return;
    }

    const isPlacement = eloRecord.matchesPlayed < 5;
    const updatedElo = calculateEloUpdate({
      currentElo: eloRecord.elo,
      opponentElo: opponent.elo,
      result,
      isPlacement,
    });

    const nextRecord = {
      elo: updatedElo,
      matchesPlayed: eloRecord.matchesPlayed + 1,
      updatedAt: new Date().toISOString(),
    };

    const delta = updatedElo - eloRecord.elo;
    setEloDelta(delta);
    setEloRecord(nextRecord);
    saveEloRecord(nextRecord);
    hasUpdatedEloRef.current = true;
    setAnimatedDelta(delta);

    const from = eloRecord.elo;
    const to = updatedElo;
    const start = performance.now();
    const durationMs = 1200;

    const tick = (now: number) => {
      const progress = Math.min(1, (now - start) / durationMs);
      const eased = 1 - Math.pow(1 - progress, 3);
      const value = Math.round(from + (to - from) * eased);
      setAnimatedElo(value);
      if (progress < 1) {
        requestAnimationFrame(tick);
      }
    };

    setAnimatedElo(from);
    requestAnimationFrame(tick);

    if (user?.id && matchState) {
      const [player1Id, player2Id] = [player.id, opponent.id].sort();
      const winnerId =
        result === 1 ? player.id : result === 0 ? opponent.id : null;
      const nextRank = getRankLabel(nextRecord.elo, nextRecord.matchesPlayed);

      const payload = {
        partyMatchId: matchState.matchId,
        duration: matchState.duration,
        text: matchState.text,
        startAt: matchState.startAt,
        endAt: Date.now(),
        player1Id,
        player2Id,
        winnerId,
        stats: {
          userId: player.id,
          wpm: player.wpm,
          rawWpm: player.rawWpm,
          accuracy: player.accuracy,
          progress: player.progress,
          leftMatch: player.left,
          eloBefore: eloRecord.elo,
          eloAfter: nextRecord.elo,
          rankTier: nextRank,
        },
        profileUpdate: {
          elo: nextRecord.elo,
          rank_tier: nextRank,
          matches_played: nextRecord.matchesPlayed,
          wins:
            (user.profile?.wins ?? 0) + (result === 1 ? 1 : 0),
          losses:
            (user.profile?.losses ?? 0) + (result === 0 ? 1 : 0),
        },
      };

      fetch("/api/multiplayer/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }).catch(() => {
        // Persistence is best-effort; local state already updated.
      });
    }
  }, [eloRecord, matchState, user]);

  useEffect(() => {
    return () => cleanSockets();
  }, [cleanSockets]);

  const isInMatch = matchState && matchState.phase !== "finished";

  const opponent = useMemo(() => {
    if (!matchState) {
      return null;
    }
    return (
      Object.values(matchState.players).find(
        (entry) => entry.id !== playerIdRef.current
      ) ?? null
    );
  }, [matchState]);

  const player = matchState?.players[playerIdRef.current];

  useEffect(() => {
    if (!matchState || !opponent || !matchState.startAt) {
      return;
    }
    if (matchState.phase === "lobby") {
      return;
    }

    const elapsed = Math.max(
      0,
      Math.min(
        matchState.duration,
        Math.floor((Date.now() - matchState.startAt) / 1000)
      )
    );

    if (lastOpponentSecondRef.current !== elapsed) {
      lastOpponentSecondRef.current = elapsed;
      setOpponentHistory((prev) => [...prev, { time: elapsed, wpm: opponent.wpm }]);
    }
  }, [matchState, opponent]);
  const opponentIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (!matchState || matchState.phase !== "lobby") {
      opponentIdRef.current = opponent?.id ?? null;
      return;
    }

    if (opponentIdRef.current && !opponent) {
      toast.error("Opponent left the lobby.");
    }

    opponentIdRef.current = opponent?.id ?? null;
  }, [matchState, opponent]);

  // Get rank color based on rank label
  const getRankColor = (rank: string) => {
    const colors: Record<string, string> = {
      Placement: "text-muted-foreground",
      Bronze: "text-amber-600",
      Silver: "text-slate-400",
      Gold: "text-yellow-500",
      Platinum: "text-cyan-400",
      Diamond: "text-blue-400",
      Sonic: "text-purple-500",
      Mach: "text-red-500",
    };
    return colors[rank] || "text-muted-foreground";
  };

  const getResultIcon = () => {
    if (resultLabel?.includes("Victory")) return <Crown className="h-8 w-8" />;
    if (resultLabel?.includes("Defeat")) return <TrendingDown className="h-8 w-8" />;
    return <Minus className="h-8 w-8" />;
  };

  const getResultColor = () => {
    if (resultLabel?.includes("Victory")) return "text-emerald-500";
    if (resultLabel?.includes("Defeat")) return "text-red-500";
    return "text-yellow-500";
  };

  // Determine which screen to show
  const currentScreen = !matchState
    ? "queue"
    : matchState.phase === "lobby"
    ? "lobby"
    : matchState.phase === "finished"
    ? "results"
    : matchState.text
    ? "match"
    : "queue";

  return (
    <div className="w-full flex flex-col items-center gap-6 pt-10 pb-16 px-4">
      <div className="w-full max-w-5xl space-y-6">
          {/* Queue Selection Screen */}
          {currentScreen === "queue" && (
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
                              onClick={handleCreateInvite}
                              disabled={queuePhase === "queue"}
                              className="gap-2"
                            >
                              <Link2 className="h-4 w-4" />
                              Create Invite
                            </Button>
                            {inviteLink && (
                              <Button variant="ghost" size="icon" onClick={handleCopyInvite}>
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
                        variant={queueSize === 2 ? "default" : "secondary"}
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
                    <Button variant="ghost" onClick={resetMatch}>
                      Cancel Queue
                    </Button>
                  </div>
                ) : (
                  <div className="flex justify-center">
                    <Button
                      onClick={handleQueue}
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
          )}

          {/* Lobby Screen */}
          {currentScreen === "lobby" && matchState && (
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
                        <p className={`text-sm ${getRankColor(player?.rank ?? rankLabel)}`}>
                          {player?.rank ?? rankLabel}
                        </p>
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
                            <p className={`text-sm ${getRankColor(opponent.rank ?? "Placement")}`}>
                              {opponent.rank ?? "Placement"}
                            </p>
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
                  onClick={() => handleReady(!player?.ready)}
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
                <Button variant="ghost" onClick={handleLeave}>
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
                        <Button variant="ghost" size="sm" onClick={handleCopyInvite} className="gap-2">
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
          )}

          {/* Active Match Screen */}
          {currentScreen === "match" && matchState && (
            <div>
              <MultiplayerMatch
                text={matchState.text}
                duration={matchState.duration}
                phase={matchState.phase as MatchPhase}
                startAt={matchState.startAt}
                opponentProgress={opponent?.progress ?? 0}
                onProgress={handleProgress}
                onFinish={handleFinish}
              />
            </div>
          )}

          {/* Results Screen */}
          {currentScreen === "results" && matchState && (
            <div className="space-y-6">
              {/* Result Banner */}
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", duration: 0.5 }}
                className={`relative overflow-hidden rounded-2xl p-8 text-center ${
                  resultLabel?.includes("Victory")
                    ? "bg-gradient-to-br from-emerald-500/20 via-emerald-500/10 to-transparent border-2 border-emerald-500/30"
                    : resultLabel?.includes("Defeat")
                    ? "bg-gradient-to-br from-red-500/20 via-red-500/10 to-transparent border-2 border-red-500/30"
                    : "bg-gradient-to-br from-yellow-500/20 via-yellow-500/10 to-transparent border-2 border-yellow-500/30"
                }`}
              >
                {/* Decorative Elements */}
                {resultLabel?.includes("Victory") && (
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
                  className={`inline-flex items-center justify-center h-20 w-20 rounded-full mb-4 ${
                    resultLabel?.includes("Victory")
                      ? "bg-emerald-500/20"
                      : resultLabel?.includes("Defeat")
                      ? "bg-red-500/20"
                      : "bg-yellow-500/20"
                  }`}
                >
                  <span className={getResultColor()}>
                    {getResultIcon()}
                  </span>
                </motion.div>

                <motion.h2
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className={`text-4xl font-bold ${getResultColor()}`}
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
                          <p className={`text-xs ${getRankColor(player?.rank ?? rankLabel)}`}>
                            {player?.rank ?? rankLabel}
                          </p>
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
                          <p className={`text-xs ${getRankColor(opponent?.rank ?? "Placement")}`}>
                            {opponent?.rank ?? "Placement"}
                          </p>
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
                          <p className={`text-2xl font-bold ${getRankColor(getRankLabel(eloRecord.elo, eloRecord.matchesPlayed))}`}>
                            {getRankLabel(eloRecord.elo, eloRecord.matchesPlayed)}
                          </p>
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
                  onClick={resetMatch}
                  size="lg"
                  className="gap-3 px-8 py-6 text-lg font-semibold"
                >
                  <Swords className="h-5 w-5" />
                  Play Again
                  <ChevronRight className="h-5 w-5" />
                </Button>
              </motion.div>
            </div>
          )}
      </div>
    </div>
  );
};

const InviteLinkDetails = ({ link, expiresAt }: { link: string; expiresAt: number | null }) => {
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
};


export default MultiplayerClient;
