import { useState, useEffect } from "react";
import {
  STORAGE_KEY_CARET_SPEED,
  STORAGE_KEY_SHOW_OPPONENT_CARET,
  STORAGE_KEY_SINGLEPLAYER_WIDTH,
  STORAGE_KEY_MULTIPLAYER_WIDTH,
  CARET_SPEEDS,
  TEST_WIDTH_OPTIONS,
  DEFAULT_SINGLEPLAYER_WIDTH,
  DEFAULT_MULTIPLAYER_WIDTH,
  CaretSpeed,
  TestWidth,
} from "@/lib/constants";

export function useSettings() {
  const [caretSpeed, setCaretSpeedState] = useState<CaretSpeed>(CARET_SPEEDS.MEDIUM);
  const [showOpponentCaret, setShowOpponentCaretState] = useState(true);
  const [singleplayerWidth, setSingleplayerWidthState] = useState<TestWidth>(DEFAULT_SINGLEPLAYER_WIDTH);
  const [multiplayerWidth, setMultiplayerWidthState] = useState<TestWidth>(DEFAULT_MULTIPLAYER_WIDTH);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    
    // Load caret speed
    const storedSpeed = localStorage.getItem(STORAGE_KEY_CARET_SPEED);
    if (storedSpeed && Object.values(CARET_SPEEDS).includes(storedSpeed as CaretSpeed)) {
      setCaretSpeedState(storedSpeed as CaretSpeed);
    }

    const storedOpponentCaret = localStorage.getItem(STORAGE_KEY_SHOW_OPPONENT_CARET);
    if (storedOpponentCaret !== null) {
      setShowOpponentCaretState(storedOpponentCaret === "true");
    }

    // Load singleplayer width
    const storedSingleplayerWidth = localStorage.getItem(STORAGE_KEY_SINGLEPLAYER_WIDTH);
    if (storedSingleplayerWidth) {
      const width = Number(storedSingleplayerWidth);
      if (TEST_WIDTH_OPTIONS.includes(width as TestWidth)) {
        setSingleplayerWidthState(width as TestWidth);
      }
    }

    // Load multiplayer width
    const storedMultiplayerWidth = localStorage.getItem(STORAGE_KEY_MULTIPLAYER_WIDTH);
    if (storedMultiplayerWidth) {
      const width = Number(storedMultiplayerWidth);
      if (TEST_WIDTH_OPTIONS.includes(width as TestWidth)) {
        setMultiplayerWidthState(width as TestWidth);
      }
    }
  }, []);

  const setCaretSpeed = (speed: CaretSpeed) => {
    setCaretSpeedState(speed);
    localStorage.setItem(STORAGE_KEY_CARET_SPEED, speed);
  };

  const setShowOpponentCaret = (value: boolean) => {
    setShowOpponentCaretState(value);
    localStorage.setItem(STORAGE_KEY_SHOW_OPPONENT_CARET, String(value));
  };

  const setSingleplayerWidth = (width: TestWidth) => {
    setSingleplayerWidthState(width);
    localStorage.setItem(STORAGE_KEY_SINGLEPLAYER_WIDTH, String(width));
  };

  const setMultiplayerWidth = (width: TestWidth) => {
    setMultiplayerWidthState(width);
    localStorage.setItem(STORAGE_KEY_MULTIPLAYER_WIDTH, String(width));
  };

  return {
    caretSpeed,
    setCaretSpeed,
    showOpponentCaret,
    setShowOpponentCaret,
    singleplayerWidth,
    setSingleplayerWidth,
    multiplayerWidth,
    setMultiplayerWidth,
    mounted,
  };
}
