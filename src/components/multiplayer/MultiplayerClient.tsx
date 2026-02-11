"use client";

import PartySocket from "partysocket";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import toast from "react-hot-toast";
import dynamic from "next/dynamic";
import { QueueScreen } from "./QueueScreen";

const MultiplayerMatch = dynamic(() => import("./MultiplayerMatch"), { ssr: false, loading: () => null });
const LobbyScreen = dynamic(() => import("./LobbyScreen").then(m => m.LobbyScreen), { ssr: false, loading: () => null });
const ResultsScreen = dynamic(() => import("./ResultsScreen").then(m => m.ResultsScreen), { ssr: false, loading: () => null });
const RankChangeAnimation = dynamic(() => import("./RankChangeAnimation").then(m => m.RankChangeAnimation), { ssr: false, loading: () => null });
import { MatchPhase, MatchState, ServerMessage } from "@/types/multiplayer.types";
import {
  ANON_ID_KEY,
  ANON_NAME_KEY,
  calculateEloUpdate,
  getPlacementRemaining,
  getRankLabel,
  loadEloRecord,
  saveEloRecord,
  parseMatchId,
} from "@/lib/multiplayer";
import { UserWithProfile } from "@/types/auth.types";
import type { LevelUpData } from "@/components/LevelUpModal";
import type { ActiveBanner } from "@/types/banner.types";

const CongratsModal = dynamic(() => import("@/components/CongratsModal").then(m => m.CongratsModal), { ssr: false, loading: () => null });
const BadgeNotification = dynamic(() => import("@/components/BadgeNotification").then(m => m.BadgeNotification), { ssr: false, loading: () => null });
const LevelUpModal = dynamic(() => import("@/components/LevelUpModal").then(m => m.LevelUpModal), { ssr: false, loading: () => null });
import type { AchievementData } from "@/lib/services/achievements";
import type { BadgeNotification as BadgeNotificationData } from "@/types/badges.types";
import { checkAchievements, getPreSaveState, getUserXpProgress, getActiveBanner } from "@/app/actions";

type MultiplayerClientProps = {
  user?: UserWithProfile | null;
};

type QueuePhase = "idle" | "queue";
type QueueMode = "ranked" | "unranked";

const PARTYKIT_HOST =
  process.env.NEXT_PUBLIC_PARTYKIT_HOST || "localhost:1999";
const INVITE_TTL_MS = 10 * 60 * 1000;

