import React from "react";
import {
  Github,
  Keyboard,
  Clock,
  LineChart,
  Trophy,
  Heart,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

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
          KeyRush is a typing test website with a focus on simplicity. It
          features multiple test modes, user accounts to save your typing
          history, and detailed statistics. Test your typing speed and accuracy
          in a sleek, customizable environment, track your progress, and compete
          on the leaderboards.
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
          <TechItem name="GraphJS" description="Beautiful & simple charts" />
        </div>
      </section>

      <section className="space-y-6">
        <h2 className="text-2xl font-bold">Open Source</h2>
        <p className="text-muted-foreground">
          KeyRush is open source and available on GitHub.
        </p>
        <div className="flex justify-center">
          <Button variant="outline" className="gap-2">
            <Github className="w-4 h-4" />
            View on GitHub
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
