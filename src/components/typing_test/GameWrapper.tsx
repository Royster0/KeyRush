import { getUser } from "@/lib/services/user";
import { getBestScoresByUserId } from "@/lib/services/test-results";
import Game from "./Game";

export default async function GameWrapper() {
    const user = await getUser();

    const bestScores = user
        ? await getBestScoresByUserId(user.id)
        : [];

    const formattedScores = bestScores.map((score: { duration: number; wpm: number }) => ({
        duration: score.duration,
        wpm: score.wpm,
    }));

    return <Game initialBestScores={formattedScores} user={user} />;
}
