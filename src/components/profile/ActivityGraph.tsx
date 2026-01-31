"use client";

import React, { useCallback, useEffect, useRef } from "react";
import { Activity, Calendar } from "lucide-react";
import { Chart, registerables } from "chart.js";
import { formatDate } from "@/lib/utils";
import { DEFAULT_THEME_COLORS, useThemeColors } from "@/hooks/useCustomTheme";
import { motion } from "motion/react";

Chart.register(...registerables);

let globalChartInstance: Chart | null = null;

interface ActivityGraphProps {
  testResults: Array<{
    id?: string;
    user_id: string;
    wpm: number;
    raw_wpm?: number;
    accuracy: number;
    duration: number;
    created_at?: string;
  }>;
}

const ActivityGraph: React.FC<ActivityGraphProps> = ({ testResults }) => {
  const chartRef = useRef<HTMLCanvasElement | null>(null);
  const chartInstanceRef = useRef<Chart | null>(null);
  const colors = useThemeColors();

  const buildChart = useCallback(() => {
    if (globalChartInstance) {
      globalChartInstance.destroy();
      globalChartInstance = null;
    }

    if (chartInstanceRef.current) {
      chartInstanceRef.current.destroy();
      chartInstanceRef.current = null;
    }

    const existingChart = Chart.getChart("activity-chart-canvas");
    if (existingChart) {
      existingChart.destroy();
    }

    if (!chartRef.current || testResults.length === 0) return;

    const canvasContext = chartRef.current.getContext("2d");
    if (canvasContext) {
      canvasContext.clearRect(
        0,
        0,
        chartRef.current.width,
        chartRef.current.height,
      );
    }

    const today = new Date();
    const twoMonthsAgo = new Date();
    twoMonthsAgo.setMonth(today.getMonth() - 2);

    const labels: string[] = [];
    const dataPoints: number[] = [];
    const daysMap = new Map<string, number>();

    const currentDate = new Date(twoMonthsAgo);
    while (currentDate <= today) {
      const dateStr = currentDate.toISOString().split("T")[0];
      labels.push(dateStr);
      daysMap.set(dateStr, 0);
      currentDate.setDate(currentDate.getDate() + 1);
    }

    testResults.forEach((result) => {
      if (result.created_at) {
        const resultDate = new Date(result.created_at);
        if (resultDate >= twoMonthsAgo && resultDate <= today) {
          const dateStr = resultDate.toISOString().split("T")[0];
          const currentCount = daysMap.get(dateStr) || 0;
          daysMap.set(dateStr, currentCount + 1);
        }
      }
    });

    labels.forEach((date) => {
      dataPoints.push(daysMap.get(date) || 0);
    });

    const displayLabels = labels.map((date) => {
      const d = new Date(date);
      return d.getDate() === 1 || d.getDate() === 15
        ? `${d.toLocaleString("default", { month: "short" })} ${d.getDate()}`
        : "";
    });

    const ctx = chartRef.current.getContext("2d");
    if (ctx) {
      const rootStyles = getComputedStyle(document.documentElement);
      const chartColor = rootStyles.getPropertyValue("--chart-1").trim();
      const baseColor =
        colors.primary !== DEFAULT_THEME_COLORS.primary
          ? colors.primary
          : chartColor || colors.primary;
      const barColor = `hsl(${baseColor} / 0.55)`;

      const newChartInstance = new Chart(ctx, {
        type: "bar",
        data: {
          labels: displayLabels,
          datasets: [
            {
              label: "Tests",
              data: dataPoints,
              backgroundColor: barColor,
              borderColor: barColor,
              borderWidth: 0,
              borderRadius: 4,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: false,
            },
            tooltip: {
              backgroundColor: "rgba(0, 0, 0, 0.8)",
              padding: 12,
              cornerRadius: 8,
              titleFont: { size: 12 },
              bodyFont: { size: 14, weight: "bold" },
              displayColors: false,
              callbacks: {
                title: (context) => {
                  const index = context[0].dataIndex;
                  const date = new Date(labels[index]);
                  return formatDate(date);
                },
                label: (context) => `${context.raw} tests`,
              },
            },
          },
          scales: {
            x: {
              ticks: {
                autoSkip: false,
                maxRotation: 0,
                font: { size: 10 },
                color: `hsl(${colors.mutedForeground})`,
              },
              grid: { display: false },
            },
            y: {
              beginAtZero: true,
              ticks: {
                stepSize: 1,
                precision: 0,
                color: `hsl(${colors.mutedForeground})`,
              },
              border: { display: false },
              grid: { color: `hsl(${colors.border})` },
            },
          },
        },
      });

      chartInstanceRef.current = newChartInstance;
      globalChartInstance = newChartInstance;
    }
  }, [testResults, colors]);

  useEffect(() => {
    buildChart();
    return () => {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
        chartInstanceRef.current = null;
      }
      if (globalChartInstance) {
        globalChartInstance.destroy();
        globalChartInstance = null;
      }
      const existingChart = Chart.getChart("activity-chart-canvas");
      if (existingChart) {
        existingChart.destroy();
      }
    };
  }, [buildChart]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        if (chartInstanceRef.current) {
          chartInstanceRef.current.destroy();
          chartInstanceRef.current = null;
        }
        if (globalChartInstance) {
          globalChartInstance.destroy();
          globalChartInstance = null;
        }
      } else {
        buildChart();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [buildChart]);

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: 0.35 }}
      className="relative border-b border-primary/30 py-10"
    >
      <div className="relative z-10 flex flex-wrap items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10">
            <Activity className="h-4 w-4 text-primary" />
          </div>
          <h3 className="text-xl font-mono uppercase tracking-[0.15em]">
            Activity
          </h3>
        </div>
        <span className="text-xs text-muted-foreground font-mono">
          Last 60 days
        </span>
      </div>

      <div className="relative z-10 h-[280px] rounded-2xl border border-border/40 bg-muted/20 p-4">
        {testResults.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="w-12 h-12 rounded-full border border-border/60 flex items-center justify-center mb-4">
              <Calendar className="h-6 w-6 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground">No activity data yet</p>
            <p className="text-sm text-muted-foreground/60 mt-1">
              Complete some typing tests to see your activity
            </p>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="w-full h-full"
          >
            <canvas id="activity-chart-canvas" ref={chartRef} />
          </motion.div>
        )}
      </div>
    </motion.section>
  );
};

export default ActivityGraph;
