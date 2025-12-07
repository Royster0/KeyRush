import { getBestScoresSafe, getUser } from "@/app/actions";
import Game from "./Game";

export default async function GameWrapper() {
    const [bestScores, user] = await Promise.all([
        getBestScoresSafe(),
        getUser(),
    ]);

    const formattedScores = bestScores.map((score: { duration: number; wpm: number }) => ({
        duration: score.duration,
        wpm: score.wpm,
    }));

    return <Game initialBestScores={formattedScores} user={user} />;
}
