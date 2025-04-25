import React from 'react';
import { Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js';

// Register ChartJS components
ChartJS.register(
  ArcElement,
  Tooltip,
  Legend
);

const AlarmsStatusPieChart = ({ alarms }) => {
  // Process data to count opened and closed alarms
  const processData = () => {
    if (!alarms || alarms.length === 0) return { opened: 0, closed: 0 };

    const statusCounts = alarms.reduce((acc, alarm) => {
      if (alarm.status === 'Opened') {
        acc.opened++;
      } else if (alarm.status === 'Closed') {
        acc.closed++;
      }
      return acc;
    }, { opened: 0, closed: 0 });

    return statusCounts;
  };

  const { opened, closed } = processData();
  const total = opened + closed;

  const data = {
    labels: ['Opened Alarms', 'Closed Alarms'],
    datasets: [
      {
        data: [opened, closed],
        backgroundColor: [
          'rgba(100, 149, 237, 0.8)',  // Cornflower blue
          'rgba(138, 43, 226, 0.8)',    // Blue violet
        ],
        borderColor: [
          'rgba(70, 130, 180, 1)',      // Steel blue
          'rgba(75, 0, 130, 1)',         // Indigo
        ],
        borderWidth: 2,
        hoverBackgroundColor: [
          'rgba(65, 105, 225, 1)',      // Royal blue
          'rgba(147, 112, 219, 1)',     // Medium purple
        ],
        hoverBorderColor: '#FFFFFF',
        hoverBorderWidth: 3,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right',
        labels: {
          color: '#EEEEEE',
          font: {
            size: 12,
          },
        },
      },
      title: {
        display: true,
        text: 'Alarms by Status',
        color: '#D8BFD8',  // Thistle color
        font: {
          size: 16,
        },
      },
      tooltip: {
        backgroundColor: '#1E1A2F',  // Dark purple
        titleColor: '#9370DB',       // Medium purple
        bodyColor: '#E6E6FA',         // Lavender
        borderColor: '#9370DB',
        borderWidth: 1,
        callbacks: {
          label: function(context) {
            const label = context.label || '';
            const value = context.raw || 0;
            const percentage = Math.round((value / total) * 100);
            return `${label}: ${value} (${percentage}%)`;
          }
        }
      },
      // Custom Plugin to display value and percentage in the center
      beforeDraw: function(chart) {
        const ctx = chart.ctx;
        const width = chart.width;
        const height = chart.height;
        const data = chart.data.datasets[0].data;
        const total = data.reduce((acc, val) => acc + val, 0);
        const opened = data[0];
        const closed = data[1];
        const openedPercentage = Math.round((opened / total) * 100);
        const closedPercentage = Math.round((closed / total) * 100);

        // Center Text
        const text = `${opened} (${openedPercentage}%)\n${closed} (${closedPercentage}%)`;
        const fontSize = Math.min(width / 8, 20);  // Dynamic font size based on chart width

        // Draw the center text with better positioning
        ctx.save();
        ctx.font = `bold ${fontSize}px Arial`;
        ctx.fillStyle = '#E6E6FA';  // Lavender text
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        // Draw the combined text in the middle
        ctx.fillText(text, width / 2, height / 2);
        ctx.restore();
      }
    },
  };

  return (
    <div className="bg-[#0F0524]/80 backdrop-blur-sm rounded-xl shadow-lg p-4 border border-[#9370DB]/30 h-80">
      <div className="h-full w-full">
        <Pie data={data} options={options} />
      </div>
    </div>
  );
};

export default AlarmsStatusPieChart;