const MultiplayerClient = ({ user }: MultiplayerClientProps) => {
  const [duration, setDuration] = useState<30 | 60>(30);
  const [queueMode, setQueueMode] = useState<QueueMode>("ranked");
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
  const [achievementQueue, setAchievementQueue] = useState<AchievementData[]>([]);
  const [badgeQueue, setBadgeQueue] = useState<BadgeNotificationData[]>([]);
  const [levelUpData, setLevelUpData] = useState<LevelUpData | null>(null);
  const [rankChange, setRankChange] = useState<{
    previousRank: string;
    newRank: string;
    isRankUp: boolean;
  } | null>(null);

  const [userBanner, setUserBanner] = useState<ActiveBanner | null>(null);
  const [opponentBanner, setOpponentBanner] = useState<ActiveBanner | null>(null);

  const queueSocketRef = useRef<PartySocket | null>(null);
  const matchSocketRef = useRef<PartySocket | null>(null);
  const playerIdRef = useRef<string>("");
  const playerNameRef = useRef<string>("Player");
  const hasUpdatedEloRef = useRef(false);
  const lastPlayerSecondRef = useRef<number | null>(null);
  const lastOpponentSecondRef = useRef<number | null>(null);
  const inviteHandledRef = useRef(false);
  const opponentIdRef = useRef<string | null>(null);
  const searchParams = useSearchParams();

  // Load elo record from user profile or localStorage
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

  // Set player identity
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
    setAchievementQueue([]);
    setBadgeQueue([]);
    setRankChange(null);
    setOpponentBanner(null);
    hasUpdatedEloRef.current = false;
    lastPlayerSecondRef.current = null;
    lastOpponentSecondRef.current = null;
  }, [cleanSockets]);

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
        let data: ServerMessage;
        try {
          data = JSON.parse(event.data) as ServerMessage;
        } catch {
          return;
        }
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
      let data: ServerMessage;
      try {
        data = JSON.parse(event.data) as ServerMessage;
      } catch {
        return;
      }
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
  }, [duration, eloRecord.elo, rankLabel, resetMatch, queueMode, user, connectToMatch]);

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
    if (!inviteLink) return;
    try {
      await navigator.clipboard.writeText(inviteLink);
      toast.success("Invite link copied");
    } catch {
      toast.error("Could not copy invite link");
    }
  }, [inviteLink]);

  // Handle invite link from URL
  useEffect(() => {
    const invite = searchParams.get("invite");
    if (!invite || inviteHandledRef.current) return;

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

  const handleReady = useCallback((ready: boolean) => {
    matchSocketRef.current?.send(
      JSON.stringify({ type: "ready", userId: playerIdRef.current, ready })
    );
  }, []);

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

  const opponent = useMemo(() => {
    if (!matchState) return null;
    return (
      Object.values(matchState.players).find(
        (entry) => entry.id !== playerIdRef.current
      ) ?? null
    );
  }, [matchState]);

  const player = matchState?.players[playerIdRef.current];

  // Handle match finish and elo updates
  useEffect(() => {
    if (!matchState || matchState.phase !== "finished" || hasUpdatedEloRef.current) {
      return;
    }

    const player = matchState.players[playerIdRef.current];
    const opponent = Object.values(matchState.players).find(
      (entry) => entry.id !== playerIdRef.current
    );

    if (!player || !opponent) return;

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

    // Capture previous rank before Elo update
    const previousRank = getRankLabel(eloRecord.elo, eloRecord.matchesPlayed);

    const { newElo, delta } = calculateEloUpdate({
      currentElo: eloRecord.elo,
      opponentElo: opponent.elo,
      result,
      matchesPlayed: eloRecord.matchesPlayed,
      playerWpm: player.wpm,
      opponentWpm: opponent.wpm,
    });

    const nextRecord = {
      elo: newElo,
      matchesPlayed: eloRecord.matchesPlayed + 1,
      updatedAt: new Date().toISOString(),
    };

    // Calculate new rank and detect rank change
    const newRank = getRankLabel(newElo, nextRecord.matchesPlayed);
    if (previousRank !== newRank && newRank !== "Placement") {
      // Determine rank order for comparison (Placement → Any Rank is always a rank up)
      const rankOrder = ["Bronze", "Silver", "Gold", "Platinum", "Diamond", "Sonic", "Mach", "Tachyon"];
      const prevIndex = previousRank === "Placement" ? -1 : rankOrder.indexOf(previousRank);
      const newIndex = rankOrder.indexOf(newRank);
      const isRankUp = newIndex > prevIndex;

      // Delay rank change animation to show after Elo animation completes
      setTimeout(() => {
        setRankChange({ previousRank, newRank, isRankUp });
      }, 1500);
    }

    setEloDelta(delta);
    setEloRecord(nextRecord);
    saveEloRecord(nextRecord);
    hasUpdatedEloRef.current = true;
    setAnimatedDelta(delta);

    // Animate elo change
    const from = eloRecord.elo;
    const to = newElo;
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

    // Persist match results (Elo is calculated server-side)
    if (user?.id && matchState) {
      const [player1Id, player2Id] = [player.id, opponent.id].sort();
      const winnerId =
        result === 1 ? player.id : result === 0 ? opponent.id : null;

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
          opponentWpm: opponent.wpm,
        },
        // Server-side Elo calculation params
        isRanked: matchState.mode === "ranked",
        opponentId: opponent.id,
        result, // 0 = loss, 0.5 = draw, 1 = win
      };

      // Fetch pre-save state, save results, then check achievements
      (async () => {
        try {
          const preSaveState = await getPreSaveState();

          const response = await fetch("/api/multiplayer/complete", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });

          // Server returns authoritative Elo values
          const data = await response.json();
          if (data.elo) {
            // Server calculated Elo - could update local state here if needed
            // For now, we trust the client prediction for UI animation
            // and the server has updated the database authoritatively
          }

          // Notify Nav to update XP bar
          if (data.xp) {
            window.dispatchEvent(new CustomEvent("xp-updated", {
              detail: {
                totalXp: data.xp.newXp,
                level: data.xp.newLevel,
                xpGained: data.xp.xpGained,
              }
            }));

            // Show level-up modal if user leveled up
            if (data.xp.leveledUp) {
              setLevelUpData({
                oldLevel: data.xp.previousLevel,
                newLevel: data.xp.newLevel,
                xpGained: data.xp.xpGained,
              });
            }
          }

          // Handle badges from server response
          if (data.badges && data.badges.length > 0) {
            setBadgeQueue(data.badges);

            // If badges awarded XP, refresh the XP bar
            const totalBadgeXp = data.badges.reduce((sum: number, b: BadgeNotificationData) => sum + (b.xpAwarded || 0), 0);
            if (totalBadgeXp > 0) {
              const xpProgress = await getUserXpProgress();
              if (xpProgress) {
                window.dispatchEvent(new CustomEvent("xp-updated", {
                  detail: {
                    totalXp: xpProgress.totalXp,
                    level: xpProgress.level,
                    xpGained: totalBadgeXp,
                  }
                }));
              }
            }
          }

          // Check for achievements by comparing pre-save state with new result
          if (preSaveState) {
            const achievements = await checkAchievements(
              player.wpm,
              matchState.duration,
              preSaveState
            );
            if (achievements.length > 0) {
              setAchievementQueue(achievements);
            }
          }
        } catch {
          // Silently handle errors
        }
      })();
    }
  }, [eloRecord, matchState, user]);

  // Track opponent history
  useEffect(() => {
    if (!matchState || !opponent || !matchState.startAt) return;
    if (matchState.phase === "lobby") return;

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

  // Notify when opponent leaves lobby
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

  // Fetch user banner when entering the lobby (deferred from SSR)
  useEffect(() => {
    if (!user?.id || matchState?.phase !== "lobby") {
      return;
    }
    let cancelled = false;
    getActiveBanner(user.id).then((banner) => {
      if (!cancelled) setUserBanner(banner);
    });
    return () => { cancelled = true; };
  }, [user?.id, matchState?.phase]);

  // Fetch opponent banner when they join the lobby
  useEffect(() => {
    if (!opponent?.id || matchState?.phase !== "lobby") {
      return;
    }
    let cancelled = false;
    getActiveBanner(opponent.id).then((banner) => {
      if (!cancelled) setOpponentBanner(banner);
    });
    return () => { cancelled = true; };
  }, [opponent?.id, matchState?.phase]);

  // Cleanup sockets on unmount
  useEffect(() => {
    return () => cleanSockets();
  }, [cleanSockets]);

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
      {/* Active Match Screen - Full width */}
      {currentScreen === "match" && matchState && (
        <div className="w-full">
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

      <div className={`w-full max-w-5xl space-y-6 ${currentScreen === "match" ? "hidden" : ""}`}>
        {currentScreen === "queue" && (
          <QueueScreen
            user={user}
            queueMode={queueMode}
            setQueueMode={setQueueMode}
            duration={duration}
            setDuration={setDuration}
            queuePhase={queuePhase}
            eloRecord={eloRecord}
            rankLabel={rankLabel}
            placementRemaining={placementRemaining}
            inviteLink={inviteLink}
            inviteExpiresAt={inviteExpiresAt}
            onQueue={handleQueue}
            onCreateInvite={handleCreateInvite}
            onCopyInvite={handleCopyInvite}
            onCancelQueue={resetMatch}
            errorMessage={errorMessage}
          />
        )}

        {currentScreen === "lobby" && matchState && (
          <LobbyScreen
            matchState={matchState}
            player={player}
            opponent={opponent}
            rankLabel={rankLabel}
            inviteLink={inviteLink}
            inviteExpiresAt={inviteExpiresAt}
            playerBanner={userBanner ?? null}
            opponentBanner={opponentBanner}
            onReady={handleReady}
            onLeave={handleLeave}
            onCopyInvite={handleCopyInvite}
          />
        )}

        {currentScreen === "results" && matchState && (
          <ResultsScreen
            matchState={matchState}
            player={player}
            opponent={opponent}
            resultLabel={resultLabel}
            eloRecord={eloRecord}
            rankLabel={rankLabel}
            animatedElo={animatedElo}
            animatedDelta={animatedDelta}
            eloDelta={eloDelta}
            playerHistory={playerHistory}
            opponentHistory={opponentHistory}
            onPlayAgain={resetMatch}
          />
        )}
      </div>

      {/* Rank Change Animation */}
      <RankChangeAnimation
        isOpen={rankChange !== null}
        onComplete={() => setRankChange(null)}
        previousRank={rankChange?.previousRank ?? ""}
        newRank={rankChange?.newRank ?? ""}
        isRankUp={rankChange?.isRankUp ?? true}
      />

      {/* Congratulations Modal */}
      <CongratsModal
        open={achievementQueue.length > 0}
        onClose={() => setAchievementQueue((prev) => prev.slice(1))}
        achievement={achievementQueue[0] ?? null}
      />

      {/* Level Up Modal */}
      <LevelUpModal
        open={levelUpData !== null && achievementQueue.length === 0 && rankChange === null}
        onClose={() => setLevelUpData(null)}
        data={levelUpData}
      />

      {/* Badge Notification */}
      <BadgeNotification
        open={badgeQueue.length > 0 && achievementQueue.length === 0 && rankChange === null && levelUpData === null}
        onClose={() => setBadgeQueue((prev) => prev.slice(1))}
        notification={badgeQueue[0] ?? null}
      />
    </div>
  );
};

export default MultiplayerClient;
