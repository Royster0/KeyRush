import { useCallback } from "react";
import { countCorrectWordChars } from "@/lib/wordWpm";

// Calculates typing speed
// testEnded: when true, includes partial word characters if correctly typed (for final WPM)
export const useCalculateTypingStats = (
  startTime: number | null,
  totalKeystrokes: number,
  correctKeystrokes: number,
  typed: string,
  text: string,
  testEnded: boolean = false
) => {
  return useCallback(() => {
    if (!startTime) {
      return {
        wpm: 0,
        rawWpm: 0,
        accuracy: 100,
      };
    }

    const elapsedTime = (Date.now() - startTime) / 1000 / 60;

    // Calculate raw wpm
    const rawTyped = totalKeystrokes / 5;
    const calculatedRaw =
      elapsedTime > 0 ? parseFloat((rawTyped / elapsedTime).toFixed(2)) : 0;

    // Calculate accuracy
    const calculatedAccuracy =
      totalKeystrokes > 0
        ? Math.round((correctKeystrokes / totalKeystrokes) * 100)
        : 100;

    // Calculate wpm
    const { correctWordChars, correctSpaces } = countCorrectWordChars(typed, text, testEnded);
    const wpmChars = correctWordChars + correctSpaces;
    const calculatedWpm =
      elapsedTime > 0
        ? parseFloat(((wpmChars / 5) / elapsedTime).toFixed(2))
        : 0;

    return {
      wpm: calculatedWpm,
      rawWpm: calculatedRaw,
      accuracy: calculatedAccuracy,
    };
  }, [startTime, totalKeystrokes, correctKeystrokes, typed, text, testEnded]);
};
