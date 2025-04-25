import React from 'react';
import { Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

const generateColorPalette = (count) => {
  const colors = [
    '#8E44AD', '#3498DB', '#1ABC9C', '#F39C12', '#E74C3C',
    '#9B59B6', '#2ECC71', '#34495E', '#16A085', '#E67E22',
    '#D35400', '#C0392B', '#2980B9', '#27AE60', '#BDC3C7'
  ];
  return colors.slice(0, count).map(color => color + 'CC');
};

const AlarmsSeverityChart = ({ alarms }) => {
  // Mapping of Arabic severity labels to English
  const severityMapping = {
    'عادي': 'Normal',
    'متوسّط': 'Normal',
    'اهم': 'Major',
    'هام': 'Major',
    'اهم جاء': 'Major',
    'هام جدّا':'Major',
    'مواعد': 'Minor',
    // Add any other Arabic variations you need to map
  };

  const severityCounts = alarms?.reduce((acc, alarm) => {
    let severity = alarm.severity || 'Unknown';
    
    // Normalize to English using the mapping
    if (severityMapping[severity]) {
      severity = severityMapping[severity];
    }
    
    // Count
    acc[severity] = (acc[severity] || 0) + 1;
    return acc;
  }, {});

  const labels = Object.keys(severityCounts || {});
  const counts = Object.values(severityCounts || {});
  const total = counts.reduce((acc, val) => acc + val, 0);

  const data = {
    labels,
    datasets: [{
      data: counts,
      backgroundColor: generateColorPalette(labels.length),
      borderColor: generateColorPalette(labels.length).map(c => c.replace('CC', 'FF')),
      borderWidth: 2,
      hoverBorderColor: '#FFFFFF',
      hoverBorderWidth: 3,
    }],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '70%',
    plugins: {
      legend: {
        position: 'right',
        labels: {
          color: '#EEEEEE',
          font: { size: 12 },
          padding: 15,
        },
      },
      title: {
        display: true,
        text: 'Alarm Severity Distribution',
        color: '#EEEEEE',
        font: { size: 16 },
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
            const percentage = Math.round((value / total) * 100);
            return `${context.label}: ${value} (${percentage}%)`;
          },
        },
      },
      beforeDraw: (chart) => {
        const ctx = chart.ctx;
        const width = chart.width;
        const height = chart.height;
        
        ctx.save();
        ctx.font = 'bold 20px Arial';
        ctx.fillStyle = '#FFFFFF';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        // Main total number
        ctx.font = 'bold 24px Arial';
        ctx.fillText(total.toString(), width / 2, height / 2 - 10);
        
        // "Total Alarms" label
        ctx.font = '14px Arial';
        ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
        ctx.fillText('Total Alarms', width / 2, height / 2 + 20);
        ctx.restore();
      }
    },
  };

  return (
    <div className="relative bg-[#1E293B]/30 backdrop-blur-sm rounded-xl shadow-lg p-4 border border-[#3B82F6]/20 h-80">
      <div className="h-full w-full">
        <Doughnut data={data} options={options} />
      </div>
    </div>
  );
};

export default AlarmsSeverityChart;