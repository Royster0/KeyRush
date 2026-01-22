import type * as PartyKit from "partykit/server";
import { WORD_POOL } from "../src/lib/constants";

type QueuePlayer = {
  connectionId: string;
  userId: string;
  name: string;
  duration: number;
  elo: number;
  rank: string;
};

type MatchPlayer = {
  id: string;
  name: string;
  ready: boolean;
  progress: number;
  wpm: number;
  rawWpm: number;
  accuracy: number;
  finished: boolean;
  left: boolean;
  elo: number;
  rank: string;
};

type MatchState = {
  matchId: string;
  mode: "ranked" | "unranked";
  duration: number;
  text: string;
  phase: "lobby" | "countdown" | "active" | "finished";
  startAt: number | null;
  players: Record<string, MatchPlayer>;
};

function generateText() {
  const BUFFER_SIZE = 10;
  const words: string[] = [];
  const recentWords: string[] = [];

  for (let i = 0; i < 400; i += 1) {
    let newWord = WORD_POOL[Math.floor(Math.random() * WORD_POOL.length)];
    let attempts = 0;

    while (recentWords.includes(newWord) && attempts < 50) {
      newWord = WORD_POOL[Math.floor(Math.random() * WORD_POOL.length)];
      attempts += 1;
    }

    words.push(newWord);
    recentWords.push(newWord);
    if (recentWords.length > BUFFER_SIZE) {
      recentWords.shift();
    }
  }

  return words.join(" ");
}

export default class Server implements PartyKit.Server {
  private waitingQueue: QueuePlayer[] = [];
  private matchState: MatchState | null = null;
  private connectionMap = new Map<string, string>();
  private startTimer: number | null = null;
  private finishTimer: number | null = null;

  constructor(readonly party: PartyKit.Party) {}

  onConnect(connection: PartyKit.Connection, ctx: PartyKit.ConnectionContext) {
    if (this.isQueueRoom()) {
      connection.send(JSON.stringify({ type: "queue-ready" }));
      return;
    }

    if (!this.matchState) {
      const url = new URL(ctx.request.url);
      const durationParam = url.searchParams.get("duration");
      const idParts = this.party.id.split("-");
      const durationFromId = idParts.length > 3 ? Number(idParts[2]) : null;
      const modeFromId = idParts.length > 3 ? idParts[1] : "ranked";
      const duration = durationFromId === 60 || Number(durationParam) === 60 ? 60 : 30;
      this.matchState = {
        matchId: this.party.id,
        mode: modeFromId === "unranked" ? "unranked" : "ranked",
        duration,
        text: generateText(),
        phase: "lobby",
        startAt: null,
        players: {},
      };
    }
  }

  onMessage(message: string, sender: PartyKit.Connection) {
    let payload: any;
    try {
      payload = JSON.parse(message);
    } catch {
      return;
    }

    if (this.isQueueRoom()) {
      this.handleQueueMessage(payload, sender);
      return;
    }

    this.handleMatchMessage(payload, sender);
  }

  onClose(connection: PartyKit.Connection) {
    if (this.isQueueRoom()) {
      this.waitingQueue = this.waitingQueue.filter(
        (entry) => entry.connectionId !== connection.id
      );
      return;
    }

    if (!this.matchState) {
      return;
    }

    const playerId = this.connectionMap.get(connection.id);
    const player = playerId ? this.matchState.players[playerId] : undefined;

    if (player) {
      if (this.matchState.phase === "lobby") {
        delete this.matchState.players[player.id];
        this.connectionMap.delete(connection.id);
        this.broadcastState();
        return;
      }

      player.left = true;
      player.ready = false;
      this.broadcastState();
      this.finalizeMatch();
    }
  }

  private isQueueRoom() {
    return this.party.id.startsWith("queue-");
  }

