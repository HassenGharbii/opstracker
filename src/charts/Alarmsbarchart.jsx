import React, { useState } from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const AlarmsByCategoryChart = ({ alarms }) => {
  const [currentPage, setCurrentPage] = useState(0);
  const [drillDownMode, setDrillDownMode] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [breadcrumbs, setBreadcrumbs] = useState([]);

  // Process category data
  const processCategoryData = () => {
    if (!alarms || alarms.length === 0) return { categories: [], counts: [] };

    const categoryCounts = alarms.reduce((acc, alarm) => {
      const category = typeof alarm.category === 'string' && alarm.category.trim() !== ''
        ? alarm.category.trim()
        : null;

      if (!category) return acc;

      acc[category] = (acc[category] || 0) + 1;
      return acc;
    }, {});

    const sortedData = Object.entries(categoryCounts)
      .sort((a, b) => b[1] - a[1]);

    return {
      categories: sortedData.map(([category]) => category),
      counts: sortedData.map(([_, count]) => count)
    };
  };

  // Process subcategory data for a specific category
  const processSubCategoryData = (category) => {
    if (!alarms || alarms.length === 0) return { subCategories: [], counts: [] };

    const subCategoryCounts = alarms.reduce((acc, alarm) => {
      if (alarm.category !== category) return acc;

      const subCategory = typeof alarm.subCategory === 'string' && alarm.subCategory.trim() !== ''
        ? alarm.subCategory.trim()
        : 'Uncategorized';

      acc[subCategory] = (acc[subCategory] || 0) + 1;
      return acc;
    }, {});

    const sortedData = Object.entries(subCategoryCounts)
      .sort((a, b) => b[1] - a[1]);

    return {
      subCategories: sortedData.map(([subCategory]) => subCategory),
      counts: sortedData.map(([_, count]) => count)
    };
  };

  // Handle drill down to subcategories
  const handleBarClick = (elements) => {
    if (elements.length === 0) return;
    
    const clickedElementIndex = elements[0].index;
    const category = drillDownMode 
      ? selectedCategory 
      : processCategoryData().categories[currentPage * itemsPerPage + clickedElementIndex];
    
    if (drillDownMode) {
      // If already in drill down mode, we could add another level here if needed
      return;
    } else {
      // Enter drill down mode
      setSelectedCategory(category);
      setBreadcrumbs([...breadcrumbs, category]);
      setDrillDownMode(true);
      setCurrentPage(0); // Reset to first page when drilling down
    }
  };

  // Handle going back to categories
  const handleBackToCategories = () => {
    setDrillDownMode(false);
    setSelectedCategory(null);
    setBreadcrumbs([]);
  };

  // Common chart configuration
  const itemsPerPage = 5;
  let chartData, totalItems, titleText;

  if (drillDownMode) {
    const { subCategories, counts } = processSubCategoryData(selectedCategory);
    totalItems = subCategories.length;
    const startIdx = currentPage * itemsPerPage;
    const endIdx = startIdx + itemsPerPage;
    
    chartData = {
      labels: subCategories.slice(startIdx, endIdx),
      datasets: [{
        label: 'Number of Alarms',
        data: counts.slice(startIdx, endIdx),
        backgroundColor: '#008B92', // Different color for subcategories
        borderColor: 'rgba(0, 139, 146, 0.2)',
        borderWidth: 0,
        borderRadius: 6,
        borderSkipped: false,
        hoverBackgroundColor: '#006D74',
        barThickness: 36,
        categoryPercentage: 0.8,
      }]
    };
    
    titleText = `Subcategories for ${selectedCategory} (${startIdx + 1}-${Math.min(endIdx, totalItems)} of ${totalItems})`;
  } else {
    const { categories, counts } = processCategoryData();
    totalItems = categories.length;
    const startIdx = currentPage * itemsPerPage;
    const endIdx = startIdx + itemsPerPage;
    
    chartData = {
      labels: categories.slice(startIdx, endIdx),
      datasets: [{
        label: 'Number of Alarms',
        data: counts.slice(startIdx, endIdx),
        backgroundColor: '#00ADB5',
        borderColor: 'rgba(0, 173, 181, 0.2)',
        borderWidth: 0,
        borderRadius: 6,
        borderSkipped: false,
        hoverBackgroundColor: '#008B92',
        barThickness: 36,
        categoryPercentage: 0.8,
      }]
    };
    
    titleText = `Top Alarm Categories (${startIdx + 1}-${Math.min(endIdx, totalItems)} of ${totalItems})`;
  }

  const totalPages = Math.ceil(totalItems / itemsPerPage);

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    onClick: (_, elements) => handleBarClick(elements),
    plugins: {
      legend: { display: false },
      title: {
        display: true,
        text: titleText,
        color: '#EEEEEE',
        font: { 
          size: 16,
          weight: '500'
        },
        padding: {
          bottom: 20
        }
      },
      tooltip: {
        enabled: true,
        backgroundColor: '#393E46',
        titleColor: '#00ADB5',
        bodyColor: '#EEEEEE',
        borderColor: '#00ADB5',
        borderWidth: 1,
        padding: 12,
        displayColors: false,
        callbacks: {
          label: function(context) {
            return `${context.parsed.y} alarms`;
          }
        }
      },
    },
    scales: {
      x: {
        grid: { 
          display: false,
          drawBorder: false
        },
        ticks: {
          color: '#EEEEEE',
          font: { 
            size: 12,
            weight: '500' 
          }
        }
      },
      y: {
        beginAtZero: true,
        grid: { 
          color: 'rgba(57, 62, 70, 0.5)',
          drawBorder: false
        },
        ticks: {
          color: '#EEEEEE',
          stepSize: 1,
          font: {
            size: 11
          },
          padding: 8
        }
      }
    },
    animation: {
      duration: 1000,
      onComplete: function() {
        const chart = this;
        const ctx = chart.ctx;
        ctx.font = 'bold 12px Arial';
        ctx.fillStyle = '#EEEEEE';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'bottom';

        chart.data.datasets.forEach((dataset, i) => {
          const meta = chart.getDatasetMeta(i);
          meta.data.forEach((bar, index) => {
            const data = dataset.data[index];
            ctx.fillText(data, bar.x, bar.y - 8);
          });
        });
      }
    }
  };

  const handlePrev = () => setCurrentPage(prev => Math.max(prev - 1, 0));
  const handleNext = () => setCurrentPage(prev => Math.min(prev + 1, totalPages - 1));

  return (
    <div className="bg-[#393E46]/30 backdrop-blur-sm rounded-xl shadow-lg p-6 border border-[#00ADB5]/20 h-80 min-h-[320px] relative">
      {/* Breadcrumbs */}
      {drillDownMode && (
        <div className="absolute top-4 left-4 flex items-center space-x-2 text-sm text-[#EEEEEE]">
          <button 
            onClick={handleBackToCategories}
            className="text-[#00ADB5] hover:text-[#008B92] transition-colors"
          >
            All Categories
          </button>
          <span>/</span>
          <span>{selectedCategory}</span>
        </div>
      )}
      
      <div className="h-[calc(100%-40px)] w-full">
        <Bar data={chartData} options={options} />
      </div>
      
      {/* Navigation arrows */}
      <button 
        onClick={handlePrev}
        disabled={currentPage === 0}
        className="absolute left-4 top-1/2 -translate-y-1/2 bg-[#393E46] hover:bg-[#00ADB5] rounded-full w-8 h-8 flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200 shadow-md"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
        </svg>
      </button>
      
      <button 
        onClick={handleNext}
        disabled={currentPage >= totalPages - 1}
        className="absolute right-4 top-1/2 -translate-y-1/2 bg-[#393E46] hover:bg-[#00ADB5] rounded-full w-8 h-8 flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200 shadow-md"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
        </svg>
      </button>
      
      {/* Page indicator */}
      {totalPages > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-[#EEEEEE] text-sm bg-[#393E46]/70 px-3 py-1 rounded-full">
          {currentPage + 1} / {totalPages}
        </div>
      )}
    </div>
  );
};

export default AlarmsByCategoryChart;