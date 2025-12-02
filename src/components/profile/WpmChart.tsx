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
              pointRadius: 3,
              pointHoverRadius: 5,
              tension: 0.3, // Add some curve to the line
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
                display: false,
              }
            },
            y: {
              beginAtZero: true,
              ticks: {
                color: `hsl(${colors.mutedForeground})`,
              },
              border: {
                display: false,
                dash: [4, 4],
              },
              grid: {
                color: `hsl(${colors.border})`,
              }
            },
          },
          plugins: {
            legend: {
              display: false, // Hide legend for cleaner look
            },
            tooltip: {
              backgroundColor: 'rgba(0, 0, 0, 0.8)',
              padding: 12,
              cornerRadius: 8,
              titleFont: {
                size: 13,
              },
              bodyFont: {
                size: 14,
                weight: 'bold',
              },
              displayColors: false,
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
    <Card className="h-full border-none bg-muted/40 shadow-none">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-xl font-bold">WPM History</CardTitle>
        <div className="flex gap-2">
          <Select onValueChange={setTimeCategory} defaultValue="all">
            <SelectTrigger className="w-[140px] bg-background border-none shadow-sm h-8 text-xs">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Modes</SelectItem>
              <SelectItem value="5">5s</SelectItem>
              <SelectItem value="15">15s</SelectItem>
              <SelectItem value="30">30s</SelectItem>
              <SelectItem value="60">60s</SelectItem>
              <SelectItem value="120">120s</SelectItem>
            </SelectContent>
          </Select>
          <Select onValueChange={setTimePeriod} defaultValue="all-time">
            <SelectTrigger className="w-[140px] bg-background border-none shadow-sm h-8 text-xs">
              <SelectValue placeholder="Period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all-time">All Time</SelectItem>
              <SelectItem value="last-week">Last Week</SelectItem>
              <SelectItem value="last-month">Last Month</SelectItem>
              <SelectItem value="last-three-months">
                3 Months
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
