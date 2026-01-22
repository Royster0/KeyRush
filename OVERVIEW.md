# KeyRush Codebase Overview

**KeyRush** is a dynamic, competitive typing test application designed to help users improve their typing skills while competing on global leaderboards. It focuses on real-time performance tracking, user personalization (theming), and global competition.

## 1. Architecture & Tech Stack

The application follows a **Next.js App Router** architecture, leveraging server-side rendering (SSR) where possible and Client Components for interactive elements (like the typing game).

* **Framework**: [Next.js 15](https://nextjs.org/) (App Router)
* **Language**: TypeScript
* **Styling**: Tailwind CSS with `tailwind-merge` and `clsx` for utility class management.
* **UI Library**: [Shadcn UI](https://ui.shadcn.com/) (Radix UI primitives).
* **State Management**: React Hooks (`useState`, `useCallback`, `useReducer`) and Context API.
* **Backend & Auth**: [Supabase](https://supabase.com/) (PostgreSQL) for user authentication and data persistence.
* **Animations**: Framer Motion (`framer-motion`) for UI transitions.
* **Visualization**: Chart.js (`react-chartjs-2`) for performance graphs.

## 2. Core Modules Analysis

### A. The Typing Engine (`src/components/typing_test/Game.tsx`)
This is the core component of the application. It handles user input, game state, and rendering.
* **State Machine**: Manages states like `isActive`, `isFinished`, and `isAfk`.
* **Input Handling**: Listens to global `keydown` events to capture typing. It implements "smart backspace" logic to prevent users from modifying previously correct words if they have moved past them, unless they are correcting immediate mistakes.
* **Timer & AFK**: Includes an AFK timer that flags the test if no input is detected for >6.5 seconds, preventing the score from being saved.
* **Rendering**: Uses a "sliding window" approach (`renderText`) to display only the current, previous, and next lines of text to maintain performance.

### B. Stats Calculation (`src/hooks/useCalculateTypingStats.ts`)
This hook isolates the mathematical logic for performance metrics.
* **WPM (Words Per Minute)**: Calculated as `(correctKeystrokes / 5) / timeElapsedInMinutes`.
* **Raw WPM**: Calculated as `(totalKeystrokes / 5) / timeElapsedInMinutes`.
* **Accuracy**: Percentage of `correctKeystrokes` against `totalKeystrokes`.
* **Real-time Updates**: The hook returns a callback that is invoked periodically by the `Game` component to update the UI every 100ms.

### C. Theming System (`src/hooks/useCustomTheme.ts`)
KeyRush features a robust, user-accessible theming engine.
* **Implementation**: It maps theme colors to CSS variables (e.g., `--background`, `--primary`).
* **Persistence**: Themes are saved in `localStorage` under `custom-themes`.
* **Preset vs. Custom**: Users can switch between hardcoded presets (like "Bliss", "Catppuccin") or create fully custom themes. The system automatically converts hex codes to HSL values for consistent shading.

### D. Data Persistence (`src/lib/services/test-results.ts`)
Handles interactions with the Supabase backend.
* **Saving Results**: Checks if a user is authenticated before attempting to insert a row into the `test_results` table.
* **Data Mapping**: Converts database snake_case fields (e.g., `raw_wpm`) to application camelCase models (`rawWpm`).
* **Security**: Uses Supabase Row Level Security (RLS) policies (implied by the user-centric queries) to ensure users only access their own data.

## 3. Project Structure

The project follows a standard Next.js App Router layout:

* **`src/app`**: Routes and pages.
    * `page.tsx`: Landing page, wraps the game in a Suspense boundary.
    * `auth/`: Authentication routes (Login, Signup).
* **`src/components`**: React components.
    * `typing_test/`: Components specific to the game (Game, Character, Stats).
    * `ui/`: Reusable Shadcn UI components (Card, Button, Input).
* **`src/hooks`**: Custom React hooks.
    * `useCalculateTypingStats`: Math logic for scoring.
    * `useCustomTheme`: Theme state management.
    * `useTextMeasurement`: Utilities for measuring text layout.
* **`src/lib`**: Utilities and business logic.
    * `constants.ts`: Word pools, config constants, and theme presets.
    * `utils.ts`: Helper functions (text generation, class merging).
    * `services/`: Backend interaction layers (Supabase calls).
* **`src/types`**: TypeScript definitions for Game, Auth, and Profile models.

## 4. Key Data Flows

1.  **Game Initialization**:
    * `Game.tsx` loads preferences (duration) from `localStorage`.
    * `generateText()` creates a random string of words from `WORD_POOL`.

2.  **Typing Loop**:
    * User types -> `handleKeyDown` updates `typed` string and `keystrokes` counters.
    * `useEffect` triggers `calculateStats` -> updates `wpm`/`accuracy` state.
    * UI re-renders `Character` components with correct/incorrect styling.

3.  **Completion**:
    * Timer hits 0 -> `isFinished` becomes true.
    * `handleSaveTest` is triggered.
    * If user is logged in -> `saveTestResult` sends data to Supabase.
    * If anonymous -> Prompt to login.

## 5. Developer Context / Hints

* **Word Generation**: The `generateText` function in `utils.ts` has a buffer mechanism to prevent the same word from appearing too close to itself.
* **Strict Mode**: The app uses `use client` directives extensively for interactive components. Be mindful of server/client boundaries when refactoring.
* **Environment**: Requires `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` to function fully.