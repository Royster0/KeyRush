"use client";

import {
  Github,
  Keyboard,
  Trophy,
  BarChart3,
  Zap,
  Info,
  ListChecks,
  Calculator,
  Wrench,
  Award,
  Users,
  Flag,
  Sparkles,
  Palette,
  Swords,
} from "lucide-react";
import Link from "next/link";
import { motion } from "motion/react";

export default function About() {
  return (
    <div className="min-h-screen">
      <div className="container mx-auto max-w-5xl px-4 py-12 space-y-0">
        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center space-y-4 pb-10"
        >
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
            About KeyRush
          </h1>
          <p className="text-muted-foreground max-w-lg mx-auto leading-relaxed">
            KeyRush is a typing test website heavily inspired by{" "}
            <a
              href="https://monkeytype.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-foreground underline underline-offset-4 hover:text-primary transition-colors"
            >
              monkeytype
            </a>
            . It started as a way to learn web development and grew into
            something I use daily to practice typing.
          </p>
        </motion.header>

        {/* What you can do */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.1 }}
          className="relative border-b border-primary/30 py-10"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10">
              <ListChecks className="h-4 w-4 text-primary" />
            </div>
            <h3 className="text-xl font-mono uppercase tracking-[0.15em]">
              Features
            </h3>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {[
              {
                icon: Keyboard,
                text: "Take typing tests across 5 durations (5s to 120s)",
              },
              {
                icon: Swords,
                text: "Race against others in real-time 1v1 multiplayer",
              },
              {
                icon: Trophy,
                text: "Climb ranked with Elo ratings (Bronze to Mach)",
              },
              {
                icon: BarChart3,
                text: "Track WPM history, activity, and personal bests",
              },
              {
                icon: Zap,
                text: "Earn XP from typing and level up over time",
              },
              {
                icon: Award,
                text: "Unlock badges for achievements and milestones",
              },
              {
                icon: Users,
                text: "Add friends and see their stats and online status",
              },
              {
                icon: Flag,
                text: "Compete on daily, weekly, and all-time leaderboards",
              },
              {
                icon: Sparkles,
                text: "Customize your banner with backgrounds, borders, and titles",
              },
              {
                icon: Palette,
                text: "Choose from multiple themes or create your own",
              },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.15 + i * 0.05 }}
                className="flex items-start gap-3.5 rounded-xl border border-border/40 bg-muted/20 px-4 py-3.5"
              >
                <item.icon className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                <span className="text-sm text-muted-foreground">
                  {item.text}
                </span>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* How WPM is calculated */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.2 }}
          className="relative border-b border-primary/30 py-10"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10">
              <Calculator className="h-4 w-4 text-primary" />
            </div>
            <h3 className="text-xl font-mono uppercase tracking-[0.15em]">
              How WPM is Calculated
            </h3>
          </div>

          <div className="space-y-3">
            {[
              {
                label: "WPM",
                desc: "(correct word chars + correct spaces / 5) / time in minutes",
              },
              {
                label: "Raw",
                desc: "(all keystrokes, incl. mistakes + corrected chars, / 5) / time in minutes",
              },
              {
                label: "Acc",
                desc: "correct keystrokes / total keystrokes × 100",
              },
            ].map((item, i) => (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 0.25 + i * 0.05 }}
                className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 rounded-xl border border-border/40 bg-muted/20 px-4 py-3.5"
              >
                <code className="px-3 py-1 rounded-lg bg-primary/10 border border-primary/20 font-mono text-primary text-sm font-semibold shrink-0 w-fit">
                  {item.label}
                </code>
                <span className="text-sm text-muted-foreground">
                  {item.desc}
                </span>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.4 }}
            className="mt-4 space-y-2 text-sm text-muted-foreground border-l-2 border-primary/20 pl-4"
          >
            <p>
              During the test, only fully completed correct words count toward
              WPM. When the test ends, if you&apos;re mid-word and all typed
              characters are correct, those partial characters are included.
            </p>
            <p>
              Backspacing does not reduce keystroke counts; it only edits what
              you see.
            </p>
          </motion.div>
        </motion.section>

        {/* Built with */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.3 }}
          className="relative border-b border-primary/30 py-10"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10">
              <Wrench className="h-4 w-4 text-primary" />
            </div>
            <h3 className="text-xl font-mono uppercase tracking-[0.15em]">
              Built With
            </h3>
          </div>

          <div className="flex flex-wrap gap-2">
            {[
              "Next.js",
              "TypeScript",
              "Tailwind",
              "shadcn/ui",
              "Supabase",
              "PartyKit",
              "Chart.js",
            ].map((tech, i) => (
              <motion.span
                key={tech}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: 0.35 + i * 0.03 }}
                className="px-3.5 py-1.5 rounded-full bg-muted/30 border border-border/40 text-sm text-muted-foreground font-mono"
              >
                {tech}
              </motion.span>
            ))}
          </div>
        </motion.section>

        {/* Footer */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.4 }}
          className="py-10"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10">
              <Info className="h-4 w-4 text-primary" />
            </div>
            <h3 className="text-xl font-mono uppercase tracking-[0.15em]">
              Links
            </h3>
          </div>

          <div className="flex flex-wrap gap-6 text-sm">
            <a
              href="https://github.com/Royster0/KeyRush"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <Github className="w-4 h-4" />
              Source code
            </a>
            <Link
              href="/"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              Start typing &rarr;
            </Link>
          </div>
          <p className="text-sm text-muted-foreground mt-4">
            Made by{" "}
            <a
              href="https://github.com/Royster0"
              target="_blank"
              rel="noopener noreferrer"
              className="text-foreground hover:text-primary transition-colors"
            >
              Roy Huynh
            </a>
          </p>
        </motion.section>
      </div>
    </div>
  );
}
