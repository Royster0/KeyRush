import { memo } from "react";

type GameStatsProps = {
  timeLeft: number;
  wpm: number;
  rawWpm: number;
  accuracy: number;
  showTimer: boolean;
  showWpm: boolean;
};

// eslint-disable-next-line react/display-name
const GameStats = memo(
  ({ timeLeft, wpm, rawWpm, accuracy, showTimer, showWpm }: GameStatsProps) => (
    <div className="flex items-center gap-4">
      <span className={`text-2xl font-bold transition-opacity duration-300 ${showTimer ? "opacity-100" : "opacity-0"}`}>
        {timeLeft}s
      </span>
      <span className={`text-2xl font-bold transition-opacity duration-300 ${showWpm ? "opacity-100" : "opacity-0"}`}>
        {wpm} WPM
      </span>
      <div className={`flex items-center gap-4 transition-opacity duration-300 ${showWpm ? "opacity-100" : "opacity-0"}`}>
        <div className="text-gray-500">{rawWpm}</div>
        <div className="text-gray-500">{accuracy}</div>
      </div>
    </div>
  )
);

export default GameStats;
