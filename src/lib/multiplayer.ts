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

export type EloUpdateResult = {
  newElo: number;
  delta: number;
};

/**
 * Calculate Elo rating change using a more sophisticated formula:
 * - Graduated K-factor based on experience level
 * - Rating floor to prevent going below minimum
 * - Optional performance bonus for dominant wins
 */
export function calculateEloUpdate({
  currentElo,
  opponentElo,
  result,
  matchesPlayed,
  playerWpm,
  opponentWpm,
}: {
  currentElo: number;
  opponentElo: number;
  result: 0 | 0.5 | 1; // 0 = loss, 0.5 = draw, 1 = win
  matchesPlayed: number;
  playerWpm?: number;
  opponentWpm?: number;
}): EloUpdateResult {
  const RATING_FLOOR = 100;

  // Expected score based on rating difference (standard Elo formula)
  // If you're higher rated, expected > 0.5; if lower rated, expected < 0.5
  const expectedScore = 1 / (1 + Math.pow(10, (opponentElo - currentElo) / 400));

  // Dynamic K-factor based on experience
  // Higher K = more volatile ratings (bigger swings)
  const kFactor = getKFactor(matchesPlayed, currentElo);

  // Base Elo change: K * (actual - expected)
  // Beat higher-rated opponent: gain more (expected was low)
  // Lose to lower-rated opponent: lose more (expected was high)
  let delta = kFactor * (result - expectedScore);

  // Performance bonus for dominant wins (optional, based on WPM margin)
  if (result === 1 && playerWpm !== undefined && opponentWpm !== undefined) {
    const marginBonus = calculateMarginBonus(playerWpm, opponentWpm);
    delta += marginBonus;
  }

  // Round and apply floor
  delta = Math.round(delta);
  const newElo = Math.max(RATING_FLOOR, currentElo + delta);
  const actualDelta = newElo - currentElo;

  return { newElo, delta: actualDelta };
}

/**
 * Get K-factor based on player experience and rating.
 * - Placement (0-4 matches): K=64 (very volatile, find true skill quickly)
 * - Provisional (5-14 matches): K=48 (still calibrating)
 * - Established low-rated (<1200): K=32 (room to climb)
 * - Established mid-rated (1200-1600): K=28
 * - Established high-rated (1600+): K=24 (more stable at top)
 */
function getKFactor(matchesPlayed: number, currentElo: number): number {
  if (matchesPlayed < PLACEMENT_MATCHES) {
    return 64;
  }
  if (matchesPlayed < 15) {
    return 48;
  }
  if (currentElo < 1200) {
    return 32;
  }
  if (currentElo < 1600) {
    return 28;
  }
  return 24;
}

/**
 * Calculate bonus points for dominant wins.
 * Rewards players who win by a significant WPM margin.
 * Max bonus: +8 points for 40+ WPM advantage.
 */
function calculateMarginBonus(playerWpm: number, opponentWpm: number): number {
  if (playerWpm <= opponentWpm) {
    return 0;
  }
  const wpmMargin = playerWpm - opponentWpm;
  // +1 point per 5 WPM advantage, capped at +8
  return Math.min(8, Math.floor(wpmMargin / 5));
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
