"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Character from "@/components/typing_test/Character";
import { useCalculateTypingStats } from "@/hooks/useCalculateTypingStats";
import { useTextMeasurement } from "@/hooks/useTextMeasurement";
import { useSettings } from "@/hooks/useSettings";
import GameStats from "@/components/typing_test/GameStats";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  const [typed, setTyped] = useState("");
  const [mistakes, setMistakes] = useState(new Set<number>());
  const [totalKeystrokes, setTotalKeystrokes] = useState(0);
  const [correctKeystrokes, setCorrectKeystrokes] = useState(0);
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
  const { caretSpeed } = useSettings();

  const measureText = useTextMeasurement(containerRef);
  const calculatedStats = useCalculateTypingStats(
    startTime,
    totalKeystrokes,
    correctKeystrokes
  );

  const resetState = useCallback(() => {
    setTyped("");
    setMistakes(new Set());
    setTotalKeystrokes(0);
    setCorrectKeystrokes(0);
    setTimeLeft(duration);
    setStartTime(null);
    setWpm(0);
    setRawWpm(0);
    setAccuracy(100);
    setIsActive(false);
    setIsFinished(false);
    hasReportedRef.current = false;
  }, [duration]);

  useEffect(() => {
    resetState();
  }, [resetState, text]);

  useEffect(() => {
    if (!startAt) {
      return;
    }

    const syncTimer = () => {
      const now = Date.now();
      const elapsed = Math.max(0, Math.floor((now - startAt) / 1000));
      const remaining = Math.max(0, duration - elapsed);

      setTimeLeft(remaining);
      setCountdown(Math.max(0, Math.ceil((startAt - now) / 1000)));
      if (now >= startAt && phase !== "finished") {
        setIsActive(true);
        setStartTime(startAt);
      }

      if (remaining <= 0 && !isFinished) {
        setIsFinished(true);
        setIsActive(false);
      }
    };

    const interval = setInterval(syncTimer, 100);
    syncTimer();

    return () => clearInterval(interval);
  }, [startAt, duration, phase, isFinished]);

  useEffect(() => {
    if (!isActive || isFinished) {
      return;
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === " " || e.key === "Backspace") {
        e.preventDefault();
      }

      if (e.key === "Backspace") {
        if (typed.length > 0) {
          const charToDelete = typed[typed.length - 1];
          const isSpaceMistake = mistakes.has(typed.length - 1);

          if (charToDelete === " " && !isSpaceMistake) {
            const previousSpaceIndex = typed.lastIndexOf(" ", typed.length - 2);
            const startOfWord = previousSpaceIndex + 1;
            const endOfWord = typed.length - 1;

            let hasMistakesInWord = false;
            for (let i = startOfWord; i < endOfWord; i += 1) {
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

          setTyped((prev) => prev.slice(0, -1));
          setMistakes((prev) => {
            const next = new Set(prev);
            next.delete(lastIndex);
            return next;
          });
        }
        return;
      }

      if (e.key === " " && typed.length > 0 && typed[typed.length - 1] !== " ") {
        setTyped((prev) => prev + " ");
        setTotalKeystrokes((prev) => prev + 1);
        if (text[typed.length] === " ") {
          setCorrectKeystrokes((prev) => prev + 1);
        }
        return;
      }

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

          setTyped((prev) => prev + e.key);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isActive, isFinished, typed, mistakes, text]);

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
      <Card className="w-full shadow-none border-none">
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
            className="p-6 rounded-lg mb-4 font-mono leading-relaxed overflow-hidden"
          >
            <div
              ref={textRef}
              tabIndex={0}
              className={cn(
                "focus:outline-none transition-all duration-300",
                isFinished ? "h-auto" : "h-[9em]"
              )}
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
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-center">
        <GameStats
          timeLeft={timeLeft}
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
