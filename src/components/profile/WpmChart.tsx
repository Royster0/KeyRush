"use client";

import React, { useEffect, useRef, useState } from "react";
import { TrendingUp, BarChart3 } from "lucide-react";
import { Chart, registerables } from "chart.js";
import { TestResults } from "@/types/game.types";
import { formatDate } from "@/lib/utils";
import { useThemeColors } from "@/hooks/useCustomTheme";
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
      formatDate(new Date(result.created_at!))
    );
    const data = filteredResults.map((result) => result.wpm);

    const ctx = chartRef.current.getContext("2d");
    if (ctx) {
      const primaryColor = `hsl(${colors.primary})`;

      const newChartInstance = new Chart(ctx, {
        type: "line",
        data: {
          labels,
          datasets: [
            {
              label: "WPM",
              data,
              backgroundColor: `hsla(${colors.primary}, 0.1)`,
              borderColor: primaryColor,
              borderWidth: 2,
              pointBackgroundColor: primaryColor,
              pointRadius: 3,
              pointHoverRadius: 6,
              tension: 0.3,
              fill: true,
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
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.5 }}
      className="rounded-2xl bg-muted/30 border border-border/30 p-6"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-primary/10">
            <TrendingUp className="h-5 w-5 text-primary" />
          </div>
          <h3 className="text-lg font-semibold">WPM History</h3>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2">
          {/* Time Category */}
          <div className="inline-flex items-center rounded-lg bg-background/60 border border-border/50 p-1">
            {TIME_CATEGORIES.map((cat) => (
              <button
                key={cat.value}
                onClick={() => setTimeCategory(cat.value)}
                className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                  timeCategory === cat.value
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Time Period */}
          <div className="inline-flex items-center rounded-lg bg-background/60 border border-border/50 p-1">
            {TIME_PERIODS.map((period) => (
              <button
                key={period.value}
                onClick={() => setTimePeriod(period.value)}
                className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                  timePeriod === period.value
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {period.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="h-[350px]">
        {testResults.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="w-12 h-12 rounded-full bg-muted/50 flex items-center justify-center mb-4">
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
            transition={{ duration: 0.5, delay: 0.65 }}
            className="w-full h-full"
          >
            <canvas id="wpm-chart-canvas" ref={chartRef} />
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

export default WpmChart;
