import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { WORD_POOL } from "./constants";

// shadcn
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Generate random text
export function generateText(): string {
  const words = Array.from(
    { length: 400 },
    () => WORD_POOL[Math.floor(Math.random() * WORD_POOL.length)]
  );

  return words.join(" ");
}