  private handleQueueMessage(payload: any, sender: PartyKit.Connection) {
    if (payload?.type === "queue-join") {
      const existing = this.waitingQueue.find(
        (entry) => entry.connectionId === sender.id
      );
      if (!existing) {
        this.waitingQueue.push({
          connectionId: sender.id,
          userId: payload.userId,
          name: payload.name,
          duration: payload.duration,
          elo: payload.elo ?? 1000,
          rank: payload.rank ?? "Placement",
        });
      }

      if (this.waitingQueue.length >= 2) {
        const first = this.waitingQueue.shift();
        const second = this.waitingQueue.shift();

        if (first && second) {
          const modePrefix = this.party.id.startsWith("queue-unranked")
            ? "unranked"
            : "ranked";
          const fullMatchId = `match-${modePrefix}-${first.duration}-${crypto.randomUUID()}`;
          const payload = JSON.stringify({
            type: "match-found",
            matchId: fullMatchId,
            duration: first.duration,
          });
          this.party.getConnection(first.connectionId)?.send(payload);
          this.party.getConnection(second.connectionId)?.send(payload);
          this.party.getConnection(first.connectionId)?.close();
          this.party.getConnection(second.connectionId)?.close();
        }
      }
    }
  }

  private handleMatchMessage(payload: any, sender: PartyKit.Connection) {
    if (!this.matchState) {
      return;
    }

    if (payload?.type === "match-join") {
      const playerId = payload.userId ?? sender.id;
      this.connectionMap.set(sender.id, playerId);
      this.matchState.players[playerId] = {
        id: playerId,
        name: payload.name ?? "Unknown",
        ready: false,
        progress: 0,
        wpm: 0,
        rawWpm: 0,
        accuracy: 100,
        finished: false,
        left: false,
        elo: payload.elo ?? 1000,
        rank: payload.rank ?? "Placement",
      };

      this.broadcastState();
      return;
    }

    if (payload?.type === "ready") {
      const player = this.matchState.players[payload.userId];
      if (!player) {
        return;
      }
      player.ready = Boolean(payload.ready);
      this.broadcastState();
      this.tryStartMatch();
      return;
    }

    if (payload?.type === "progress") {
      const player = this.matchState.players[payload.userId];
      if (!player) {
        return;
      }
      player.progress = payload.progress ?? player.progress;
      player.wpm = payload.wpm ?? player.wpm;
      this.broadcastState();
      return;
    }

    if (payload?.type === "finish") {
      const player = this.matchState.players[payload.userId];
      if (!player) {
        return;
      }
      player.progress = payload.progress ?? player.progress;
      player.wpm = payload.wpm ?? player.wpm;
      player.rawWpm = payload.rawWpm ?? player.rawWpm;
      player.accuracy = payload.accuracy ?? player.accuracy;
      player.finished = true;
      this.broadcastState();
      this.finalizeMatch();
      return;
    }

    if (payload?.type === "leave") {
      const player = this.matchState.players[payload.userId];
      if (!player) {
        return;
      }
      if (this.matchState.phase === "lobby") {
        delete this.matchState.players[payload.userId];
        this.broadcastState();
        return;
      }

      player.left = true;
      player.ready = false;
      this.broadcastState();
      this.finalizeMatch();
    }
  }

  private broadcastState() {
    if (!this.matchState) {
      return;
    }
    this.party.broadcast(
      JSON.stringify({
        type: "match-state",
        state: this.matchState,
      })
    );
  }

  private tryStartMatch() {
    if (!this.matchState || this.matchState.phase !== "lobby") {
      return;
    }

    const players = Object.values(this.matchState.players);
    if (players.length < 2 || players.some((player) => !player.ready)) {
      return;
    }

    this.matchState.phase = "countdown";
    this.matchState.startAt = Date.now() + 3000;
    this.broadcastState();

    this.clearTimers();
    this.startTimer = setTimeout(() => {
      if (!this.matchState || this.matchState.phase !== "countdown") {
        return;
      }
      this.matchState.phase = "active";
      this.broadcastState();
    }, 3000) as unknown as number;

    this.finishTimer = setTimeout(() => {
      this.finalizeMatch();
    }, 3000 + this.matchState.duration * 1000 + 500) as unknown as number;
  }

  private finalizeMatch() {
    if (!this.matchState || this.matchState.phase === "finished") {
      return;
    }

    const players = Object.values(this.matchState.players);
    const allDone = players.length >= 2 && players.every((player) => player.finished || player.left);
    if (!allDone && this.matchState.phase !== "active") {
      return;
    }

    this.matchState.phase = "finished";
    this.broadcastState();
    this.clearTimers();
  }

  private clearTimers() {
    if (this.startTimer) {
      clearTimeout(this.startTimer);
      this.startTimer = null;
    }
    if (this.finishTimer) {
      clearTimeout(this.finishTimer);
      this.finishTimer = null;
    }
  }
}
