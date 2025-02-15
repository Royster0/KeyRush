"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "../ui/button";
import { ModeToggle } from "../ui/ModeToggle";
import { generateText } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import TimeSelect from "./TimeSelect";
import { RefreshCw } from "lucide-react";
import { useTextMeasurement } from "@/hooks/useTextMeasurement";
import { useCalculateTypingStats } from "@/hooks/useCalculateTypingStats";
import GameStats from "./GameStats";
import { AnimatePresence, motion } from "motion/react";
import Character from "./Character";
import { saveTestResult } from "@/app/actions";
import toast from "react-hot-toast";

const Game = () => {
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

  const textRef = useRef<HTMLDivElement>(null);
  const restartRef = useRef<HTMLButtonElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const measureText = useTextMeasurement(containerRef);
  const calculatedStats = useCalculateTypingStats(
    startTime,
    totalKeystrokes,
    correctKeystrokes
  );

  const restartTest = useCallback(() => {
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

    // Refocus on test
    setTimeout(() => {
      if (textRef.current) {
        textRef.current.focus();
      }
    }, 0);
  }, [selectedTime, measureText]);

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

        if (restartRef.current) {
          restartRef.current.click();
        }

        return;
      }

      if (isFinished) {
        return;
      }

      // Prevent page scrolling
      if (e.key === " " || e.key === "Backspace") {
        e.preventDefault();
      }

      // Mistake handling
      if (e.key === "Backspace") {
        if (typed.length > 0) {
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
      setIsActive(true);
    }
  }, [typed]);

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
    if (!isFinished) {
      return;
    }

    try {
      await saveTestResult({
        wpm: wpm,
        rawWpm: rawWpm,
        accuracy: accuracy,
        duration: selectedTime,
      });
      toast.success("Test Saved", {
        duration: 1000,
      });
    } catch (error) {
      console.log("Failed to save user test scores:", error);
    }
  }, [wpm, rawWpm, accuracy, selectedTime, isFinished]);

  useEffect(() => {
    if (isFinished) {
      handleSaveTest();
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
        <div key={lineIndex} className="h-[2.5em] whitespace-pre relative">
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
    <div className="min-h-fill min-w-full flex items-center justify-center mt-[7em]">
      <Card className="w-full max-w-4xl shadow-none border-none">
        <CardHeader>
          <CardTitle className="flex justify-between items-center px-6 py">
            {/* Time Selection/Restart */}
            <div className="flex items-center gap-4">
              <TimeSelect
                selectedTime={selectedTime}
                onTimeSelect={(time) => {
                  setSelectedTime(time);
                  restartTest();
                }}
                isActive={isActive}
              />
              <Button
                ref={restartRef}
                variant="outline"
                size="icon"
                onClick={restartTest}
                className="flex items-center"
              >
                <RefreshCw className="size-4" />
              </Button>
            </div>

            {/* Theme Toggle */}
            <div>
              <ModeToggle />
            </div>

            {/* Test Stats */}
            <div>
              <GameStats
                timeLeft={timeLeft}
                wpm={wpm}
                rawWpm={rawWpm}
                accuracy={accuracy}
              />
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
              className="h-[7.5em] focus:outline-none"
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
    </div>
  );
};

export default Game;
