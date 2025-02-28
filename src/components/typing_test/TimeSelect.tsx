import { TIME_OPTIONS } from "@/lib/constants";
import { memo } from "react";
import { Button } from "../ui/button";
import { motion } from "framer-motion";

type TimeSelectProps = {
  selectedTime: number;
  onTimeSelect: (time: number) => void;
  isActive: boolean;
  isVisible: boolean;
};

// Time selector that fades out during test for distraction-free typing
const TimeSelect = memo(
  ({ selectedTime, onTimeSelect, isActive, isVisible }: TimeSelectProps) => (
    <motion.div 
      className="flex gap-2"
      animate={{ opacity: isVisible ? 1 : 0 }}
      transition={{ duration: 0.3 }}
    >
      {TIME_OPTIONS.map((time) => (
        <Button
          key={time}
          size={"sm"}
          variant={time === selectedTime ? "default" : "outline"}
          onClick={() => onTimeSelect(time)}
          disabled={isActive}
        >
          {time}s
        </Button>
      ))}
    </motion.div>
  )
);

export default TimeSelect;
