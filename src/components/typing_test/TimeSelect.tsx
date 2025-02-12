import { TIME_OPTIONS } from "@/lib/constants";
import { memo } from "react";
import { Button } from "../ui/button";

type TimeSelectProps = {
  selectedTime: number;
  onTimeSelect: (time: number) => void;
  isActive: boolean;
};

// Select Time UI
const TimeSelect = memo(
  ({ selectedTime, onTimeSelect, isActive }: TimeSelectProps) => (
    <div className="flex gap-2">
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
    </div>
  )
);

export default TimeSelect;
