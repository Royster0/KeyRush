"use client";

import Link from "next/link";

import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "../ui/button";
import { generateText, cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import TimeSelect from "./TimeSelect";
import { Timer, Gauge } from "lucide-react";
import { useTextMeasurement } from "@/hooks/useTextMeasurement";
import { useCalculateTypingStats } from "@/hooks/useCalculateTypingStats";
import { useTypingInput } from "@/hooks/useTypingInput";
import { STORAGE_KEY_TIME_SELECTION, TIME_OPTIONS } from "@/lib/constants";
import { useSettings } from "@/hooks/useSettings";
import GameStats from "./GameStats";
import { AnimatePresence, motion } from "framer-motion";
import Character from "./Character";
import { saveTestResult } from "@/app/actions";
import toast from "react-hot-toast";
import dynamic from "next/dynamic";
import { ThemeModal } from "../ThemeModal";
import { useGameContext } from "@/contexts/GameContext";

const ResultsChart = dynamic(() => import("./ResultsChart"), { ssr: false });

import { UserWithProfile } from "@/types/auth.types";

interface GameProps {
  initialBestScores?: { duration: number; wpm: number }[];
  user?: UserWithProfile | null;
}

const Game = ({ initialBestScores = [], user }: GameProps) => {
  const [text, setText] = useState("");
  const [selectedTime, setSelectedTime] = useState(30);
  const [timeLeft, setTimeLeft] = useState(selectedTime);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [wpm, setWpm] = useState(0);
  const [rawWpm, setRawWpm] = useState(0);
  const [accuracy, setAccuracy] = useState(100);
  const [lines, setLines] = useState<string[]>([]);
  const [isActive, setIsActive] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [lastTypedTime, setLastTypedTime] = useState<number | null>(null);
  const [isAfk, setIsAfk] = useState(false);
  const [showTimer, setShowTimer] = useState(true);
  const [showWpm, setShowWpm] = useState(true);
  const [wpmHistory, setWpmHistory] = useState<{ time: number; wpm: number }[]>([]);
  const { caretSpeed, singleplayerWidth } = useSettings();
  const { setIsGameActive } = useGameContext();

  const textRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const {
    typed,
    mistakes,
    totalKeystrokes,
    correctKeystrokes,
    handleKeyDown: handleTypingKeyDown,
    reset: resetTyping,
  } = useTypingInput({
    text,
    isActive: !isFinished, // Allow typing before active for first keystroke detection
    isFinished,
    onTypedChange: () => setLastTypedTime(Date.now()),
  });

  const measureText = useTextMeasurement(containerRef);
  const calculatedStats = useCalculateTypingStats(
    startTime,
    totalKeystrokes,
    correctKeystrokes
  );

  const restartTest = useCallback(() => {
    const newText = generateText();
    setText(newText);
    resetTyping();
    setStartTime(null);
    setTimeLeft(selectedTime);
    setWpm(0);
    setRawWpm(0);
    setAccuracy(100);
    setIsActive(false);
    setIsFinished(false);
    setLastTypedTime(null);
    setIsAfk(false);
    setWpmHistory([]);
    setIsGameActive(false);

    // Refocus on test
    setTimeout(() => {
      if (textRef.current) {
        textRef.current.focus();
      }
    }, 0);
  }, [selectedTime, setIsGameActive, resetTyping]);

  // Load saved time on mount
  useEffect(() => {
    const savedTime = localStorage.getItem(STORAGE_KEY_TIME_SELECTION);
    if (savedTime) {
      const time = parseInt(savedTime);
      if (TIME_OPTIONS.includes(time as any)) {
        setSelectedTime(time);
        setTimeLeft(time);
      }
    }
  }, []);

  // Restart
  useEffect(() => {
    restartTest();
  }, [restartTest]);

  // Keyboard event handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Restart on Tab
      if (e.key === "Tab") {
        e.preventDefault();
        restartTest();
        return;
      }

      // Delegate to typing input hook
      handleTypingKeyDown(e);
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [restartTest, handleTypingKeyDown]);

  // Start test on first keystroke down
  useEffect(() => {
    if (typed.length === 1) {
      setStartTime(Date.now());
      setLastTypedTime(Date.now());
      setIsActive(true);
      setIsGameActive(true);
    }
  }, [typed, setIsGameActive]);

  // AFK checker
  useEffect(() => {
    let afkTimer: NodeJS.Timeout;

    if (isActive && !isFinished) {
      afkTimer = setInterval(() => {
        if (lastTypedTime && Date.now() - lastTypedTime > 6500) {
          setIsAfk(true);
        }
      }, 1000);
    }

    return () => clearInterval(afkTimer);
  }, [isActive, isFinished, lastTypedTime]);

  // Timer
  useEffect(() => {
    if (isActive && timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setIsFinished(true);
            setIsActive(false);

            return 0;
          }

          return prev - 1;
        });
      }, 1000); // fire every second

      return () => clearInterval(timer);
    }
  }, [isActive, timeLeft]);

  // Update stats periodically
  useEffect(() => {
    if (isActive) {
      const interval = setInterval(() => {
        const stats = calculatedStats();
        setWpm(stats.wpm);
        setRawWpm(stats.rawWpm);
        setAccuracy(stats.accuracy);

        // Update WPM history
        if (startTime) {
          const elapsed = Math.round((Date.now() - startTime) / 1000);
          setWpmHistory((prev) => {
            // Avoid duplicate entries for the same second
            if (prev.length > 0 && prev[prev.length - 1].time === elapsed) {
              return prev;
            }
            return [...prev, { time: elapsed, wpm: stats.wpm }];
          });
        }
      }, 100);

      return () => clearInterval(interval);
    }
  }, [isActive, calculatedStats]);

  // Observer to stay on line
  useEffect(() => {
    const resizeObserver = new ResizeObserver(() => {
      setLines(measureText(text));
    });

    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    return () => resizeObserver.disconnect();
  }, [text, measureText]);

  // Save test result
  const handleSaveTest = useCallback(async () => {
    if (isAfk) {
      toast.error("Test not saved due to inactivity");
      return;
    }

    if (!isFinished) {
      return;
    }

    const resultData = {
      wpm: wpm,
      rawWpm: rawWpm,
      accuracy: accuracy,
      duration: selectedTime,
    };

    if (!user) {
      localStorage.setItem("pendingResult", JSON.stringify(resultData));
      return;
    }

    try {
      await saveTestResult(resultData);
    } catch (error) {
      console.log("Failed to save user test scores:", error);
    }
  }, [wpm, rawWpm, accuracy, selectedTime, isFinished, isAfk, user]);

  useEffect(() => {
    if (isFinished) {
      handleSaveTest();
      setIsGameActive(false);
    }
  }, [isFinished, handleSaveTest, setIsGameActive]);

  const renderText = () => {
    let typedSoFar = 0;

    const currentLineIndex = lines.findIndex((line) => {
      if (typedSoFar + line.length + 1 > typed.length) {
        return true;
      }
      typedSoFar += line.length + 1;
      return false;
    });

    const displayLines = lines
      .slice(
        Math.max(0, currentLineIndex - 1),
        Math.max(3, currentLineIndex + 2)
      )
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
  };

  return (
    <div className="w-full flex items-center justify-center">
      <Card className="w-full shadow-none border-none" style={{ maxWidth: `${singleplayerWidth}vw` }}>
        <CardHeader>
          <CardTitle className="flex justify-between items-center px-6 py">
            <div className="flex items-center justify-center w-full">
              <motion.div
                animate={{ opacity: isActive ? 0 : 1 }}
                transition={{ duration: 0.3 }}
                className="flex items-center gap-4 bg-secondary/50 px-4 py-2 rounded-md"
              >
                {/* Time Selection */}
                <TimeSelect
                  selectedTime={selectedTime}
                  onTimeSelect={(time) => {
                    setSelectedTime(time);
                    localStorage.setItem(STORAGE_KEY_TIME_SELECTION, time.toString());
                    restartTest();
                  }}
                  isActive={isActive}
                  isVisible={true}
                />

                <div className="w-px h-4 bg-border" />

                {/* Toggles */}
                <div className="flex items-center gap-5">
                  <button
                    onClick={() => setShowTimer((prev) => !prev)}
                    title="Toggle Timer"
                    aria-label="Toggle Timer"
                    className={cn(
                      "text-sm font-medium transition-colors duration-200 flex items-center gap-2",
                      showTimer
                        ? "text-primary"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <Timer className="size-5" />
                  </button>

                  <button
                    onClick={() => setShowWpm((prev) => !prev)}
                    title="Toggle WPM"
                    aria-label="Toggle WPM"
                    className={cn(
                      "text-sm font-medium transition-colors duration-200 flex items-center gap-2",
                      showWpm
                        ? "text-primary"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <Gauge className="size-5" />
                  </button>
                </div>

              </motion.div>
            </div>
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
                {isFinished ? (
                  <motion.div
                    className="text-center"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <p className="text-2xl">
                      Speed: <span className="font-bold">{wpm.toFixed(2)} wpm</span>
                    </p>
                    <p className="text-2xl">
                      Accuracy: <span className="font-bold">{accuracy}%</span>
                    </p>
                    <p className="text-xl">Raw: {rawWpm.toFixed(2)} wpm</p>
                    <p className="text-lg mt-2">
                      Press Tab or Click Restart to try again
                    </p>

                    {wpmHistory.length > 0 && (
                      <ResultsChart
                        data={wpmHistory}
                        duration={selectedTime}
                        personalBest={
                          initialBestScores.find((s) => s.duration === selectedTime)
                            ?.wpm
                        }
                      />
                    )}

                    {!user && (
                      <div className="mt-6 p-4 bg-secondary/30 rounded-lg border border-border/50 max-w-md mx-auto">
                        <p className="text-muted-foreground">
                          <Link href="/auth/login" className="text-primary hover:underline font-medium">
                            Login
                          </Link>
                          {" or "}
                          <Link href="/auth/login" className="text-primary hover:underline font-medium">
                            Sign Up
                          </Link>
                          {" to save your results"}
                        </p>
                      </div>
                    )}
                  </motion.div>
                ) : (
                  <motion.div
                    className="transition-all duration-150"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    {renderText()}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Live Stats */}
      <div className="fixed bottom-20 left-1/2 -translate-x-1/2 pointer-events-none">
        <GameStats
          timeLeft={timeLeft}
          wpm={wpm}
          rawWpm={rawWpm}
          accuracy={accuracy}
          showTimer={showTimer}
          showWpm={showWpm}
        />
      </div>

      {/* Floating Theme Toggle */}
      <ThemeModal />
    </div>
  );
};

export default Game;
