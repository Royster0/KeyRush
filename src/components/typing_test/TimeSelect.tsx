import { TIME_OPTIONS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { memo } from "react";
import { motion } from "framer-motion";

type TimeSelectProps = {
  selectedTime: number;
  onTimeSelect: (time: number) => void;
  isActive: boolean;
  isVisible: boolean;
};

// Time selector that fades out during test for distraction-free typing
// eslint-disable-next-line react/display-name
const TimeSelect = memo(
  ({ selectedTime, onTimeSelect, isActive, isVisible }: TimeSelectProps) => (
    <motion.div
      className="flex items-center gap-5"
      animate={{ opacity: isVisible ? 1 : 0 }}
      transition={{ duration: 0.3 }}
    >
      {TIME_OPTIONS.map((time) => (
        <button
          key={time}
          onClick={() => onTimeSelect(time)}
          disabled={isActive}
          className={cn(
            "text-sm font-medium transition-colors duration-200",
            selectedTime === time
              ? "text-primary"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          {time}
        </button>
      ))}
    </motion.div>
  )
);

export default TimeSelect;
