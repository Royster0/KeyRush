"use client";

import { useState, useCallback, useRef } from "react";

/**
 * AFK threshold in milliseconds
 * Gaps longer than this between keystrokes are considered idle time
 */
const AFK_THRESHOLD_MS = 2000;

/**
 * Hook to track active typing time by measuring intervals between keystrokes.
 * Ignores gaps longer than the AFK threshold (2 seconds) to accurately
 * calculate time spent actively typing.
 *
 * Usage:
 * 1. Call recordKeystroke() on each valid keystroke
 * 2. Call getActiveSeconds() when test completes to get total active time
 * 3. Call reset() when restarting the test
 */
export function useActiveTypingTime() {
  const [keystrokeTimestamps, setKeystrokeTimestamps] = useState<number[]>([]);
  const lastRecordedRef = useRef<number>(0);

  /**
   * Record a keystroke timestamp
   * Debounces to avoid duplicate records from React strict mode
   */
  const recordKeystroke = useCallback(() => {
    const now = Date.now();

    // Debounce: ignore if called within 10ms of last record
    if (now - lastRecordedRef.current < 10) {
      return;
    }

    lastRecordedRef.current = now;
    setKeystrokeTimestamps((prev) => [...prev, now]);
  }, []);

  /**
   * Calculate total active typing time in seconds
   * Sums up intervals between consecutive keystrokes,
   * ignoring gaps longer than AFK_THRESHOLD_MS
   */
  const getActiveSeconds = useCallback(() => {
    // No keystrokes = no active time
    if (keystrokeTimestamps.length === 0) {
      return 0;
    }

    // Single keystroke = minimum 0.5 seconds of activity
    if (keystrokeTimestamps.length === 1) {
      return 0.5;
    }

    let activeMs = 0;

    for (let i = 1; i < keystrokeTimestamps.length; i++) {
      const gap = keystrokeTimestamps[i] - keystrokeTimestamps[i - 1];

      // Only count gaps within the AFK threshold
      if (gap <= AFK_THRESHOLD_MS) {
        activeMs += gap;
      }
    }

    // Minimum 0.5 seconds if any typing occurred
    const seconds = Math.round(activeMs / 100) / 10;
    return Math.max(0.5, seconds);
  }, [keystrokeTimestamps]);

  /**
   * Get the number of keystrokes recorded
   */
  const getKeystrokeCount = useCallback(() => {
    return keystrokeTimestamps.length;
  }, [keystrokeTimestamps]);

  /**
   * Reset the tracker for a new test
   */
  const reset = useCallback(() => {
    setKeystrokeTimestamps([]);
    lastRecordedRef.current = 0;
  }, []);

  return {
    recordKeystroke,
    getActiveSeconds,
    getKeystrokeCount,
    reset,
  };
}
