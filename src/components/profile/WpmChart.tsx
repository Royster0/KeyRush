"use client";

import React, { useEffect, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Chart, registerables } from "chart.js";
import { TestResults } from "@/types/game.types";
import { formatDate } from "@/lib/utils";

Chart.register(...registerables);

let globalWpmChartInstance: Chart | null = null;

interface WpmChartProps {
  testResults: TestResults[];
}

import { useThemeColors } from "@/hooks/useCustomTheme";

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
      // Create a semi-transparent version for background
      // Since we have HSL string "h s% l%", we can just wrap it in hsl()
      // For opacity, we need hsla or just use the same color for line and fill

      const newChartInstance = new Chart(ctx, {
        type: "line",
        data: {
          labels,
          datasets: [
            {
              label: "WPM",
              data,
              backgroundColor: primaryColor,
              borderColor: primaryColor,
              borderWidth: 2,
              pointBackgroundColor: primaryColor,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            x: {
              ticks: {
                autoSkip: true,
                maxTicksLimit: 10,
                color: `hsl(${colors.mutedForeground})`,
              },
              grid: {
                color: `hsl(${colors.border})`,
              }
            },
            y: {
              beginAtZero: true,
              ticks: {
                color: `hsl(${colors.mutedForeground})`,
              },
              grid: {
                color: `hsl(${colors.border})`,
              }
            },
          },
          plugins: {
            legend: {
              labels: {
                color: `hsl(${colors.foreground})`
              }
            }
          }
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
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="text-xl">WPM Over Time</CardTitle>
        <div className="flex gap-4">
          <Select onValueChange={setTimeCategory} defaultValue="all">
            <SelectTrigger>
              <SelectValue placeholder="Time Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Time Categories</SelectItem>
              <SelectItem value="5">5 seconds</SelectItem>
              <SelectItem value="15">15 seconds</SelectItem>
              <SelectItem value="30">30 seconds</SelectItem>
              <SelectItem value="60">60 seconds</SelectItem>
              <SelectItem value="120">120 seconds</SelectItem>
            </SelectContent>
          </Select>
          <Select onValueChange={setTimePeriod} defaultValue="all-time">
            <SelectTrigger>
              <SelectValue placeholder="Time Period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all-time">All Time</SelectItem>
              <SelectItem value="last-week">Last Week</SelectItem>
              <SelectItem value="last-month">Last Month</SelectItem>
              <SelectItem value="last-three-months">
                Last Three Months
              </SelectItem>
              <SelectItem value="last-year">Last Year</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent className="h-[380px]">
        {testResults.length === 0 ? (
          <p className="text-center text-muted-foreground py-6">
            No WPM data yet. Complete some typing tests to see your WPM over
            time!
          </p>
        ) : (
          <div className="w-full h-full">
            <canvas id="wpm-chart-canvas" ref={chartRef} />
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default WpmChart;
