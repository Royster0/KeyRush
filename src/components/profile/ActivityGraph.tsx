/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import React, { useEffect, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Chart, registerables } from "chart.js";
import { formatDate } from "@/lib/utils";

// Register all Chart.js components
Chart.register(...registerables);

// Global static chart instance to track if a chart exists
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
  const [chartInstance, setChartInstance] = useState<Chart | null>(null);

  // Process data for the activity chart
  useEffect(() => {
    // Clean up any existing chart instances (from global or local state)
    if (globalChartInstance) {
      globalChartInstance.destroy();
      globalChartInstance = null;
    }

    if (chartInstance) {
      chartInstance.destroy();
      setChartInstance(null);
    }

    // Also attempt to destroy any charts by ID in case they're orphaned
    const existingChart = Chart.getChart("activity-chart-canvas");
    if (existingChart) {
      existingChart.destroy();
    }

    // Return early if no canvas reference or data
    if (!chartRef.current || testResults.length === 0) return;

    // Ensure the canvas is clean before creating a new chart
    const canvasContext = chartRef.current.getContext("2d");
    if (canvasContext) {
      canvasContext.clearRect(
        0,
        0,
        chartRef.current.width,
        chartRef.current.height
      );
    }

    // Get dates for the last 2 months
    const today = new Date();
    const twoMonthsAgo = new Date();
    twoMonthsAgo.setMonth(today.getMonth() - 2);

    // Generate daily labels for the last 2 months
    const labels: string[] = [];
    const dataPoints: number[] = [];
    const daysMap = new Map<string, number>();

    // Create array of dates
    const currentDate = new Date(twoMonthsAgo);
    while (currentDate <= today) {
      const dateStr = currentDate.toISOString().split("T")[0];
      labels.push(dateStr);
      daysMap.set(dateStr, 0);

      currentDate.setDate(currentDate.getDate() + 1);
    }

    // Count tests per day
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

    // Convert map to array for chart data
    labels.forEach((date) => {
      dataPoints.push(daysMap.get(date) || 0);
    });

    // Format dates for display
    const displayLabels = labels.map((date) => {
      const d = new Date(date);
      return d.getDate() === 1 || d.getDate() === 15
        ? `${d.toLocaleString("default", { month: "short" })} ${d.getDate()}`
        : "";
    });

    // Create the chart with a unique ID
    const ctx = chartRef.current.getContext("2d");
    if (ctx) {
      // Create a new chart instance with a proper ID
      const newChartInstance = new Chart(ctx, {
        type: "bar",
        data: {
          labels: displayLabels,
          datasets: [
            {
              label: "Tests Completed",
              data: dataPoints,
              backgroundColor: "rgba(99, 102, 241, 0.5)",
              borderColor: "rgba(99, 102, 241, 1)",
              borderWidth: 1,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: true,
              position: "top",
            },
            tooltip: {
              callbacks: {
                title: (context) => {
                  const index = context[0].dataIndex;
                  const date = new Date(labels[index]);
                  return formatDate(date);
                },
              },
            },
          },
          scales: {
            x: {
              ticks: {
                autoSkip: false,
                maxRotation: 0,
                font: {
                  size: 10,
                },
              },
              grid: {
                display: false,
              },
            },
            y: {
              beginAtZero: true,
              ticks: {
                stepSize: 1,
                precision: 0,
              },
            },
          },
        },
      });

      // Store chart instance in both state and global variable
      setChartInstance(newChartInstance);
      globalChartInstance = newChartInstance;
    }

    // Return cleanup function
    return () => {
      if (chartInstance) {
        chartInstance.destroy();
        setChartInstance(null);
      }

      if (globalChartInstance) {
        globalChartInstance.destroy();
        globalChartInstance = null;
      }

      // Also clean up by canvas ID
      const existingChart = Chart.getChart("activity-chart-canvas");
      if (existingChart) {
        existingChart.destroy();
      }
    };
  }, [testResults]);

  // Cleanup on component unmount
  useEffect(() => {
    return () => {
      if (chartInstance) {
        chartInstance.destroy();
        setChartInstance(null);
      }

      if (globalChartInstance) {
        globalChartInstance.destroy();
        globalChartInstance = null;
      }

      // Also clean up by canvas ID
      const existingChart = Chart.getChart("activity-chart-canvas");
      if (existingChart) {
        existingChart.destroy();
      }
    };
  }, []);

  // Extra safety: cleanup on page visibility change
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        if (chartInstance) {
          chartInstance.destroy();
          setChartInstance(null);
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
  }, [chartInstance]);

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="text-xl">Your Activity</CardTitle>
      </CardHeader>
      <CardContent className="h-[380px]">
        {testResults.length === 0 ? (
          <p className="text-center text-muted-foreground py-6">
            No activity data yet. Complete some typing tests to see your
            activity graph!
          </p>
        ) : (
          <div className="w-full h-full">
            <canvas id="activity-chart-canvas" ref={chartRef} />
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ActivityGraph;
