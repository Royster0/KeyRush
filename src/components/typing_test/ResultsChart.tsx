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
import { useTheme } from "next-themes";

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
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const chartData = {
    labels: data.map((d) => d.time),
    datasets: [
      {
        label: "WPM",
        data: data.map((d) => d.wpm),
        borderColor: isDark ? "rgb(250, 204, 21)" : "rgb(234, 179, 8)", // Yellow-400/500
        backgroundColor: isDark
          ? "rgba(250, 204, 21, 0.5)"
          : "rgba(234, 179, 8, 0.5)",
        tension: 0.3,
        pointRadius: 2,
        pointHoverRadius: 4,
      },
      ...(personalBest
        ? [
          {
            label: "Personal Best",
            data: Array(data.length).fill(personalBest),
            borderColor: isDark
              ? "rgba(255, 255, 255, 0.3)"
              : "rgba(0, 0, 0, 0.3)",
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
          color: isDark ? "rgba(255, 255, 255, 0.7)" : "rgba(0, 0, 0, 0.7)",
          font: {
            family: "monospace",
          },
        },
      },
      tooltip: {
        mode: "index",
        intersect: false,
        backgroundColor: isDark ? "rgba(0, 0, 0, 0.8)" : "rgba(255, 255, 255, 0.8)",
        titleColor: isDark ? "#fff" : "#000",
        bodyColor: isDark ? "#fff" : "#000",
        borderColor: isDark ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)",
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
          color: isDark ? "rgba(255, 255, 255, 0.5)" : "rgba(0, 0, 0, 0.5)",
          font: {
            family: "monospace",
          },
        },
        grid: {
          color: isDark ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)",
        },
        ticks: {
          color: isDark ? "rgba(255, 255, 255, 0.5)" : "rgba(0, 0, 0, 0.5)",
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
          color: isDark ? "rgba(255, 255, 255, 0.5)" : "rgba(0, 0, 0, 0.5)",
          font: {
            family: "monospace",
          },
        },
        grid: {
          color: isDark ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)",
        },
        ticks: {
          color: isDark ? "rgba(255, 255, 255, 0.5)" : "rgba(0, 0, 0, 0.5)",
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
