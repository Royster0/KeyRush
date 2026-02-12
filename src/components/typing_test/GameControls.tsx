import { TIME_OPTIONS } from "@/lib/constants";
import { memo } from "react";
import { motion } from "framer-motion";
import { Timer, Gauge, RotateCcw } from "lucide-react";

type GameControlsProps = {
  selectedTime: number;
  onTimeSelect: (time: number) => void;
  showTimer: boolean;
  onToggleTimer: () => void;
  showWpm: boolean;
  onToggleWpm: () => void;
  onReset: () => void;
  isActive: boolean;
};

const GameControls = memo(function GameControls({
  selectedTime,
  onTimeSelect,
  showTimer,
  onToggleTimer,
  showWpm,
  onToggleWpm,
  onReset,
  isActive,
}: GameControlsProps) {
  return (
    <motion.div
      className="inline-flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-2 rounded-2xl bg-muted/40 border border-border/50"
      animate={{ opacity: isActive ? 0 : 1 }}
      transition={{ duration: 0.25 }}
    >
      {/* Time Selection */}
      <div className="flex items-center gap-0.5 sm:gap-1">
        {TIME_OPTIONS.map((time) => {
          const isSelected = selectedTime === time;

          return (
            <motion.button
              key={time}
              onClick={() => onTimeSelect(time)}
              disabled={isActive}
              className={`
                px-2.5 sm:px-4 py-1.5 rounded-lg text-sm font-medium transition-colors duration-150 border
                disabled:cursor-not-allowed
                focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring
                ${isSelected
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground hover:bg-background/60"
                }
              `}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <span className="tabular-nums">
                {time >= 60 ? `${time / 60}m` : `${time}s`}
              </span>
            </motion.button>
          );
        })}
      </div>

      {/* Separator */}
      <div className="hidden sm:block w-px h-6 bg-border/60 mx-1" />

      {/* Toggle Icons - hidden on mobile */}
      <div className="hidden sm:flex items-center gap-1">
        <ToggleButton
          active={showTimer}
          onClick={onToggleTimer}
          disabled={isActive}
          icon={<Timer className="w-4 h-4" />}
          label="Timer"
        />
        <ToggleButton
          active={showWpm}
          onClick={onToggleWpm}
          disabled={isActive}
          icon={<Gauge className="w-4 h-4" />}
          label="Live WPM"
        />
      </div>

      {/* Separator */}
      <div className="w-px h-6 bg-border/60 mx-0.5 sm:mx-1" />

      {/* Reset */}
      <motion.button
        onClick={onReset}
        disabled={isActive}
        title="Reset"
        className="p-2 sm:p-2.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-background/60 transition-colors duration-150 disabled:cursor-not-allowed disabled:opacity-50"
        whileHover={{ rotate: -45 }}
        whileTap={{ scale: 0.9 }}
      >
        <RotateCcw className="w-4 h-4" />
      </motion.button>
    </motion.div>
  );
});

function ToggleButton({
  active,
  onClick,
  disabled,
  icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  disabled: boolean;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={label}
      className={`
        p-2.5 rounded-lg transition-all duration-150
        disabled:cursor-not-allowed
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring
        ${active
          ? "text-primary bg-primary/10"
          : "text-muted-foreground hover:text-foreground hover:bg-background/60"
        }
      `}
    >
      {icon}
    </button>
  );
}

export default GameControls;
