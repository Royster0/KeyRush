"use client";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions,
} from "chart.js";
import { Line } from "react-chartjs-2";
import { useThemeColors } from "@/hooks/useCustomTheme";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface ResultsChartProps {
  data: { time: number; wpm: number }[];
  personalBest?: number;
  duration: number;
}

const ResultsChart = ({ data, personalBest, duration }: ResultsChartProps) => {
  const colors = useThemeColors();

  const chartData = {
    labels: data.map((d) => d.time),
    datasets: [
      {
        label: "WPM",
        data: data.map((d) => d.wpm),
        borderColor: `hsl(${colors.primary})`,
        backgroundColor: `hsl(${colors.primary} / 0.5)`,
        tension: 0.3,
        pointRadius: 2,
        pointHoverRadius: 4,
      },
      ...(personalBest
        ? [
          {
            label: "Personal Best",
            data: Array(data.length).fill(personalBest),
            borderColor: `hsl(${colors.mutedForeground} / 0.3)`,
            borderDash: [5, 5],
            pointRadius: 0,
            pointHoverRadius: 0,
            fill: false,
          },
        ]
        : []),
    ],
  };

  const options: ChartOptions<"line"> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        labels: {
          color: `hsl(${colors.foreground} / 0.7)`,
          font: {
            family: "monospace",
          },
        },
      },
      tooltip: {
        mode: "index",
        intersect: false,
        backgroundColor: `hsl(${colors.popover} / 0.9)`,
        titleColor: `hsl(${colors.popoverForeground})`,
        bodyColor: `hsl(${colors.popoverForeground})`,
        borderColor: `hsl(${colors.border})`,
        borderWidth: 1,
        titleFont: {
          family: "monospace",
        },
        bodyFont: {
          family: "monospace",
        },
      },
    },
    scales: {
      x: {
        type: "linear",
        display: true,
        title: {
          display: true,
          text: "Time (s)",
          color: `hsl(${colors.mutedForeground})`,
          font: {
            family: "monospace",
          },
        },
        grid: {
          color: `hsl(${colors.border} / 0.5)`,
        },
        ticks: {
          color: `hsl(${colors.mutedForeground})`,
          font: {
            family: "monospace",
          },
          stepSize: duration <= 30 ? 5 : 10,
        },
        min: 0,
        max: duration,
      },
      y: {
        display: true,
        title: {
          display: true,
          text: "WPM",
          color: `hsl(${colors.mutedForeground})`,
          font: {
            family: "monospace",
          },
        },
        grid: {
          color: `hsl(${colors.border} / 0.5)`,
        },
        ticks: {
          color: `hsl(${colors.mutedForeground})`,
          font: {
            family: "monospace",
          },
        },
        beginAtZero: true,
      },
    },
    interaction: {
      mode: "nearest",
      axis: "x",
      intersect: false,
    },
    animation: {
      duration: 1000,
      easing: "easeOutQuart",
    },
  };

  return (
    <div className="w-full h-64 mt-8">
      <Line data={chartData} options={options} />
    </div>
  );
};

export default ResultsChart;
