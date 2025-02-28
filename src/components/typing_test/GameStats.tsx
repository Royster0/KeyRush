import { memo } from "react";

type GameStatsProps = {
  timeLeft: number;
  wpm: number;
  rawWpm: number;
  accuracy: number;
};

// eslint-disable-next-line react/display-name
const GameStats = memo(
  ({ timeLeft, wpm, rawWpm, accuracy }: GameStatsProps) => (
    <div className="flex items-center gap-4">
      <div className="flex items-center gap-4">
        <div className="text-gray-500">{rawWpm}</div>
        <div className="text-gray-500">{accuracy}</div>
      </div>
      <span className="text-2xl font-bold">{timeLeft}s</span>
      <span className="text-2xl font-bold">{wpm} WPM</span>
    </div>
  )
);

export default GameStats;
