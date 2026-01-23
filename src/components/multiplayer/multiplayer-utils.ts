// Multiplayer UI utility functions

export const RANK_COLORS: Record<string, string> = {
  Placement: "text-muted-foreground",
  Bronze: "text-amber-600",
  Silver: "text-slate-400",
  Gold: "text-yellow-500",
  Platinum: "text-cyan-400",
  Diamond: "text-blue-400",
  Sonic: "text-purple-500",
  Mach: "text-red-500",
};

export function getRankColor(rank: string): string {
  return RANK_COLORS[rank] || "text-muted-foreground";
}

export type ResultType = "victory" | "defeat" | "draw";

export function getResultType(resultLabel: string | null): ResultType {
  if (resultLabel?.includes("Victory")) return "victory";
  if (resultLabel?.includes("Defeat")) return "defeat";
  return "draw";
}

export function getResultColorClass(resultType: ResultType): string {
  switch (resultType) {
    case "victory":
      return "text-emerald-500";
    case "defeat":
      return "text-red-500";
    default:
      return "text-yellow-500";
  }
}
