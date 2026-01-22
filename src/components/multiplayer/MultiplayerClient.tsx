"use client";

import PartySocket from "partysocket";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { useSearchParams } from "next/navigation";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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

  return (
    <div className="w-full flex flex-col items-center gap-6 pt-24 pb-16">
      <div className="w-full max-w-5xl space-y-6">
        {!matchState && (
          <Card>
            <CardHeader>
              <CardTitle>Multiplayer</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <div className="grid gap-4 md:grid-cols-2">
                <button
                  type="button"
                  onClick={() => setQueueMode("ranked")}
                  disabled={queuePhase === "queue" || !user}
                  className={`rounded-lg border p-4 text-left transition-all ${
                    queueMode === "ranked"
                      ? "border-primary bg-primary/5"
                      : "border-border/60 hover:border-primary/60"
                  } ${!user ? "opacity-60 cursor-not-allowed" : ""}`}
                >
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">Ranked</h3>
                    {queueMode === "ranked" && (
                      <span className="text-xs text-primary">Selected</span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    Compete for Elo and placement matches.
                  </p>
                  <div className="mt-3 text-xs text-muted-foreground">
                    Rank: <span className="text-foreground font-medium">{rankLabel}</span>{" "}
                    · Elo: <span className="text-foreground font-medium">{eloRecord.elo}</span>{" "}
                    · Placement remaining:{" "}
                    <span className="text-foreground font-medium">{placementRemaining}</span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setQueueMode("unranked")}
                  disabled={queuePhase === "queue"}
                  className={`rounded-lg border p-4 text-left transition-all ${
                    queueMode === "unranked"
                      ? "border-primary bg-primary/5"
                      : "border-border/60 hover:border-primary/60"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">Unranked</h3>
                    {queueMode === "unranked" && (
                      <span className="text-xs text-primary">Selected</span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    Warm up and play casually without Elo changes.
                  </p>
                  {!user && (
                    <p className="mt-3 text-xs text-muted-foreground">
                      Guests can only queue for unranked matches.
                    </p>
                  )}
                </button>
              </div>

              {queueMode === "unranked" && (
                <div className="rounded-lg border border-border/50 p-4">
                  <p className="text-sm font-medium mb-2">Invite a friend</p>
                  <p className="text-xs text-muted-foreground">
                    Create a magic link for an unranked lobby.
                  </p>
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <Button
                      variant="secondary"
                      onClick={handleCreateInvite}
                      disabled={queuePhase === "queue"}
                    >
                      Create invite link
                    </Button>
                    {inviteLink && (
                      <Button variant="ghost" onClick={handleCopyInvite}>
                        Copy link
                      </Button>
                    )}
                  </div>
                  {inviteLink && (
                    <InviteLinkDetails link={inviteLink} expiresAt={inviteExpiresAt} />
                  )}
                </div>
              )}

              <div className="rounded-lg border border-border/50 p-4">
                <p className="text-sm font-medium mb-3">Match format</p>
                <div className="flex flex-wrap items-center gap-3">
                  <Button variant={queueSize === 2 ? "default" : "secondary"} disabled>
                    1v1
                  </Button>
                  <Button variant="secondary" disabled title="Coming soon">
                    Three Way
                  </Button>
                  <Button variant="secondary" disabled title="Coming soon">
                    Four Way
                  </Button>
                </div>
                <p className="mt-3 text-xs text-muted-foreground">
                  More match sizes coming soon.
                </p>
              </div>

              <div className="rounded-lg border border-border/50 p-4">
                <p className="text-sm font-medium mb-3">Time</p>
                <div className="flex flex-wrap items-center gap-3">
                  <Button
                    variant={duration === 30 ? "default" : "secondary"}
                    onClick={() => setDuration(30)}
                    disabled={queuePhase === "queue"}
                  >
                    30s
                  </Button>
                  <Button
                    variant={duration === 60 ? "default" : "secondary"}
                    onClick={() => setDuration(60)}
                    disabled={queuePhase === "queue"}
                  >
                    60s
                  </Button>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3 justify-end">
                {queuePhase === "queue" && (
                  <Button variant="ghost" onClick={resetMatch}>
                    Cancel
                  </Button>
                )}
                <Button onClick={handleQueue} disabled={queuePhase === "queue"}>
                  Queue
                </Button>
              </div>
              {queuePhase === "queue" && (
                <p className="text-sm text-primary">Searching for an opponent...</p>
              )}
              {errorMessage && <p className="text-sm text-destructive">{errorMessage}</p>}
            </CardContent>
          </Card>
        )}

        {matchState && matchState.phase === "lobby" && (
          <Card>
            <CardHeader>
              <CardTitle>Lobby</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-3 md:grid-cols-2">
                <div className="rounded-md border border-border/50 p-3">
                  <p className="text-sm text-muted-foreground">You</p>
                  <p className="font-semibold">{player?.name ?? "You"}</p>
                  <p className="text-xs text-muted-foreground">
                    {player?.ready ? "Ready" : "Not ready"}
                  </p>
                </div>
                <div className="rounded-md border border-border/50 p-3">
                  <p className="text-sm text-muted-foreground">Opponent</p>
                  <p className="font-semibold">{opponent?.name ?? "Joining..."}</p>
                  <p className="text-xs text-muted-foreground">
                    {opponent?.ready ? "Ready" : "Not ready"}
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap gap-3">
                <Button
                  onClick={() => handleReady(!player?.ready)}
                  disabled={!opponent}
                >
                  {player?.ready ? "Unready" : "Ready"}
                </Button>
                <Button variant="ghost" onClick={handleLeave}>
                  Leave Lobby
                </Button>
              </div>

              {matchState?.mode === "unranked" && inviteLink && (
                <div className="rounded-md border border-border/50 p-3">
                  <p className="text-xs text-muted-foreground">Invite link</p>
                  <InviteLinkDetails link={inviteLink} expiresAt={inviteExpiresAt} />
                  <div className="mt-2">
                    <Button variant="ghost" onClick={handleCopyInvite}>
                      Copy link
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {matchState && matchState.text && matchState.phase !== "finished" && matchState.phase !== "lobby" && (
          <MultiplayerMatch
            text={matchState.text}
            duration={matchState.duration}
            phase={matchState.phase as MatchPhase}
            startAt={matchState.startAt}
            opponentProgress={opponent?.progress ?? 0}
            onProgress={handleProgress}
            onFinish={handleFinish}
          />
        )}

        {matchState && matchState.phase === "finished" && (
          <Card>
            <CardHeader>
              <CardTitle>Match Results</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="rounded-lg border border-border/50 bg-muted/30 p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">
                      Result
                    </p>
                    <p className="text-2xl font-semibold">
                      {resultLabel ?? "Match finished"}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                    <span className="rounded-full bg-secondary px-3 py-1">
                      {matchState.mode === "ranked" ? "Ranked" : "Unranked"}
                    </span>
                    <span className="rounded-full bg-secondary px-3 py-1">
                      {matchState.duration}s
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-lg border border-border/50 bg-card/60 p-4">
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">You</p>
                  <p className="text-lg font-semibold">{player?.name ?? "You"}</p>
                  <div className="mt-3 grid gap-2 text-sm text-muted-foreground">
                    <div className="flex items-center justify-between">
                      <span>WPM</span>
                      <span className="text-foreground font-medium">
                        {player?.wpm.toFixed(1) ?? "0"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Accuracy</span>
                      <span className="text-foreground font-medium">
                        {player?.accuracy ?? 100}%
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Rank</span>
                      <span className="text-foreground font-medium">
                        {player?.rank ?? rankLabel}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="rounded-lg border border-border/50 bg-card/60 p-4">
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">
                    Opponent
                  </p>
                  <p className="text-lg font-semibold">{opponent?.name ?? "Opponent"}</p>
                  <div className="mt-3 grid gap-2 text-sm text-muted-foreground">
                    <div className="flex items-center justify-between">
                      <span>WPM</span>
                      <span className="text-foreground font-medium">
                        {opponent?.wpm.toFixed(1) ?? "0"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Accuracy</span>
                      <span className="text-foreground font-medium">
                        {opponent?.accuracy ?? 100}%
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Rank</span>
                      <span className="text-foreground font-medium">
                        {opponent?.rank ?? "Placement"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {matchState.mode === "ranked" ? (
                <div className="rounded-lg border border-border/50 bg-primary/5 p-4 text-sm text-muted-foreground">
                  Elo update:{" "}
                  <span className="text-foreground font-semibold">
                    {animatedElo ?? eloRecord.elo}
                  </span>{" "}
                  ({(animatedDelta ?? eloDelta) >= 0 ? "+" : ""}
                  {animatedDelta ?? eloDelta}) · Rank:{" "}
                  <span className="text-foreground font-semibold">
                    {getRankLabel(eloRecord.elo, eloRecord.matchesPlayed)}
                  </span>
                </div>
              ) : (
                <div className="rounded-lg border border-border/50 bg-muted/30 p-4 text-sm text-muted-foreground">
                  Unranked match — no Elo changes.
                </div>
              )}

              <div className="grid gap-6 md:grid-cols-2">
                <div className="rounded-lg border border-border/50 bg-card/60 p-4">
                  <p className="text-sm font-medium">{player?.name ?? "You"} WPM</p>
                  {playerHistory.length > 1 ? (
                    <ResultsChart data={playerHistory} duration={matchState.duration} />
                  ) : (
                    <p className="text-sm text-muted-foreground mt-2">No chart data.</p>
                  )}
                </div>
                <div className="rounded-lg border border-border/50 bg-card/60 p-4">
                  <p className="text-sm font-medium">
                    {opponent?.name ?? "Opponent"} WPM
                  </p>
                  {opponentHistory.length > 1 ? (
                    <ResultsChart data={opponentHistory} duration={matchState.duration} />
                  ) : (
                    <p className="text-sm text-muted-foreground mt-2">No chart data.</p>
                  )}
                </div>
              </div>

              <div className="flex justify-end">
                <Button onClick={resetMatch}>Queue Another Match</Button>
              </div>
            </CardContent>
          </Card>
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
    <div className="mt-2 space-y-1">
      <p className="text-xs text-muted-foreground break-all">{link}</p>
      {minutesLeft !== null && (
        <p className="text-[11px] text-muted-foreground">Expires in {minutesLeft}m</p>
      )}
    </div>
  );
};


export default MultiplayerClient;
