# KeyRush

KeyRush is a competitive typing game, its foundations inspired by [monkeytype](https://monkeytype.com/). The core loop is real-time 1v1 multiplayer: queue up, race the same text, and climb ranks with Elo that’s calculated server-side. It’s fast, tense, and genuinely fun to grind.

<img src="/public/og-image.png" alt="KeyRush - Real-time Competitive Typing" width="100%" />

## What it is

Competitive ranked matches use an Elo system with placement matches, visible tiers, and performance-based bonuses. There are also unranked matches for quick warm-ups or if you want to compete with nothing on the line.

If you just want play solo, there's stuff for you here as well: achievements, XP + level progression, detailed stats, and global leaderboards that make improvements feel real.

## Features

- **Real-time 1v1 multiplayer**: Race opponents live with synced text and progress updates
- **Ranked ladder**: Server-authoritative Elo, placement matches, and clear rank tiers
- **Unranked & private matches**: Queue casually or create invite links for friends
- **Solo progression**: Best scores by duration, achievements, XP/levels, and long-term stats
- **Typing tests**: 5s, 15s, 30s, 60s, 120s with live WPM/accuracy
- **Leaderboards**: Daily/weekly/all-time global rankings, as well as ranked leaderboards
- **Friends**: Add your friends to show who's boss
- **Profiles**: Saved history, rankings, and progress tracking
- **Theming & customization**: Preset themes + full custom theme creator with import/export

## Roadmap

- Update this sad logo
- **Different Gamemodes**: 1v1v1 and 1v1v1v1 for a typeracer feel, with different brackets
- **Bots that are personalized to you**: Different bots that the user can chase after to continuously improve
- **Character creation**: Create a character that is showed off during matches, to friends, and on leaderboards. Unlock cosmetics through achievements
- **More solo progression**: I need to find a way to help the solo user feel progress, a reason to keep typing

## Tech Stack

- **Framework**: Next.js 16 (App Router) + React 19 + TypeScript
- **Backend**: Supabase (auth + database)
- **Styling**: Tailwind CSS + shadcn/ui
- **Multiplayer**: PartyKit (WebSockets)
- **State/Schema**: React Query + Context, Zod
- **Animations**: Framer Motion
- **Charts**: Chart.js via `react-chartjs-2`

## Build Instructions

### Prerequisites

- Node.js (v18 or higher)
- npm, yarn, or pnpm

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/Royster0/KeyRush.git
   cd KeyRush
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Set up environment variables:
   Create a `.env.local` file in the root directory and add your credentials:

   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   NEXT_PUBLIC_PARTYKIT_HOST=your_partykit_host
   ```

   **Note**: Multiplayer uses PartyKit. You can run PartyKit locally for development or deploy it for production.

4. Run the development server:

   ```bash
   npm run dev
   ```

5. (Optional) Run PartyKit in development mode:
   ```bash
   npx partykit dev
   ```
