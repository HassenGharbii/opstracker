import React, { useState } from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const generateColorPalette = (count) => {
  const colors = [
    '#8E44AD', '#3498DB', '#1ABC9C', '#F39C12', '#E74C3C',
    '#9B59B6', '#2ECC71', '#34495E', '#16A085', '#E67E22',
    '#D35400', '#C0392B', '#2980B9', '#27AE60', '#BDC3C7'
  ];
  return colors.slice(0, count).map(color => color + 'CC');
};

const timeBucketOptions = [
  { value: '15', label: '15 minutes' },
  { value: '30', label: '30 minutes' },
  { value: '60', label: '1 hour' },
  { value: '120', label: '2 hours' },
  { value: '240', label: '4 hours' },
];

const AlarmTimeDistributionChart = ({ alarms }) => {
  const [timeBucket, setTimeBucket] = useState('60');
  const [startTime, setStartTime] = useState('00:00');
  const [endTime, setEndTime] = useState('23:59');

  // Convert HH:MM to minutes since midnight
  const timeToMinutes = (time) => {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  };

  // Process alarm data based on selected time range and bucket size
  const processAlarmData = () => {
    if (!alarms || alarms.length === 0) return {};

    const startMinutes = timeToMinutes(startTime);
    let endMinutes = timeToMinutes(endTime);
    
    // Handle overnight range (e.g., 22:00-06:00)
    if (endMinutes <= startMinutes) {
      endMinutes += 1440; // Add 24 hours
    }

    const bucketSize = parseInt(timeBucket);
    const totalRange = endMinutes - startMinutes;
    const numBuckets = Math.ceil(totalRange / bucketSize);

    // Create time buckets
    const buckets = {};
    for (let i = 0; i < numBuckets; i++) {
      const bucketStart = startMinutes + i * bucketSize;
      const bucketEnd = Math.min(startMinutes + (i + 1) * bucketSize, endMinutes);
      
      const startH = Math.floor(bucketStart % 1440 / 60);
      const startM = bucketStart % 1440 % 60;
      const endH = Math.floor(bucketEnd % 1440 / 60);
      const endM = bucketEnd % 1440 % 60;
      
      const label = `${String(startH).padStart(2, '0')}:${String(startM).padStart(2, '0')}-${String(endH).padStart(2, '0')}:${String(endM).padStart(2, '0')}`;
      buckets[label] = 0;
    }

    // Count alarms in each bucket
    alarms.forEach(alarm => {
      if (!alarm.creationDate) return;
      
      const date = new Date(alarm.creationDate);
      const alarmMinutes = date.getUTCHours() * 60 + date.getUTCMinutes();
      
      // Check if alarm is in the selected time range
      let alarmMinutesAdj = alarmMinutes;
      if (endMinutes > 1440 && alarmMinutes < startMinutes) {
        alarmMinutesAdj += 1440; // Adjust for overnight range
      }
      
      if (alarmMinutesAdj >= startMinutes && alarmMinutesAdj < endMinutes) {
        const bucketIndex = Math.floor((alarmMinutesAdj - startMinutes) / bucketSize);
        const bucketLabel = Object.keys(buckets)[bucketIndex];
        if (bucketLabel) {
          buckets[bucketLabel]++;
        }
      }
    });

    return buckets;
  };

  const timeData = processAlarmData();
  const totalAlarms = Object.values(timeData).reduce((sum, count) => sum + count, 0);

  // Prepare data for ChartJS
  const chartData = {
    labels: Object.keys(timeData),
    datasets: [
      {
        label: 'Number of Alarms',
        data: Object.values(timeData),
        backgroundColor: generateColorPalette(Object.keys(timeData).length),
        borderColor: generateColorPalette(Object.keys(timeData).length).map(c => c.replace('CC', 'FF')),
        borderWidth: 1,
        hoverBorderColor: '#FFFFFF',
        hoverBorderWidth: 2,
        borderRadius: 4,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: true,
        text: `Alarm Distribution (${startTime} to ${endTime})`,
        color: '#EEEEEE',
        font: { size: 16 },
        padding: { bottom: 20 }
      },
      tooltip: {
        backgroundColor: '#1E293B',
        titleColor: '#93C5FD',
        bodyColor: '#E5E7EB',
        borderColor: '#3B82F6',
        borderWidth: 1,
        callbacks: {
          label: (context) => {
            const value = context.raw || 0;
            const percentage = totalAlarms > 0 ? Math.round((value / totalAlarms) * 100) : 0;
            return `${context.label}: ${value} alarm${value !== 1 ? 's' : ''} (${percentage}%)`;
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(255, 255, 255, 0.1)'
        },
        ticks: {
          color: '#E5E7EB',
          precision: 0
        },
        title: {
          display: true,
          text: 'Number of Alarms',
          color: '#E5E7EB',
          font: {
            size: 12
          }
        }
      },
      x: {
        grid: {
          display: false
        },
        ticks: {
          color: '#E5E7EB',
          maxRotation: 45,
          minRotation: 45
        },
        title: {
          display: true,
          text: 'Time Interval',
          color: '#E5E7EB',
          font: {
            size: 12
          }
        }
      }
    }
  };

  return (
    <div className="relative bg-[#1E293B]/30 backdrop-blur-sm rounded-xl shadow-lg p-4 border border-[#3B82F6]/20">
      <div className="flex flex-wrap gap-4 mb-4 items-center">
        <div className="flex items-center space-x-2">
          <label htmlFor="startTime" className="text-sm font-medium text-gray-300">
            From:
          </label>
          <input
            type="time"
            id="startTime"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            className="bg-gray-700 border border-gray-600 rounded-md px-3 py-1 text-sm text-white focus:ring-blue-500 focus:border-blue-500"
            step="300" // 5 minute steps
          />
        </div>

        <div className="flex items-center space-x-2">
          <label htmlFor="endTime" className="text-sm font-medium text-gray-300">
            To:
          </label>
          <input
            type="time"
            id="endTime"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            className="bg-gray-700 border border-gray-600 rounded-md px-3 py-1 text-sm text-white focus:ring-blue-500 focus:border-blue-500"
            step="300" // 5 minute steps
          />
        </div>

        <div className="flex items-center space-x-2">
          <label htmlFor="timeBucket" className="text-sm font-medium text-gray-300">
            Bucket Size:
          </label>
          <select
            id="timeBucket"
            value={timeBucket}
            onChange={(e) => setTimeBucket(e.target.value)}
            className="bg-gray-700 border border-gray-600 rounded-md px-3 py-1 text-sm text-white focus:ring-blue-500 focus:border-blue-500"
          >
            {timeBucketOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="h-80">
        <Bar data={chartData} options={options} />
      </div>
      
      {alarms?.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none mt-10">
          <span className="text-white/70 text-sm">No alarm data available</span>
        </div>
      )}

      {alarms?.length > 0 && totalAlarms === 0 && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none mt-10">
          <span className="text-white/70 text-sm">No alarms in selected time range</span>
        </div>
      )}
    </div>
  );
};

export default AlarmTimeDistributionChart;