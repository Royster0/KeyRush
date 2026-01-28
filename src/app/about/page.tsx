"use client";

import React from "react";
import { motion } from "motion/react";
import {
  Keyboard,
  Zap,
  Users,
  Trophy,
  BarChart3,
  Github,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import Link from "next/link";

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 },
};

const stagger = {
  animate: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

export default function About() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 px-4">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/5" />
        <motion.div
          className="relative max-w-4xl mx-auto text-center space-y-6"
          initial="initial"
          animate="animate"
          variants={stagger}
        >
          <motion.div variants={fadeInUp}>
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-sm text-muted-foreground mb-4">
              <Sparkles className="w-3 h-3" />
              Open Source Typing Platform
            </span>
          </motion.div>

          <motion.h1
            variants={fadeInUp}
            className="text-5xl md:text-7xl font-bold tracking-tight"
          >
            Type faster.
            <br />
            <span className="bg-gradient-to-r from-primary via-primary/70 to-primary bg-clip-text text-transparent">
              Compete smarter.
            </span>
          </motion.h1>

          <motion.p
            variants={fadeInUp}
            className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed"
          >
            A minimalist typing test with real-time multiplayer, ranked matches,
            and detailed analytics. Inspired by monkeytype.
          </motion.p>

          <motion.div variants={fadeInUp} className="flex justify-center gap-4 pt-4">
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors"
            >
              Start Typing
              <ArrowRight className="w-4 h-4" />
            </Link>
            <a
              href="https://github.com/Royster0/KeyRush"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg border border-border hover:bg-accent transition-colors"
            >
              <Github className="w-4 h-4" />
              GitHub
            </a>
          </motion.div>
        </motion.div>
      </section>

      {/* Bento Grid Features */}
      <section className="py-16 px-4">
        <motion.div
          className="max-w-5xl mx-auto"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: "-100px" }}
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Large Feature Card */}
            <motion.div
              className="md:col-span-2 group relative overflow-hidden rounded-2xl bg-gradient-to-br from-card to-card/50 border border-border p-8"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl" />
              <Users className="w-10 h-10 text-primary mb-4" />
              <h3 className="text-2xl font-semibold mb-2">Real-Time Multiplayer</h3>
              <p className="text-muted-foreground leading-relaxed">
                Challenge opponents in live 1v1 typing battles. Watch their progress
                in real-time as you race through the same text. Climb the ranked ladder
                with our Elo-based matchmaking system.
              </p>
            </motion.div>

            {/* Stats Card */}
            <motion.div
              className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-card to-card/50 border border-border p-8"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
            >
              <BarChart3 className="w-10 h-10 text-primary mb-4" />
              <h3 className="text-xl font-semibold mb-2">Analytics</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Track WPM, accuracy, and progress with detailed charts and insights.
              </p>
            </motion.div>

            {/* Test Modes Card */}
            <motion.div
              className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-card to-card/50 border border-border p-8"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
            >
              <Keyboard className="w-10 h-10 text-primary mb-4" />
              <h3 className="text-xl font-semibold mb-2">Test Modes</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                15s, 30s, 60s, or 120s. Pick your challenge.
              </p>
            </motion.div>

            {/* Leaderboards Card */}
            <motion.div
              className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-card to-card/50 border border-border p-8"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
            >
              <Trophy className="w-10 h-10 text-primary mb-4" />
              <h3 className="text-xl font-semibold mb-2">Leaderboards</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Compete globally on daily, weekly, and all-time rankings.
              </p>
            </motion.div>

            {/* Ranked Card */}
            <motion.div
              className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-card to-card/50 border border-border p-8"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.5 }}
            >
              <Zap className="w-10 h-10 text-primary mb-4" />
              <h3 className="text-xl font-semibold mb-2">Ranked System</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Bronze to Mach. Earn your rank through competitive matches.
              </p>
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* How It Works */}
      <section className="py-16 px-4 bg-muted/30">
        <motion.div
          className="max-w-4xl mx-auto"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: "-100px" }}
        >
          <h2 className="text-3xl font-bold text-center mb-12">How WPM is Calculated</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                label: "WPM",
                formula: "(correct ÷ 5) ÷ time",
                desc: "Your effective typing speed",
              },
              {
                label: "Raw WPM",
                formula: "(total ÷ 5) ÷ time",
                desc: "Pure speed, errors included",
              },
              {
                label: "Accuracy",
                formula: "(correct ÷ total) × 100",
                desc: "Percentage of correct keystrokes",
              },
            ].map((item, i) => (
              <motion.div
                key={item.label}
                className="text-center"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <div className="inline-block mb-4 px-4 py-2 rounded-lg bg-background border border-border">
                  <code className="text-sm font-mono text-primary">{item.formula}</code>
                </div>
                <h3 className="text-lg font-semibold">{item.label}</h3>
                <p className="text-sm text-muted-foreground mt-1">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Tech Stack */}
      <section className="py-16 px-4">
        <motion.div
          className="max-w-4xl mx-auto"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: "-100px" }}
        >
          <h2 className="text-3xl font-bold text-center mb-4">Built With</h2>
          <p className="text-center text-muted-foreground mb-12">
            Modern tools for a modern typing experience
          </p>

          <div className="flex flex-wrap justify-center gap-3">
            {[
              "Next.js",
              "TypeScript",
              "Tailwind CSS",
              "shadcn/ui",
              "Supabase",
              "PartyKit",
              "Chart.js",
              "Framer Motion",
            ].map((tech, i) => (
              <motion.span
                key={tech}
                className="px-4 py-2 rounded-full bg-muted text-sm font-medium hover:bg-primary hover:text-primary-foreground transition-colors cursor-default"
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                whileHover={{ scale: 1.05 }}
              >
                {tech}
              </motion.span>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 border-t border-border">
        <div className="max-w-4xl mx-auto text-center space-y-4">
          <p className="text-muted-foreground">
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
          <a
            href="https://github.com/Royster0/KeyRush"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <Github className="w-4 h-4" />
            View source on GitHub
          </a>
        </div>
      </footer>
    </div>
  );
}
