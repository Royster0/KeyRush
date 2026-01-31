import { Github } from "lucide-react";
import Link from "next/link";
import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "About | KeyRush",
  description: "Learn about KeyRush and how it came to be.",
  path: "/about",
});

export default function About() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-12 space-y-12">
      {/* Intro */}
      <section className="space-y-4">
        <h1 className="text-2xl font-bold">About KeyRush</h1>
        <p className="text-muted-foreground leading-relaxed">
          KeyRush is a typing test website heavily inspired by{" "}
          <a
            href="https://monkeytype.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-foreground underline underline-offset-4 hover:text-primary"
          >
            monkeytype
          </a>
          . It started as a way to learn web development and grew into something
          I use daily to practice typing.
        </p>
      </section>

      {/* What's here */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold">What you can do</h2>
        <ul className="space-y-2 text-muted-foreground">
          <li className="flex gap-3">
            <span className="text-primary">•</span>
            <span>Take typing tests (5s, 15s, 30s, 60s, 120s)</span>
          </li>
          <li className="flex gap-3">
            <span className="text-primary">•</span>
            <span>Race against others in real-time 1v1 matches</span>
          </li>
          <li className="flex gap-3">
            <span className="text-primary">•</span>
            <span>Climb ranked with an Elo system (Bronze → Mach)</span>
          </li>
          <li className="flex gap-3">
            <span className="text-primary">•</span>
            <span>Track your progress with stats and charts</span>
          </li>
          <li className="flex gap-3">
            <span className="text-primary">•</span>
            <span>Compete on daily, weekly, and all-time leaderboards</span>
          </li>
        </ul>
      </section>

      {/* How stats work */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold">How WPM is calculated</h2>
        <div className="space-y-3 text-sm">
          <div className="flex items-center gap-4">
            <code className="px-2 py-1 rounded bg-muted font-mono text-primary">
              WPM
            </code>
            <span className="text-muted-foreground">
              (correct word chars + correct spaces ÷ 5) ÷ time in minutes
            </span>
          </div>
          <div className="flex items-center gap-4">
            <code className="px-2 py-1 rounded bg-muted font-mono text-primary">
              Raw
            </code>
            <span className="text-muted-foreground">
              (all keystrokes, incl. mistakes + corrected chars, ÷ 5) ÷ time in minutes
            </span>
          </div>
          <div className="flex items-center gap-4">
            <code className="px-2 py-1 rounded bg-muted font-mono text-primary">
              Acc
            </code>
            <span className="text-muted-foreground">
              correct keystrokes ÷ total keystrokes × 100
            </span>
          </div>
          <p className="text-muted-foreground">
            Words only count when fully correct, and only the space after a correct
            word counts toward WPM.
          </p>
          <p className="text-muted-foreground">
            Backspacing does not reduce keystroke counts; it only edits what you see.
          </p>
        </div>
      </section>

      {/* Tech */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold">Built with</h2>
        <p className="text-muted-foreground text-sm leading-relaxed">
          Next.js, TypeScript, Tailwind, shadcn/ui, Supabase, PartyKit, Chart.js
        </p>
      </section>

      {/* Links */}
      <section className="space-y-4 pt-4 border-t border-border">
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
            Start typing →
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
      </section>
    </div>
  );
}
