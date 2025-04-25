import React from "react";
import { Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";

// Register ChartJS components
ChartJS.register(ArcElement, Tooltip, Legend);

const CertaintyDonutChart = ({ alarms }) => {
  // Map Arabic certainty values to English
  const normalizeCertainty = (certainty) => {
    const map = {
      // "مجهول": "Unknown",
      // 'مَجْهُول' :"Unknown",
      // "مُجْهُول": "Unknown",
      // "مبلّغ": "Reported",
      // "شاهد": "Likely",
      // "محتمل": "Likely",
      "مجهول": "مَجْهُول",
      'Unknown' :"مَجْهُول",
      "مُجْهُول": "مَجْهُول",
      "Reported": "مبلّغ",
      "Likely": "محتمل",
      "شاهد": "محتمل",
    };
    return map[certainty] || certainty || "Unknown";
  };

  // Count alarms by normalized certainty level
  const processData = () => {
    if (!alarms || alarms.length === 0) return {};
    return alarms.reduce((acc, alarm) => {
      const normalized = normalizeCertainty(alarm.certainty);
      acc[normalized] = (acc[normalized] || 0) + 1;
      return acc;
    }, {});
  };

  const certaintyCounts = processData();
  const labels = Object.keys(certaintyCounts);
  const values = Object.values(certaintyCounts);
  const total = values.reduce((sum, value) => sum + value, 0);

  // Define colors for normalized certainty levels
  const colors = {
    مَجْهُول: "#1E3A8A",   // Dark Blue
    محتمل: "#FFA500",    // Indigo
    مبلّغ: "#008000",  // Purple
  };

  const backgroundColors = labels.map((label) => colors[label] || "#64748B");

  const data = {
    labels,
    datasets: [
      {
        data: values,
        backgroundColor: backgroundColors,
        borderColor: "#1F2937",
        borderWidth: 2,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: "70%", // Makes it a donut chart
    plugins: {
      legend: {
        position: "right",
        labels: {
          color: "#EEEEEE",
          font: {
            size: 12,
          },
          padding: 20,
        },
      },
      title: {
        display: true,
        text: "Certainty Distribution",
        color: "#EEEEEE",
        font: {
          size: 16,
        },
        padding: {
          top: 10,
          bottom: 20
        }
      },
      tooltip: {
        backgroundColor: "#1E293B",
        titleColor: "#93C5FD",
        bodyColor: "#E5E7EB",
        borderColor: "#3B82F6",
        borderWidth: 1,
        callbacks: {
          label: function (context) {
            const label = context.label || "";
            const value = context.raw || 0;
            const percentage = ((value / total) * 100).toFixed(1);
            return `${label}: ${value} (${percentage}%)`;
          },
        },
      },
    },
  };

  return (
    <div className="relative bg-[#1E293B]/30 backdrop-blur-sm rounded-xl shadow-lg p-4 border border-[#3B82F6]/20 h-80">
      <div className="relative h-full w-full">
        <Doughnut 
          data={data} 
          options={options}
        />
        {/* Centered Total Alarms Count */}
        <div className="absolute" style={{
          top: '50%',
          left: 'calc(50% - 60px)',
          transform: 'translate(-50%, -50%)',
          textAlign: 'center',
          pointerEvents: 'none',
          width: '120px'
        }}>
          <span className="text-white text-2xl font-bold block">{total}</span>
          <span className="text-gray-400 text-sm">Total Alarms</span>
        </div>
      </div>
    </div>
  );
};

export default CertaintyDonutChart;
