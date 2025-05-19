import React from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  BarElement,
  Tooltip,
  Legend,
  LinearScale,
  CategoryScale,
} from "chart.js";

ChartJS.register(BarElement, Tooltip, Legend, LinearScale, CategoryScale);

// Helper to extract level safely from a single group string
const extractGroupLevel = (groups, levelIndex) => {
  if (!groups) return null;

  const groupList = Array.isArray(groups) ? groups : [groups];
  for (const group of groupList) {
    if (typeof group !== "string") continue;
    const match = group.match(/\/ooda\/tunisia\/([^/]+)\/([^/]+)\/([^/]+)\//);
    if (match) {
      return match[levelIndex]; // Return the first match found
    }
  }
  return null;
};

const AlarmsGroupedChart = ({ alarms, groupLevel = "delegation" }) => {
  const levelIndex = groupLevel === "governorate" ? 2 : 3;

  const counts = alarms.reduce((acc, alarm) => {
    const key = extractGroupLevel(alarm.groups, levelIndex);
    if (key) {
      acc[key] = (acc[key] || 0) + 1;
    }
    return acc;
  }, {});

  const labels = Object.keys(counts);
  const dataValues = Object.values(counts);

  const data = {
    labels,
    datasets: [
      {
        label:
          groupLevel === "governorate"
            ? "عدد الإنذارات حسب الولاية"
            : " عدد الأحداث حسب المناطق ",
        data: dataValues,
        backgroundColor: "rgba(88, 86, 214, 0.7)",
        borderRadius: 6,
        barThickness: 20,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: { color: "#EEEEEE" },
      },
      tooltip: {
        backgroundColor: "#393E46",
        titleColor: "#00ADB5",
        bodyColor: "#EEEEEE",
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: groupLevel === "governorate" ? "الولاية" : "المعتمدية",
          color: "#EEEEEE",
        },
        ticks: { color: "#CCCCCC" },
      },
      y: {
        title: {
          display: true,
          text: "عدد الإنذارات",
          color: "#EEEEEE",
        },
        beginAtZero: true,
        ticks: { color: "#CCCCCC" },
      },
    },
  };

  return (
    <div className="bg-[#393E46]/30 backdrop-blur-sm rounded-xl shadow-lg p-4 border border-[#00ADB5]/20 h-96">
      <Bar data={data} options={options} />
    </div>
  );
};

export default AlarmsGroupedChart;
