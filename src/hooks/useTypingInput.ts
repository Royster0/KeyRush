"use client";

import { useState, useCallback } from "react";

type UseTypingInputProps = {
  text: string;
  isActive: boolean;
  isFinished: boolean;
  onTypedChange?: (typed: string) => void;
};

type UseTypingInputReturn = {
  typed: string;
  setTyped: (typed: string) => void;
  mistakes: Set<number>;
  setMistakes: (mistakes: Set<number>) => void;
  totalKeystrokes: number;
  setTotalKeystrokes: (keystrokes: number) => void;
  correctKeystrokes: number;
  setCorrectKeystrokes: (keystrokes: number) => void;
  handleKeyDown: (e: KeyboardEvent) => void;
  reset: () => void;
};

export function useTypingInput({
  text,
  isActive,
  isFinished,
  onTypedChange,
}: UseTypingInputProps): UseTypingInputReturn {
  const [typed, setTypedInternal] = useState("");
  const [mistakes, setMistakes] = useState<Set<number>>(new Set());
  const [totalKeystrokes, setTotalKeystrokes] = useState(0);
  const [correctKeystrokes, setCorrectKeystrokes] = useState(0);

  const setTyped = useCallback((newTyped: string) => {
    setTypedInternal(newTyped);
    onTypedChange?.(newTyped);
  }, [onTypedChange]);

  const reset = useCallback(() => {
    setTypedInternal("");
    setMistakes(new Set());
    setTotalKeystrokes(0);
    setCorrectKeystrokes(0);
  }, []);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (!isActive || isFinished) return;

    // Prevent page scrolling
    if (e.key === " " || e.key === "Backspace") {
      e.preventDefault();
    }

    // Handle backspace
    if (e.key === "Backspace") {
      if (typed.length > 0) {
        const charToDelete = typed[typed.length - 1];
        const isSpaceMistake = mistakes.has(typed.length - 1);

        // Smart backspace: prevent backspacing into a correct previous word
        if (charToDelete === " " && !isSpaceMistake) {
          const previousSpaceIndex = typed.lastIndexOf(" ", typed.length - 2);
          const startOfWord = previousSpaceIndex + 1;
          const endOfWord = typed.length - 1;

          let hasMistakesInWord = false;
          for (let i = startOfWord; i < endOfWord; i++) {
            if (mistakes.has(i)) {
              hasMistakesInWord = true;
              break;
            }
          }

          if (!hasMistakesInWord) {
            return;
          }
        }

        const lastIndex = typed.length - 1;
        const wasCorrect = typed[lastIndex] === text[lastIndex];
        setTotalKeystrokes((prev) => Math.max(0, prev - 1));

        if (wasCorrect) {
          setCorrectKeystrokes((prev) => Math.max(0, prev - 1));
        }

        const newTyped = typed.slice(0, -1);
        setTypedInternal(newTyped);
        onTypedChange?.(newTyped);

        setMistakes((prev) => {
          const next = new Set(prev);
          next.delete(lastIndex);
          return next;
        });
      }
      return;
    }

    // Handle space
    if (e.key === " " && typed.length > 0 && typed[typed.length - 1] !== " ") {
      const newTyped = typed + " ";
      setTypedInternal(newTyped);
      onTypedChange?.(newTyped);
      setTotalKeystrokes((prev) => prev + 1);

      if (text[typed.length] === " ") {
        setCorrectKeystrokes((prev) => prev + 1);
      }
      return;
    }

    // Handle character input
    if (e.key.length === 1) {
      const currentIndex = typed.length;
      if (currentIndex < text.length) {
        const isCorrect = e.key === text[currentIndex];
        setTotalKeystrokes((prev) => prev + 1);

        if (isCorrect) {
          setCorrectKeystrokes((prev) => prev + 1);
        } else {
          setMistakes((prev) => {
            const next = new Set(prev);
            next.add(currentIndex);
            return next;
          });
        }

        const newTyped = typed + e.key;
        setTypedInternal(newTyped);
        onTypedChange?.(newTyped);
      }
    }
  }, [isActive, isFinished, typed, mistakes, text, onTypedChange]);

  return {
    typed,
    setTyped,
    mistakes,
    setMistakes,
    totalKeystrokes,
    setTotalKeystrokes,
    correctKeystrokes,
    setCorrectKeystrokes,
    handleKeyDown,
    reset,
  };
}
