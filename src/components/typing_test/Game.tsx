"use client";

import Link from "next/link";

import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "../ui/button";
import { generateText, cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import TimeSelect from "./TimeSelect";
import { Timer, Gauge, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useTextMeasurement } from "@/hooks/useTextMeasurement";
import { useCalculateTypingStats } from "@/hooks/useCalculateTypingStats";
import { STORAGE_KEY_TIME_SELECTION, TIME_OPTIONS } from "@/lib/constants";
import GameStats from "./GameStats";
import { AnimatePresence, motion } from "framer-motion";
import Character from "./Character";
import { saveTestResult } from "@/app/actions";
import toast from "react-hot-toast";
import dynamic from "next/dynamic";

const ResultsChart = dynamic(() => import("./ResultsChart"), { ssr: false });

interface GameProps {
  initialBestScores?: { duration: number; wpm: number }[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  user?: any;
}

const Game = ({ initialBestScores = [], user }: GameProps) => {
  const [text, setText] = useState("");
  const [typed, setTyped] = useState("");
  const [selectedTime, setSelectedTime] = useState(30);
  const [timeLeft, setTimeLeft] = useState(selectedTime);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [wpm, setWpm] = useState(0);
  const [rawWpm, setRawWpm] = useState(0);
  const [accuracy, setAccuracy] = useState(100);
  const [totalKeystrokes, setTotalKeystrokes] = useState(0);
  const [correctKeystrokes, setCorrectKeystrokes] = useState(0);
  const [mistakes, setMistakes] = useState(new Set());
  const [lines, setLines] = useState<string[]>([]);
  const [isActive, setIsActive] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [lastTypedTime, setLastTypedTime] = useState<number | null>(null);
  const [isAfk, setIsAfk] = useState(false);
  const [showTimer, setShowTimer] = useState(true);
  const [showWpm, setShowWpm] = useState(true);
  const [wpmHistory, setWpmHistory] = useState<{ time: number; wpm: number }[]>([]);
  const { theme, setTheme } = useTheme();

  const textRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const measureText = useTextMeasurement(containerRef);
  const calculatedStats = useCalculateTypingStats(
    startTime,
    totalKeystrokes,
    correctKeystrokes
  );

  const restartTest = useCallback(() => {
    console.log("restartTest called");
    const newText = generateText();
    setText(newText);
    setTyped("");
    setStartTime(null);
    setTimeLeft(selectedTime);
    setWpm(0);
    setRawWpm(0);
    setAccuracy(100);
    setTotalKeystrokes(0);
    setCorrectKeystrokes(0);
    setMistakes(new Set());
    setIsActive(false);
    setIsFinished(false);
    setLastTypedTime(null);
    setIsAfk(false);
    setWpmHistory([]);

    // Restore UI elements on test restart
    const navbarLinks = document.getElementById("navbar-links");
    const navbarUser = document.getElementById("navbar-user");
    const navbarLogin = document.getElementById("navbar-login");

    if (navbarLinks) navbarLinks.style.opacity = "1";
    if (navbarUser) navbarUser.style.opacity = "1";
    if (navbarLogin) navbarLogin.style.opacity = "1";

    // Refocus on test
    setTimeout(() => {
      if (textRef.current) {
        textRef.current.focus();
      }
    }, 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedTime, measureText]);

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

  // Updates
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Restart on Tab
      if (e.key === "Tab") {
        e.preventDefault();
        restartTest();
        return;
      }

      if (isFinished) {
        return;
      }

      // Prevent page scrolling
      if (e.key === " " || e.key === "Backspace") {
        e.preventDefault();
      }

      setLastTypedTime(Date.now());

      // Mistake handling
      if (e.key === "Backspace") {
        if (typed.length > 0) {
          // Smart backspace: prevent backspacing into a correct previous word
          const charToDelete = typed[typed.length - 1];
          const isSpaceMistake = mistakes.has(typed.length - 1);

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

          setTyped((prev) => prev.slice(0, -1));
          const newMistakes = new Set(mistakes);
          newMistakes.delete(lastIndex);
          setMistakes(newMistakes);
        }

        return;
      }

      if (
        e.key === " " &&
        typed.length > 0 &&
        typed[typed.length - 1] !== " "
      ) {
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
            const newMistakes = new Set(mistakes);
            newMistakes.add(currentIndex);
            setMistakes(newMistakes);
          }

          setTyped((prev) => prev + e.key);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [typed, mistakes, text, restartTest, isFinished]);

  // Start test on first keystroke down
  useEffect(() => {
    if (typed.length === 1) {
      setStartTime(Date.now());
      setLastTypedTime(Date.now());
      setIsActive(true);

      // Fade out UI elements for better focus during test
      const navbarLinks = document.getElementById("navbar-links");
      const navbarUser = document.getElementById("navbar-user");
      const navbarLogin = document.getElementById("navbar-login");

      if (navbarLinks) navbarLinks.style.opacity = "0";
      if (navbarUser) navbarUser.style.opacity = "0";
      if (navbarLogin) navbarLogin.style.opacity = "0";
    }
  }, [typed]);

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

      // Fade UI back in when test completes
      const navbarLinks = document.getElementById("navbar-links");
      const navbarUser = document.getElementById("navbar-user");
      const navbarLogin = document.getElementById("navbar-login");

      if (navbarLinks) navbarLinks.style.opacity = "1";
      if (navbarUser) navbarUser.style.opacity = "1";
      if (navbarLogin) navbarLogin.style.opacity = "1";
    }
  }, [isFinished, handleSaveTest]);

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
              />
            );
          })}
        </div>
      );
    });
  };

  return (
    <div className="w-full flex items-center justify-center">
      <Card className="w-full max-w-[85vw] shadow-none border-none">
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
                      Speed: <span className="font-bold">{wpm} wpm</span>
                    </p>
                    <p className="text-2xl">
                      Accuracy: <span className="font-bold">{accuracy}%</span>
                    </p>
                    <p className="text-xl">Raw: {rawWpm} wpm</p>
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
      <button
        onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        className="fixed bottom-8 right-8 p-3 rounded-full bg-secondary/50 hover:bg-secondary text-muted-foreground hover:text-foreground transition-all duration-200 shadow-lg backdrop-blur-sm"
      >
        <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
        <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100 top-3 left-3" />
        <span className="sr-only">Toggle theme</span>
      </button>
    </div>
  );
};

export default Game;
