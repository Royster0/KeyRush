"use client";

import React, { useEffect, useRef, useState } from "react";
import { TrendingUp, BarChart3 } from "lucide-react";
import { Chart, registerables } from "chart.js";
import { TestResults } from "@/types/game.types";
import { formatDate } from "@/lib/utils";
import { DEFAULT_THEME_COLORS, useThemeColors } from "@/hooks/useCustomTheme";
import { motion } from "motion/react";

Chart.register(...registerables);

let globalWpmChartInstance: Chart | null = null;

interface WpmChartProps {
  testResults: TestResults[];
}

const TIME_CATEGORIES = [
  { value: "all", label: "All" },
  { value: "5", label: "5s" },
  { value: "15", label: "15s" },
  { value: "30", label: "30s" },
  { value: "60", label: "60s" },
  { value: "120", label: "120s" },
];

const TIME_PERIODS = [
  { value: "all-time", label: "All Time" },
  { value: "last-week", label: "Week" },
  { value: "last-month", label: "Month" },
  { value: "last-three-months", label: "3 Months" },
  { value: "last-year", label: "Year" },
];

const WpmChart: React.FC<WpmChartProps> = ({ testResults }) => {
  const chartRef = useRef<HTMLCanvasElement | null>(null);
  const chartInstanceRef = useRef<Chart | null>(null);
  const [timeCategory, setTimeCategory] = useState<string>("all");
  const [timePeriod, setTimePeriod] = useState<string>("all-time");
  const colors = useThemeColors();

  useEffect(() => {
    if (globalWpmChartInstance) {
      globalWpmChartInstance.destroy();
      globalWpmChartInstance = null;
    }

    if (chartInstanceRef.current) {
      chartInstanceRef.current.destroy();
      chartInstanceRef.current = null;
    }

    const existingChart = Chart.getChart("wpm-chart-canvas");
    if (existingChart) {
      existingChart.destroy();
    }

    if (!chartRef.current || testResults.length === 0) return;

    const filteredResults = testResults
      .filter((result) => {
        if (timeCategory === "all") return true;
        return result.duration === parseInt(timeCategory);
      })
      .filter((result) => {
        if (timePeriod === "all-time") return true;
        const resultDate = new Date(result.created_at!);
        const now = new Date();
        if (timePeriod === "last-week") {
          const lastWeek = new Date();
          lastWeek.setDate(now.getDate() - 7);
          return resultDate >= lastWeek;
        }
        if (timePeriod === "last-month") {
          const lastMonth = new Date();
          lastMonth.setMonth(now.getMonth() - 1);
          return resultDate >= lastMonth;
        }
        if (timePeriod === "last-three-months") {
          const lastThreeMonths = new Date();
          lastThreeMonths.setMonth(now.getMonth() - 3);
          return resultDate >= lastThreeMonths;
        }
        if (timePeriod === "last-year") {
          const lastYear = new Date();
          lastYear.setFullYear(now.getFullYear() - 1);
          return resultDate >= lastYear;
        }
        return true;
      });

    const labels = filteredResults.map((result) =>
      formatDate(new Date(result.created_at!)),
    );
    const data = filteredResults.map((result) => result.wpm);

    const ctx = chartRef.current.getContext("2d");
    if (ctx) {
      const rootStyles = getComputedStyle(document.documentElement);
      const chartColor = rootStyles.getPropertyValue("--chart-2").trim();
      const baseColor =
        colors.primary !== DEFAULT_THEME_COLORS.primary
          ? colors.primary
          : chartColor || colors.primary;
      const lineColor = `hsl(${baseColor} / 0.6)`;

      const newChartInstance = new Chart(ctx, {
        type: "line",
        data: {
          labels,
          datasets: [
            {
              label: "WPM",
              data,
              borderColor: lineColor,
              borderWidth: 2,
              pointBackgroundColor: lineColor,
              pointRadius: 3,
              pointHoverRadius: 6,
              tension: 0.3,
              fill: false,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          interaction: {
            intersect: false,
            mode: "index",
          },
          scales: {
            x: {
              ticks: {
                autoSkip: true,
                maxTicksLimit: 8,
                color: `hsl(${colors.mutedForeground})`,
                font: { size: 11 },
              },
              grid: { display: false },
            },
            y: {
              beginAtZero: true,
              ticks: {
                color: `hsl(${colors.mutedForeground})`,
                font: { size: 11 },
              },
              border: { display: false },
              grid: { color: `hsl(${colors.border})` },
            },
          },
          plugins: {
            legend: { display: false },
            tooltip: {
              backgroundColor: "rgba(0, 0, 0, 0.8)",
              padding: 12,
              cornerRadius: 8,
              titleFont: { size: 12 },
              bodyFont: { size: 14, weight: "bold" },
              displayColors: false,
              callbacks: {
                label: (context) => `${Math.round(context.raw as number)} WPM`,
              },
            },
          },
        },
      });
      chartInstanceRef.current = newChartInstance;
      globalWpmChartInstance = newChartInstance;
    }

    return () => {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
        chartInstanceRef.current = null;
      }
      if (globalWpmChartInstance) {
        globalWpmChartInstance.destroy();
        globalWpmChartInstance = null;
      }
    };
  }, [testResults, timeCategory, timePeriod, colors]);

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: 0.45 }}
      className="relative py-10"
    >
      {/* Background accent */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-16 right-[-5%] h-52 w-52 rounded-full bg-primary/8 blur-3xl" />
      </div>

      <div className="relative z-10 flex flex-col gap-4 mb-6">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10">
            <TrendingUp className="h-4 w-4 text-primary" />
          </div>
          <h3 className="text-xl font-mono uppercase tracking-[0.15em]">
            WPM History
          </h3>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2">
          {/* Time Category */}
          <div className="inline-flex items-center rounded-full border border-border/60 bg-background/70 p-1">
            {TIME_CATEGORIES.map((cat) => (
              <button
                key={cat.value}
                onClick={() => setTimeCategory(cat.value)}
                className={`px-3 py-1 text-[11px] font-mono uppercase tracking-[0.2em] rounded-full transition-colors ${
                  timeCategory === cat.value
                    ? "bg-primary/20 text-primary"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Time Period */}
          <div className="inline-flex items-center rounded-full border border-border/60 bg-background/70 p-1">
            {TIME_PERIODS.map((period) => (
              <button
                key={period.value}
                onClick={() => setTimePeriod(period.value)}
                className={`px-3 py-1 text-[11px] font-mono uppercase tracking-[0.2em] rounded-full transition-colors ${
                  timePeriod === period.value
                    ? "bg-primary/20 text-primary"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {period.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="relative z-10 h-[320px] rounded-2xl border border-border/40 bg-muted/20 p-4">
        {testResults.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="w-12 h-12 rounded-full border border-border/60 flex items-center justify-center mb-4">
              <BarChart3 className="h-6 w-6 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground">No WPM data yet</p>
            <p className="text-sm text-muted-foreground/60 mt-1">
              Complete some typing tests to see your progress
            </p>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="w-full h-full"
          >
            <canvas id="wpm-chart-canvas" ref={chartRef} />
          </motion.div>
        )}
      </div>
    </motion.section>
  );
};

export default WpmChart;
