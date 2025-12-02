# KeyRush

KeyRush is a dynamic, competitive typing test application designed to help users improve their typing skills while competing on global leaderboards.

<img src="/public/KeyRush_Logo.svg" alt="KeyRush Logo" width="200" />

## Features

- **Typing Test**: Test your typing speed with various durations (5s, 15s, 30s, 60s, 120s).
- **Real-time Metrics**: Track your WPM, Raw WPM, and Accuracy in real-time.
- **User Profiles**: Create an account to save your test history and track your progress over time.
- **Global Leaderboards**: Compete with other users for the top spot on daily, weekly, and all-time leaderboards.
- **Detailed Stats**: View detailed charts and graphs of your performance history.
- **Theming & Customization**: Fully customizable UI with preset themes and a powerful theme creator.
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
- **Charts**: [Chart.js](https://www.chartjs.org/) via `react-chartjs-2`

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
   Create a `.env.local` file in the root directory and add your Supabase credentials:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. Run the development server:
   ```bash
   npm run dev
   ```

## Project Structure

- `src/app`: Next.js App Router pages and API routes.
- `src/components`: Reusable UI components.
- `src/lib`: Utility functions, constants, and service layer.
- `src/lib/services`: Business logic and database interactions.
- `src/types`: TypeScript type definitions.
- `src/utils`: Supabase client and middleware configuration.
