import { motion } from "motion/react";
import { memo } from "react";
import Caret from "./Caret";
import { CaretSpeed } from "@/lib/constants";

type CharacterProps = {
  char: string;
  isCurrent: boolean;
  isTyped: boolean;
  isCorrect: boolean;
  isMistake: boolean;
  caretSpeed?: CaretSpeed;
};

const Character = memo(
  function Character({ char, isCurrent, isTyped, isCorrect, isMistake, caretSpeed }: CharacterProps) {
    return (
      <motion.span
        className={`
        ${isTyped && !isCorrect ? "text-destructive" : ""}
        ${isTyped && isCorrect ? "text-primary" : ""}
        ${isMistake ? "text-destructive" : ""}
        ${!isTyped ? "text-muted-foreground" : ""}
        text-3xl relative inline-block
        `}
        layout
      >
        {isCurrent && <Caret speed={caretSpeed} />}
        {char}
      </motion.span>
    );
  }
);

export default Character;
