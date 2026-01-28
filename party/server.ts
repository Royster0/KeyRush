import type * as PartyKit from "partykit/server";
import { generateText } from "../src/lib/utils";
import { parseMatchId } from "../src/lib/multiplayer";
import type { ClientMessage, MultiplayerPlayer, MatchPhase } from "../src/types/multiplayer.types";

type QueuePlayer = {
  connectionId: string;
  userId: string;
  name: string;
  duration: number;
  elo: number;
  rank: string;
};

type MatchPlayer = MultiplayerPlayer;

type MatchState = {
  matchId: string;
  mode: "ranked" | "unranked";
  duration: number;
  text: string;
  phase: MatchPhase;
  startAt: number | null;
  expiresAt: number | null;
  players: Record<string, MatchPlayer>;
};

function isClientMessage(data: unknown): data is ClientMessage {
  if (typeof data !== "object" || data === null) {
    return false;
  }
  const msg = data as { type?: unknown };
  return (
    typeof msg.type === "string" &&
    ["queue-join", "match-join", "ready", "progress", "finish", "leave"].includes(msg.type)
  );
}

export default class Server implements PartyKit.Server {
  private waitingQueue: QueuePlayer[] = [];
  private matchState: MatchState | null = null;
  private connectionMap = new Map<string, string>();
  private startTimer: number | null = null;
  private finishTimer: number | null = null;
  private inviteExpireTimer: number | null = null;

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
      const parsed = parseMatchId(this.party.id);
      const durationFromId = idParts.length > 3 ? Number(idParts[2]) : null;
      const modeFromId = idParts.length > 3 ? idParts[1] : "ranked";
      const duration = durationFromId === 60 || Number(durationParam) === 60 ? 60 : 30;
      if (parsed?.expiresAt && Date.now() > parsed.expiresAt) {
        connection.send(
          JSON.stringify({ type: "match-error", message: "Invite link expired." })
        );
        connection.close();
        return;
      }
      const resolvedMode: "ranked" | "unranked" =
        parsed?.mode === "unranked" || modeFromId === "unranked"
          ? "unranked"
          : "ranked";

      this.matchState = {
        matchId: this.party.id,
        mode: resolvedMode,
        duration,
        text: generateText(),
        phase: "lobby",
        startAt: null,
        expiresAt: parsed?.expiresAt ?? null,
        players: {},
      };

      const expiresAt = this.matchState.expiresAt;
      if (expiresAt) {
        const ms = expiresAt - Date.now();
        if (ms > 0) {
          this.inviteExpireTimer = setTimeout(() => {
            if (this.matchState && this.matchState.phase === "lobby") {
              this.party.broadcast(
                JSON.stringify({
                  type: "match-error",
                  message: "Invite link expired.",
                })
              );
              for (const conn of this.party.getConnections()) {
                conn.close();
              }
            }
          }, ms) as unknown as number;
        }
      }
    }
  }

  onMessage(message: string, sender: PartyKit.Connection) {
    let payload: unknown;
    try {
      payload = JSON.parse(message);
    } catch {
      return;
    }

    if (!isClientMessage(payload)) {
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

  private handleQueueMessage(payload: ClientMessage, sender: PartyKit.Connection) {
    if (payload.type === "queue-join") {
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

  private handleMatchMessage(payload: ClientMessage, sender: PartyKit.Connection) {
    if (!this.matchState) {
      return;
    }

    if (payload.type === "match-join") {
      if (this.matchState.expiresAt && Date.now() > this.matchState.expiresAt) {
        sender.send(
          JSON.stringify({ type: "match-error", message: "Invite link expired." })
        );
        sender.close();
        return;
      }
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

    if (payload.type === "ready") {
      const player = this.matchState.players[payload.userId];
      if (!player) {
        return;
      }
      player.ready = Boolean(payload.ready);
      this.broadcastState();
      this.tryStartMatch();
      return;
    }

    if (payload.type === "progress") {
      const player = this.matchState.players[payload.userId];
      if (!player) {
        return;
      }
      player.progress = payload.progress ?? player.progress;
      player.wpm = payload.wpm ?? player.wpm;
      this.broadcastState();
      return;
    }

    if (payload.type === "finish") {
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

    if (payload.type === "leave") {
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
    if (this.inviteExpireTimer) {
      clearTimeout(this.inviteExpireTimer);
      this.inviteExpireTimer = null;
    }
  }
}
