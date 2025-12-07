import { useState, useEffect } from "react";
import { STORAGE_KEY_CARET_SPEED, CARET_SPEEDS, CaretSpeed } from "@/lib/constants";

export function useSettings() {
  const [caretSpeed, setCaretSpeedState] = useState<CaretSpeed>(CARET_SPEEDS.MEDIUM);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const storedSpeed = localStorage.getItem(STORAGE_KEY_CARET_SPEED);
    if (storedSpeed && Object.values(CARET_SPEEDS).includes(storedSpeed as CaretSpeed)) {
      setCaretSpeedState(storedSpeed as CaretSpeed);
    }
  }, []);

  const setCaretSpeed = (speed: CaretSpeed) => {
    setCaretSpeedState(speed);
    localStorage.setItem(STORAGE_KEY_CARET_SPEED, speed);
  };

  return {
    caretSpeed,
    setCaretSpeed,
    mounted,
  };
}
