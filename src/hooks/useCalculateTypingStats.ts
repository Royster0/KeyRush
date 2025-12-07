import { useCallback } from "react";

// Calculates typing speed
export const useCalculateTypingStats = (
  startTime: number | null,
  totalKeystrokes: number,
  correctKeystrokes: number
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
    const calculatedWpm =
      elapsedTime > 0
        ? parseFloat((correctKeystrokes / (5 * elapsedTime)).toFixed(2))
        : 0;

    return {
      wpm: calculatedWpm,
      rawWpm: calculatedRaw,
      accuracy: calculatedAccuracy,
    };
  }, [startTime, totalKeystrokes, correctKeystrokes]);
};
