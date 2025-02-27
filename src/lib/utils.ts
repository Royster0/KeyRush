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

// Format date to readable string
export function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

// Format time duration in seconds to string
export function formatDuration(seconds: number): string {
  if (seconds < 60) {
    return `${seconds}s`;
  }
  return `${Math.floor(seconds / 60)}m ${seconds % 60}s`;
}
