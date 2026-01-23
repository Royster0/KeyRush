# KeyRush

KeyRush is a dynamic, competitive typing test application designed to help users improve their typing skills while competing on global leaderboards and in real-time multiplayer matches.

<img src="/public/KeyRush_Logo.svg" alt="KeyRush Logo" width="200" />

## Features

- **Typing Test**: Test your typing speed with various durations (5s, 15s, 30s, 60s, 120s).
- **Real-time Metrics**: Track your WPM, Raw WPM, and Accuracy in real-time.
- **Real-Time Multiplayer**: Challenge opponents in live 1v1 typing matches. See your opponent's progress in real-time as you both type the same text simultaneously.
- **Ranked Matches**: Compete in ranked matches with an Elo rating system. Complete placement matches to get your initial rank and climb the ladder.
- **Unranked Matches**: Practice with friends using invite links or queue for casual matches without Elo changes.
- **User Profiles**: Create an account to save your test history and track your progress over time.
- **Global Leaderboards**: Compete with other users for the top spot on daily, weekly, and all-time leaderboards.
- **Detailed Stats**: View detailed charts and graphs of your performance history.
- **Theming & Customization**: Fully customizable UI with preset themes and a powerful theme creator.
- **Test Width Settings**: Adjust the width of the typing test area separately for singleplayer and multiplayer modes.
- **Responsive Design**: Fully responsive interface that works seamlessly on desktop and mobile devices.

## Theming & Customization

KeyRush offers a robust theming system that allows you to personalize your typing experience:

- **Preset Themes**: Choose from built-in themes like "Bliss" and "Catppuccin".
- **Custom Themes**: Create your own themes using the built-in color picker. Customize every aspect of the UI, including background, foreground, primary colors, and more.
- **Import/Export**: Share your themes with others by exporting them to JSON, or import themes created by the community.
- **Deep Integration**: Themes automatically apply to the entire application

## Tech Stack

- **Framework**: [Next.js 15](https://nextjs.org/)
- **UI Components**: [Shadcn UI](https://ui.shadcn.com/)
- **Database & Auth**: [Supabase](https://supabase.com/)
- **Real-time Multiplayer**: [PartyKit](https://www.partykit.io/)
- **Charts**: [Chart.js](https://www.chartjs.org/) via `react-chartjs-2`
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)

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
   
   **Note**: For multiplayer features, you'll need a PartyKit account. You can run PartyKit locally for development or deploy it for production.

4. Run the development server:
   ```bash
   npm run dev
   ```

5. (Optional) For multiplayer features, run PartyKit in development mode:
   ```bash
   npx partykit dev
   ```

## Multiplayer Features

KeyRush includes a comprehensive multiplayer system:

- **Matchmaking**: Queue for ranked or unranked matches with automatic opponent matching
- **Real-time Sync**: See your opponent's typing progress in real-time with synchronized text
- **Elo System**: Ranked matches use an Elo rating system with placement matches for new players
- **Rank Tiers**: Progress through ranks from Bronze to Mach based on your Elo rating
- **Invite Links**: Create private unranked matches with shareable invite links
- **Match History**: View detailed results with side-by-side WPM charts and statistics

## Project Structure

- `src/app`: Next.js App Router pages and API routes.
- `src/components`: Reusable UI components.
  - `multiplayer/`: Multiplayer-specific components (lobby, match, results)
  - `typing_test/`: Singleplayer typing test components
- `src/lib`: Utility functions, constants, and service layer.
- `src/lib/services`: Business logic and database interactions.
- `src/types`: TypeScript type definitions.
- `src/utils`: Supabase client and middleware configuration.
- `party/`: PartyKit server for real-time multiplayer functionality.
