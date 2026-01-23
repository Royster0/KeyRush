export const ELO_STORAGE_KEY = "multiplayer-elo";
export const ANON_ID_KEY = "multiplayer-anon-id";
export const ANON_NAME_KEY = "multiplayer-anon-name";
export const PLACEMENT_MATCHES = 5;
export const DEFAULT_ELO = 1000;

export type EloRecord = {
  elo: number;
  matchesPlayed: number;
  updatedAt: string;
};

type RankTier = {
  name: string;
  min: number;
};

const RANK_TIERS: RankTier[] = [
  { name: "Bronze", min: 0 },
  { name: "Silver", min: 900 },
  { name: "Gold", min: 1100 },
  { name: "Platinum", min: 1300 },
  { name: "Diamond", min: 1500 },
  { name: "Sonic", min: 1700 },
  { name: "Mach", min: 1900 },
];

export function getRankLabel(elo: number, matchesPlayed: number) {
  if (matchesPlayed < PLACEMENT_MATCHES) {
    return "Placement";
  }

  const tier = [...RANK_TIERS].reverse().find((entry) => elo >= entry.min);
  return tier?.name ?? "Bronze";
}

export function getPlacementRemaining(matchesPlayed: number) {
  return Math.max(0, PLACEMENT_MATCHES - matchesPlayed);
}

export function calculateEloUpdate({
  currentElo,
  opponentElo,
  result,
  isPlacement,
}: {
  currentElo: number;
  opponentElo: number;
  result: 0 | 0.5 | 1;
  isPlacement: boolean;
}) {
  const expected = 1 / (1 + Math.pow(10, (opponentElo - currentElo) / 400));
  const kFactor = isPlacement ? 64 : 32;
  const delta = Math.round(kFactor * (result - expected));
  return currentElo + delta;
}

export function loadEloRecord(): EloRecord {
  if (typeof window === "undefined") {
    return { elo: DEFAULT_ELO, matchesPlayed: 0, updatedAt: new Date().toISOString() };
  }

  const stored = localStorage.getItem(ELO_STORAGE_KEY);
  if (!stored) {
    return { elo: DEFAULT_ELO, matchesPlayed: 0, updatedAt: new Date().toISOString() };
  }

  try {
    const parsed = JSON.parse(stored) as EloRecord;
    if (!Number.isFinite(parsed.elo) || !Number.isFinite(parsed.matchesPlayed)) {
      throw new Error("Invalid Elo record");
    }
    return parsed;
  } catch {
    return { elo: DEFAULT_ELO, matchesPlayed: 0, updatedAt: new Date().toISOString() };
  }
}

export function saveEloRecord(record: EloRecord) {
  if (typeof window === "undefined") {
    return;
  }
  localStorage.setItem(ELO_STORAGE_KEY, JSON.stringify(record));
}

export type ParsedMatchId = {
  mode: "ranked" | "unranked";
  duration: 30 | 60;
  expiresAt: number | null;
};

export function parseMatchId(matchId: string): ParsedMatchId | null {
  const parts = matchId.split("-");
  if (parts.length < 4 || parts[0] !== "match") {
    return null;
  }
  const mode: "ranked" | "unranked" = parts[1] === "unranked" ? "unranked" : "ranked";
  const duration: 30 | 60 = Number(parts[2]) === 60 ? 60 : 30;
  const expiresAt = parts.length >= 5 ? Number(parts[3]) : null;
  return { mode, duration, expiresAt: Number.isFinite(expiresAt) ? expiresAt : null };
}
