import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { WORD_POOL } from "./constants";

// shadcn
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Generate random text with no duplicate words in recent buffer
export function generateText(): string {
  const BUFFER_SIZE = 10; // Prevent duplicates within last 10 words
  const words: string[] = [];
  const recentWords: string[] = [];

  for (let i = 0; i < 400; i++) {
    let newWord: string;
    let attempts = 0;
    const maxAttempts = 50; // Prevent infinite loop in edge cases

    // Keep trying to find a word not in the recent buffer
    do {
      newWord = WORD_POOL[Math.floor(Math.random() * WORD_POOL.length)];
      attempts++;
    } while (recentWords.includes(newWord) && attempts < maxAttempts);

    words.push(newWord);

    // Update recent words buffer
    recentWords.push(newWord);
    if (recentWords.length > BUFFER_SIZE) {
      recentWords.shift(); // Remove oldest word from buffer
    }
  }

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
