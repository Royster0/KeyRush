"use client";

import React, { useEffect, useRef } from "react";
import { Activity, Calendar } from "lucide-react";
import { Chart, registerables } from "chart.js";
import { formatDate } from "@/lib/utils";
import { useThemeColors } from "@/hooks/useCustomTheme";
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

  useEffect(() => {
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
      canvasContext.clearRect(0, 0, chartRef.current.width, chartRef.current.height);
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
      const primaryColor = `hsl(${colors.primary})`;

      const newChartInstance = new Chart(ctx, {
        type: "bar",
        data: {
          labels: displayLabels,
          datasets: [
            {
              label: "Tests",
              data: dataPoints,
              backgroundColor: primaryColor,
              borderColor: primaryColor,
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

    return () => {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
        chartInstanceRef.current = null;
      }
      if (globalChartInstance) {
        globalChartInstance.destroy();
        globalChartInstance = null;
      }
    };
  }, [testResults, colors]);

  useEffect(() => {
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
  }, []);

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
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.45 }}
      className="h-full rounded-2xl bg-muted/30 border border-border/30 p-6"
    >
      <div className="flex items-center gap-2 mb-5">
        <div className="p-2 rounded-xl bg-primary/10">
          <Activity className="h-5 w-5 text-primary" />
        </div>
        <h3 className="text-lg font-semibold">Activity</h3>
        <span className="text-xs text-muted-foreground ml-auto">Last 2 months</span>
      </div>

      <div className="h-[320px]">
        {testResults.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="w-12 h-12 rounded-full bg-muted/50 flex items-center justify-center mb-4">
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
            transition={{ duration: 0.5, delay: 0.6 }}
            className="w-full h-full"
          >
            <canvas id="activity-chart-canvas" ref={chartRef} />
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

export default ActivityGraph;
