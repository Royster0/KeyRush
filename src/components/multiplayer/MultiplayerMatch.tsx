"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Character from "@/components/typing_test/Character";
import { useCalculateTypingStats } from "@/hooks/useCalculateTypingStats";
import { useTextMeasurement } from "@/hooks/useTextMeasurement";
import { useTypingInput } from "@/hooks/useTypingInput";
import { useSettings } from "@/hooks/useSettings";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import GameStats from "@/components/typing_test/GameStats";
import { cn } from "@/lib/utils";
import { MatchPhase } from "@/types/multiplayer.types";

type MultiplayerMatchProps = {
  text: string;
  duration: number;
  phase: MatchPhase;
  startAt: number | null;
  opponentProgress: number;
  onProgress: (progress: number, wpm: number, elapsed: number) => void;
  onFinish: (stats: { wpm: number; rawWpm: number; accuracy: number; progress: number }) => void;
};

const MultiplayerMatch = ({
  text,
  duration,
  phase,
  startAt,
  opponentProgress,
  onProgress,
  onFinish,
}: MultiplayerMatchProps) => {
  const [timeLeft, setTimeLeft] = useState(duration);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [wpm, setWpm] = useState(0);
  const [rawWpm, setRawWpm] = useState(0);
  const [accuracy, setAccuracy] = useState(100);
  const [lines, setLines] = useState<string[]>([]);
  const [isActive, setIsActive] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  const hasReportedRef = useRef(false);

  const textRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const { caretSpeed, multiplayerWidth } = useSettings();

  const {
    typed,
    mistakes,
    totalKeystrokes,
    correctKeystrokes,
    handleKeyDown,
    reset: resetTyping,
  } = useTypingInput({ text, isActive, isFinished });

  const measureText = useTextMeasurement(containerRef);
  const calculatedStats = useCalculateTypingStats(
    startTime,
    totalKeystrokes,
    correctKeystrokes
  );

  const resetState = useCallback(() => {
    resetTyping();
    setTimeLeft(duration);
    setStartTime(null);
    setWpm(0);
    setRawWpm(0);
    setAccuracy(100);
    setIsActive(false);
    setIsFinished(false);
    setCountdown(null);
    hasReportedRef.current = false;
  }, [duration, resetTyping]);

  useEffect(() => {
    resetState();
  }, [resetState, text]);

  useEffect(() => {
    if (!startAt) {
      return;
    }

    const syncTimer = () => {
      if (phase === "finished") {
        setIsFinished(true);
        setIsActive(false);
        return;
      }

      const now = Date.now();
      const secondsUntilStart = Math.ceil((startAt - now) / 1000);

      if (secondsUntilStart > 0) {
        setCountdown(secondsUntilStart);
        setTimeLeft(duration);
        setIsActive(false);
        setStartTime(null);
        return;
      }

      setCountdown(null);
      setIsActive(!isFinished);
      setStartTime(startAt);

      const elapsed = Math.max(0, Math.floor((now - startAt) / 1000));
      const remaining = Math.max(0, duration - elapsed);
      setTimeLeft(remaining);
      if (remaining <= 0 && !isFinished) {
        setIsFinished(true);
        setIsActive(false);
      }
    };

    const interval = setInterval(syncTimer, 100);
    syncTimer();

    return () => clearInterval(interval);
  }, [startAt, duration, phase, isFinished]);

  // Attach keyboard event listener
  useEffect(() => {
    if (!isActive || isFinished) return;

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isActive, isFinished, handleKeyDown]);

  useEffect(() => {
    if (!isActive || isFinished) {
      return;
    }

    const interval = setInterval(() => {
      const stats = calculatedStats();
      const elapsedSeconds = startTime
        ? Math.max(0, Math.floor((Date.now() - startTime) / 1000))
        : 0;
      setWpm(stats.wpm);
      setRawWpm(stats.rawWpm);
      setAccuracy(stats.accuracy);
      onProgress(typed.length, stats.wpm, elapsedSeconds);
    }, 100);

    return () => clearInterval(interval);
  }, [calculatedStats, isActive, isFinished, onProgress, typed.length]);

  useEffect(() => {
    if (!isActive || isFinished) {
      return;
    }
    const stats = calculatedStats();
    const elapsedSeconds = startTime
      ? Math.max(0, Math.floor((Date.now() - startTime) / 1000))
      : 0;
    onProgress(typed.length, stats.wpm, elapsedSeconds);
  }, [typed.length, isActive, isFinished, calculatedStats, onProgress, startTime]);

  useEffect(() => {
    if (isFinished && !hasReportedRef.current) {
      hasReportedRef.current = true;
      onFinish({ wpm, rawWpm, accuracy, progress: typed.length });
    }
  }, [isFinished, onFinish, wpm, rawWpm, accuracy, typed.length]);

  useEffect(() => {
    const resizeObserver = new ResizeObserver(() => {
      setLines(measureText(text));
    });

    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    return () => resizeObserver.disconnect();
  }, [text, measureText]);

  const renderText = useCallback(() => {
    let typedSoFar = 0;

    const currentLineIndex = lines.findIndex((line) => {
      if (typedSoFar + line.length + 1 > typed.length) {
        return true;
      }
      typedSoFar += line.length + 1;
      return false;
    });

    const displayLines = lines
      .slice(Math.max(0, currentLineIndex - 1), Math.max(3, currentLineIndex + 2))
      .slice(0, 3);

    return displayLines.map((line, lineIndex) => {
      const chars = line.split("");
      const lineStart = text.indexOf(line);

      return (
        <div key={lineIndex} className="h-[3em] whitespace-pre relative">
          {chars.map((char, charIndex) => {
            const absoluteIndex = lineStart + charIndex;
            return (
              <Character
                key={charIndex}
                char={char}
                isCurrent={absoluteIndex === typed.length}
                isOpponentCurrent={absoluteIndex === opponentProgress}
                opponentCaretClassName="bg-sky-400"
                isTyped={absoluteIndex < typed.length}
                isCorrect={typed[absoluteIndex] === char}
                isMistake={mistakes.has(absoluteIndex)}
                caretSpeed={caretSpeed}
              />
            );
          })}
        </div>
      );
    });
  }, [lines, opponentProgress, text, typed, mistakes, caretSpeed]);

  const statusLabel = (() => {
    if (phase === "countdown" && countdown !== null) {
      return `Starting in ${countdown}s`;
    }
    if (phase === "lobby") {
      return "Waiting for both players to ready up";
    }
    return "";
  })();

  return (
    <div className="w-full flex flex-col items-center gap-6">
      <Card className="w-full shadow-none border-none mx-auto" style={{ maxWidth: `${multiplayerWidth}vw` }}>
        <CardHeader>
          <CardTitle className="flex flex-wrap items-center justify-between px-6 py">
            <p className="text-sm text-muted-foreground">{statusLabel}</p>
            <p className="text-sm text-muted-foreground">
              Duration: <span className="text-foreground font-medium">{duration}s</span>
            </p>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div
            ref={containerRef}
            className="relative p-6 rounded-lg mb-4 font-mono leading-relaxed overflow-hidden"
          >
            <AnimatePresence>
              {countdown !== null && countdown > 0 && (
                <motion.div
                  key="countdown-overlay"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="absolute inset-0 z-10 flex items-center justify-center rounded-lg bg-background/70 backdrop-blur-sm"
                >
                  <motion.span
                    key={countdown}
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 1.05, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="text-6xl font-bold text-primary/80"
                  >
                    {countdown}
                  </motion.span>
                </motion.div>
              )}
            </AnimatePresence>

            <motion.div
              ref={textRef}
              tabIndex={0}
              className={cn(
                "focus:outline-none transition-all duration-300",
                isFinished ? "h-auto" : "h-[9em]"
              )}
              initial={false}
              animate={{ opacity: countdown !== null && countdown > 0 ? 0.25 : 1 }}
              transition={{ duration: 0.25 }}
            >
              <AnimatePresence mode="wait">
                <motion.div
                  className="transition-all duration-150"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  {renderText()}
                </motion.div>
              </AnimatePresence>
            </motion.div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-center">
        <GameStats
          timeLeft={phase === "countdown" && countdown !== null ? countdown : timeLeft}
          wpm={wpm}
          rawWpm={rawWpm}
          accuracy={accuracy}
          showTimer={true}
          showWpm={true}
        />
      </div>
    </div>
  );
};

export default MultiplayerMatch;
