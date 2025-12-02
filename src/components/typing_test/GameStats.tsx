import { memo } from "react";

type GameStatsProps = {
  timeLeft: number;
  wpm: number;
  rawWpm: number;
  accuracy: number;
  showTimer: boolean;
  showWpm: boolean;
};

const GameStats = memo(
  function GameStats({ timeLeft, wpm, rawWpm, accuracy, showTimer, showWpm }: GameStatsProps) {
    return (
      <div className="flex items-center gap-12">
        <div className={`flex flex-col items-center transition-opacity duration-300 ${showTimer ? "opacity-100" : "opacity-0"}`}>
          <span className="text-6xl font-bold text-primary/20">
            {timeLeft}
          </span>
        </div>

        <div className={`flex flex-col items-center transition-opacity duration-300 ${showWpm ? "opacity-100" : "opacity-0"}`}>
          <span className="text-6xl font-bold text-primary/20">
            {wpm}
          </span>
        </div>
      </div>
    );
  }
);

export default GameStats;
