"use client";

import { createContext, useContext, useState, ReactNode } from "react";

type GameContextType = {
  isGameActive: boolean;
  setIsGameActive: (active: boolean) => void;
};

const GameContext = createContext<GameContextType | undefined>(undefined);

export function GameProvider({ children }: { children: ReactNode }) {
  const [isGameActive, setIsGameActive] = useState(false);

  return (
    <GameContext.Provider value={{ isGameActive, setIsGameActive }}>
      {children}
    </GameContext.Provider>
  );
}

export function useGameContext() {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error("useGameContext must be used within a GameProvider");
  }
  return context;
}
