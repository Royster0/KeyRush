import { motion } from "motion/react";
import { memo } from "react";
import Caret from "./Caret";

type CharacterProps = {
  char: string;
  isCurrent: boolean;
  isTyped: boolean;
  isCorrect: boolean;
  isMistake: boolean;
};

// eslint-disable-next-line react/display-name
const Character = memo(
  ({ char, isCurrent, isTyped, isCorrect, isMistake }: CharacterProps) => (
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
      {isCurrent && <Caret />}
      {char}
    </motion.span>
  )
);

export default Character;
