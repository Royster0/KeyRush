"use client";

import { Github, Keyboard, Trophy, BarChart3, Zap } from "lucide-react";
import Link from "next/link";
import { motion } from "motion/react";

export default function About() {
  return (
    <div className="min-h-screen">
      <div className="max-w-2xl mx-auto px-4 py-16 space-y-16">
        {/* Intro */}
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-5"
        >
          <h1 className="text-3xl font-bold tracking-tight">About KeyRush</h1>
          <p className="text-muted-foreground leading-relaxed text-lg">
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
        </motion.section>

        {/* What's here */}
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="space-y-5"
        >
          <h2 className="text-xl font-semibold">What you can do</h2>
          <ul className="space-y-3 text-muted-foreground">
            <li className="flex gap-4 items-start">
              <Keyboard className="h-5 w-5 text-primary mt-0.5 shrink-0" />
              <span>Take typing tests (5s, 15s, 30s, 60s, 120s)</span>
            </li>
            <li className="flex gap-4 items-start">
              <Zap className="h-5 w-5 text-primary mt-0.5 shrink-0" />
              <span>Race against others in real-time 1v1 matches</span>
            </li>
            <li className="flex gap-4 items-start">
              <Trophy className="h-5 w-5 text-primary mt-0.5 shrink-0" />
              <span>Climb ranked with an Elo system (Bronze to Mach)</span>
            </li>
            <li className="flex gap-4 items-start">
              <BarChart3 className="h-5 w-5 text-primary mt-0.5 shrink-0" />
              <span>Track your progress with stats and charts</span>
            </li>
            <li className="flex gap-4 items-start">
              <Trophy className="h-5 w-5 text-primary mt-0.5 shrink-0" />
              <span>Compete on daily, weekly, and all-time leaderboards</span>
            </li>
          </ul>
        </motion.section>

        {/* How stats work */}
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="space-y-5"
        >
          <h2 className="text-xl font-semibold">How WPM is calculated</h2>
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-5">
              <code className="px-3 py-1.5 rounded-lg bg-muted/50 border border-border/40 font-mono text-primary text-sm shrink-0">
                WPM
              </code>
              <span className="text-muted-foreground text-sm">
                (correct word chars + correct spaces / 5) / time in minutes
              </span>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-5">
              <code className="px-3 py-1.5 rounded-lg bg-muted/50 border border-border/40 font-mono text-primary text-sm shrink-0">
                Raw
              </code>
              <span className="text-muted-foreground text-sm">
                (all keystrokes, incl. mistakes + corrected chars, / 5) / time in minutes
              </span>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-5">
              <code className="px-3 py-1.5 rounded-lg bg-muted/50 border border-border/40 font-mono text-primary text-sm shrink-0">
                Acc
              </code>
              <span className="text-muted-foreground text-sm">
                correct keystrokes / total keystrokes * 100
              </span>
            </div>
            <div className="space-y-2 pt-2 text-sm text-muted-foreground border-l-2 border-border/40 pl-4">
              <p>
                Words only count when fully correct, and only the space after a
                correct word counts toward WPM.
              </p>
              <p>
                Backspacing does not reduce keystroke counts; it only edits what
                you see.
              </p>
            </div>
          </div>
        </motion.section>

        {/* Tech */}
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="space-y-5"
        >
          <h2 className="text-xl font-semibold">Built with</h2>
          <div className="flex flex-wrap gap-2">
            {[
              "Next.js",
              "TypeScript",
              "Tailwind",
              "shadcn/ui",
              "Supabase",
              "PartyKit",
              "Chart.js",
            ].map((tech, index) => (
              <motion.span
                key={tech}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: 0.35 + index * 0.03 }}
                className="px-3 py-1.5 rounded-lg bg-muted/30 border border-border/40 text-sm text-muted-foreground"
              >
                {tech}
              </motion.span>
            ))}
          </div>
        </motion.section>

        {/* Links */}
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="space-y-5 pt-6 border-t border-border/50"
        >
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
          <p className="text-sm text-muted-foreground">
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
