export type MatchHistoryEntry = {
  id: string;
  matchId: string;
  date: string;
  duration: number;
  mode: "ranked" | "unranked";
  result: "win" | "loss" | "draw";
  userWpm: number;
  userRawWpm: number | null;
  userAccuracy: number;
  userProgress: number | null;
  opponentWpm: number;
  opponentRawWpm: number | null;
  opponentAccuracy: number | null;
  opponentName: string;
  opponentId: string;
};

export type MatchHistoryResponse = {
  matches: MatchHistoryEntry[];
  hasMore: boolean;
  total: number;
};
