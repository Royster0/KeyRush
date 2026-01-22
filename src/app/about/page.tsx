import React from "react";
import {
  Github,
  Keyboard,
  Clock,
  LineChart,
  Trophy,
  Heart,
  Users,
  Swords,
  TrendingUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { FiGithub } from "react-icons/fi";


export default function About() {
  return (
    <div className="container mx-auto max-w-4xl p-4 space-y-12 py-8">
      <section className="space-y-4">
        <h1 className="text-4xl font-bold text-center">About KeyRush</h1>
        <p className="text-lg text-center text-muted-foreground">
          A minimalistic typing test platform, heavily inspired by
          monkeytype.com
        </p>
      </section>

      <section className="space-y-6">
        <h2 className="text-2xl font-bold">Introduction</h2>
        <p className="text-muted-foreground">
          KeyRush is a typing test website with a focus on simplicity and competition. It
          features multiple test modes, real-time multiplayer matches, ranked gameplay with an Elo system,
          user accounts to save your typing history, and detailed statistics. Test your typing speed and accuracy
          in a sleek, customizable environment, track your progress, compete on the leaderboards,
          and challenge opponents in head-to-head typing battles.
        </p>
      </section>

      <section className="space-y-6">
        <h2 className="text-2xl font-bold">Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FeatureCard
            icon={<Keyboard className="w-6 h-6" />}
            title="Multiple Test Modes"
            description="Choose from various time-based tests including 15, 30, 60, and 120 seconds to challenge yourself in different ways."
          />
          <FeatureCard
            icon={<Clock className="w-6 h-6" />}
            title="Time-Based Tests"
            description="Focus on how many words you can type accurately within a set time limit, helping you build speed and consistency."
          />
          <FeatureCard
            icon={<Users className="w-6 h-6" />}
            title="Real-Time Multiplayer"
            description="Challenge opponents in live 1v1 typing matches. See your opponent's progress in real-time as you both type the same text simultaneously."
          />
          <FeatureCard
            icon={<Swords className="w-6 h-6" />}
            title="Ranked Matches & Elo System"
            description="Compete in ranked matches to climb the ladder. Your Elo rating adjusts based on wins, losses, and opponent strength. Complete placement matches to get your initial rank."
          />
          <FeatureCard
            icon={<LineChart className="w-6 h-6" />}
            title="Detailed Statistics"
            description="Track your WPM, accuracy, and progress over time with intuitive graphs and comprehensive analytics."
          />
          <FeatureCard
            icon={<Trophy className="w-6 h-6" />}
            title="Leaderboards"
            description="Compete with typists worldwide on daily, weekly, and all-time leaderboards for each test mode."
          />
        </div>
      </section>

      <section className="space-y-6">
        <h2 className="text-2xl font-bold">Multiplayer & Ranked System</h2>
        <p className="text-muted-foreground">
          KeyRush features a comprehensive multiplayer system that lets you compete against other typists in real-time.
          Challenge yourself in ranked matches to climb the Elo ladder, or practice in unranked matches with friends.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FeatureCard
            icon={<Users className="w-6 h-6" />}
            title="Real-Time Matches"
            description="Queue for 1v1 matches with automatic matchmaking. Both players type the same text simultaneously, and you can see your opponent's progress in real-time."
          />
          <FeatureCard
            icon={<Swords className="w-6 h-6" />}
            title="Ranked System"
            description="Compete in ranked matches to earn Elo rating. Complete 5 placement matches to get your initial rank, then climb through tiers from Bronze to Mach."
          />
          <FeatureCard
            icon={<Trophy className="w-6 h-6" />}
            title="Rank Tiers"
            description="Progress through 7 rank tiers: Placement, Bronze, Silver, Gold, Platinum, Diamond, Sonic, and Mach. Your rank is determined by your Elo rating."
          />
          <FeatureCard
            icon={<TrendingUp className="w-6 h-6" />}
            title="Elo Rating"
            description="Your Elo rating adjusts after each ranked match based on whether you win, lose, or draw, and the strength of your opponent. Higher Elo means higher rank."
          />
        </div>
      </section>

      <section className="space-y-6">
        <h2 className="text-2xl font-bold">How is it calculated?</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <CalculationCard
            title="WPM"
            formula="(Correct / 5) / Time"
            description="Words Per Minute is calculated by taking the number of correct keystrokes, dividing by 5 (average word length), and dividing by the elapsed time in minutes."
          />
          <CalculationCard
            title="Raw WPM"
            formula="(Total / 5) / Time"
            description="Raw WPM is calculated similarly but includes both correct and incorrect keystrokes. It represents your pure typing speed regardless of accuracy."
          />
          <CalculationCard
            title="Accuracy"
            formula="(Correct / Total) * 100"
            description="Accuracy is the percentage of correct keystrokes out of the total keystrokes typed."
          />
        </div>
      </section>

      <section className="space-y-6">
        <h2 className="text-2xl font-bold">Tech Stack</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <TechItem
            name="Next.js"
            description="React framework for server-rendered applications"
          />
          <TechItem
            name="TypeScript"
            description="Typed JavaScript for better code quality"
          />
          <TechItem
            name="Tailwind CSS"
            description="Utility-first CSS framework"
          />
          <TechItem name="shadcn/ui" description="Reusable UI components" />
          <TechItem
            name="Supabase"
            description="Open source Firebase alternative"
          />
          <TechItem name="Chart.js" description="Beautiful & simple charts" />
          <TechItem
            name="PartyKit"
            description="Real-time multiplayer infrastructure"
          />
          <TechItem
            name="Framer Motion"
            description="Animation library for React"
          />
        </div>
      </section>

      <section className="space-y-6">
        <h2 className="text-2xl font-bold">Open Source</h2>
        <p className="text-muted-foreground">
          KeyRush is open source and available on GitHub.
        </p>
        <div className="flex justify-center">
          <Button variant="outline" className="gap-2">
            <FiGithub className="w-4 h-4" />
            <a href="https://github.com/Royster0/KeyRush" target="_blank" rel="noopener noreferrer">View on GitHub</a>
          </Button>
        </div>
      </section>

      <section className="pt-8 text-center border-t">
        <p className="flex items-center justify-center text-sm text-muted-foreground gap-1">
          Made with <Heart className="w-4 h-4 text-red-500" /> by Roy Huynh
        </p>
      </section>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <Card>
      <CardContent className="p-6 space-y-3">
        <div className="flex items-center gap-3">
          <div className="text-primary">{icon}</div>
          <h3 className="text-xl font-medium">{title}</h3>
        </div>
        <p className="text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
}

function TechItem({
  name,
  description,
}: {
  name: string;
  description: string;
}) {
  return (
    <div className="flex flex-col p-4 border rounded-lg">
      <span className="font-medium">{name}</span>
      <span className="text-sm text-muted-foreground">{description}</span>
    </div>
  );
}

function CalculationCard({
  title,
  formula,
  description,
}: {
  title: string;
  formula: string;
  description: string;
}) {
  return (
    <Card>
      <CardContent className="p-6 space-y-3">
        <h3 className="text-xl font-medium">{title}</h3>
        <code className="block bg-muted p-2 rounded text-sm font-mono text-center">
          {formula}
        </code>
        <p className="text-muted-foreground text-sm">{description}</p>
      </CardContent>
    </Card>
  );
}
