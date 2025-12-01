import Game from "@/components/typing_test/Game";
import { getBestScoresSafe, getUser } from "./actions";

export default async function Home() {
  const bestScores = await getBestScoresSafe();
  const user = await getUser();

  const formattedScores = bestScores.map((score) => ({
    duration: score.duration,
    wpm: score.wpm,
  }));

  return (
    <div className="min-h-[calc(100vh-5rem)] flex items-center justify-center p-4">
      <Game initialBestScores={formattedScores} user={user} />
    </div>
  );
}
