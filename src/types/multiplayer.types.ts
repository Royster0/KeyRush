export type MatchPhase = "lobby" | "countdown" | "active" | "finished";

export type MultiplayerPlayer = {
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

export type MatchState = {
  matchId: string;
  mode: "ranked" | "unranked";
  duration: number;
  text: string;
  phase: MatchPhase;
  startAt: number | null;
  players: Record<string, MultiplayerPlayer>;
};

export type QueueMatchFound = {
  type: "match-found";
  matchId: string;
  duration: number;
};

export type MatchStateMessage = {
  type: "match-state";
  state: MatchState;
};

export type MatchErrorMessage = {
  type: "match-error";
  message: string;
};

export type ServerMessage = QueueMatchFound | MatchStateMessage | MatchErrorMessage;

// Client-to-server message types
export type ClientMessage =
  | { type: "queue-join"; userId: string; name: string; duration: number; elo?: number; rank?: string }
  | { type: "match-join"; userId?: string; name?: string; elo?: number; rank?: string }
  | { type: "ready"; userId: string; ready: boolean }
  | { type: "progress"; userId: string; progress?: number; wpm?: number }
  | { type: "finish"; userId: string; progress?: number; wpm?: number; rawWpm?: number; accuracy?: number }
  | { type: "leave"; userId: string };
