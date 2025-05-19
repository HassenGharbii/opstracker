import React, { useState, useMemo } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const AlarmTrendsChart = ({ alarms }) => {
  const [viewMode, setViewMode] = useState('Monthly');

  const processData = () => {
    const counts = {};
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
                        "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

    alarms?.forEach(alarm => {
      const date = new Date(alarm.creationDate);
      if (isNaN(date)) return;

      let key = '', label = '', timestamp = 0;

      const year = date.getFullYear();
      const month = date.getMonth();
      const day = date.getDate();

      if (viewMode === 'Yearly') {
        key = `${year}`;
        label = `${year}`;
        timestamp = new Date(year, 0).getTime();
      } else if (viewMode === 'Monthly') {
        key = `${year}-${month}`;
        label = `${monthNames[month]} ${year}`;
        timestamp = new Date(year, month).getTime();
      } else if (viewMode === 'Daily') {
        key = `${year}-${month}-${day}`;
        label = `${day} ${monthNames[month]}`;
        timestamp = new Date(year, month, day).getTime();
      }

      if (!counts[key]) {
        counts[key] = { count: 0, label, timestamp };
      }
      counts[key].count++;
    });

    const sorted = Object.values(counts).sort((a, b) => a.timestamp - b.timestamp);

    // Pad missing years for Yearly view
    if (viewMode === 'Yearly' && sorted.length > 1) {
      const start = parseInt(sorted[0].label);
      const end = parseInt(sorted[sorted.length - 1].label);
      const padded = [];
      for (let year = start; year <= end; year++) {
        const found = sorted.find(s => parseInt(s.label) === year);
        padded.push(found || { label: `${year}`, count: 0, timestamp: new Date(year, 0).getTime() });
      }
      return padded;
    }

    return sorted;
  };

  const chartData = useMemo(processData, [viewMode, alarms]);

  const data = {
    labels: chartData.map(item => item.label),
    datasets: [
      {
        label: 'Alarms',
        data: chartData.map(item => item.count),
        borderColor: '#3B82F6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.3,
        fill: true,
        pointRadius: 3,
        pointHoverRadius: 5,
        pointBackgroundColor: '#ffffff',
        pointBorderColor: '#3B82F6',
        pointBorderWidth: 1.5
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      title: {
        display: false
      },
      tooltip: {
        backgroundColor: '#0F172A',
        borderColor: '#3B82F6',
        borderWidth: 1,
        titleColor: '#60A5FA',
        bodyColor: '#F1F5F9'
      }
    },
    scales: {
      x: {
        ticks: { color: '#F1F5F9', maxRotation: 0, autoSkip: true },
        grid: { color: 'rgba(255,255,255,0.05)' }
      },
      y: {
        beginAtZero: true,
        ticks: { color: '#F1F5F9' },
        grid: { color: 'rgba(255,255,255,0.05)' }
      }
    }
  };

  const total = alarms?.length || 0;

  return (
    <div className="relative bg-white/5 backdrop-blur-md rounded-xl p-4 border border-white/10 shadow-md">
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-white text-base font-semibold tracking-wide">
          {viewMode}  ترتيب عدد الأحداث بالزمن

 
        </h2>
        <select
          value={viewMode}
          onChange={(e) => setViewMode(e.target.value)}
          className="bg-[#0F172A] border border-[#3B82F6]/40 text-white text-sm px-3 py-1 rounded-lg shadow-sm hover:shadow-md transition-all"
        >
          <option value="Yearly">📅 سنوي</option>
          <option value="Monthly">🗓 شهري</option>
          <option value="Daily">📆 يومي</option>
        </select>
      </div>

      {/* Chart */}
      <div className="min-h-[290px] max-h-[300px]">
        <Line data={data} options={options} />
      </div>

      {/* No Data Message */}
      {total === 0 && (
        <div className="absolute inset-0 flex items-center justify-center text-white/60 text-sm italic pointer-events-none">
          No alarm data available
        </div>
      )}
    </div>
  );
};

export default AlarmTrendsChart;
