import { motion } from "motion/react";
import { memo } from "react";
import { CARET_SPEEDS, CaretSpeed } from "@/lib/constants";
import { cn } from "@/lib/utils";

type CaretProps = {
  speed?: CaretSpeed;
  className?: string;
};

const Caret = memo(function Caret({ speed = CARET_SPEEDS.MEDIUM, className }: CaretProps) {
  const getTransition = () => {
    switch (speed) {
      case CARET_SPEEDS.FAST:
        return { duration: 0.08, ease: "easeOut" };
      case CARET_SPEEDS.SLOW:
        return { duration: 0.17, ease: "easeOut" };
      case CARET_SPEEDS.MEDIUM:
      default:
        return { duration: 0.1, ease: "easeOut" };
    }
  };

  return (
    <motion.div
      initial={{ opacity: 1 }}
      animate={{ opacity: 0.6 }}
      transition={getTransition()}
      className={cn("absolute w-0.5", className ?? "bg-accent-foreground")}
      layoutId="caret"
      style={{ height: "1.3em", left: "-2px" }}
    />
  );
});

export default Caret;
