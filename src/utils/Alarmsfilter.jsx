import React, { useState } from 'react';
import { FaFilter, FaTimes } from 'react-icons/fa';

const AlarmFilters = ({ alarms = [], onFilter, onReset, className }) => {
  const [filters, setFilters] = useState({
    dateRange: { start: '', end: '' },
    category: '',
    subCategory: '',
    certainty: '',
    severity: '',
    status: '',
    originatorSystem: '',
    metro: '',
    governorate: '',
    delegation: ''
  });
  const [showFilters, setShowFilters] = useState(false);

  const getUniqueValues = (key) => {
    const values = alarms.map(alarm => alarm[key]);
    return [...new Set(values.filter(Boolean))];
  };

  const getUniqueSubCategories = (selectedCategory) => {
    if (!selectedCategory) return [];
    const values = alarms
      .filter(alarm => alarm.category === selectedCategory)
      .map(alarm => alarm.subCategory);
    return [...new Set(values.filter(Boolean))];
  };

  const getUniqueGroups = (levelIndex) => {
    const values = alarms.flatMap(alarm => {
      // Only continue if alarm.groups is an actual array
      if (!Array.isArray(alarm.groups)) return [];
  
      return alarm.groups
        .filter(group => typeof group === 'string') // Ensure each group is a string
        .map(group => {
          const match = group.match(/\/ooda\/tunisia\/([^/]+)\/([^/]+)\/([^/]+)\//);
          return match ? match[levelIndex] : null;
        })
        .filter(Boolean);
    });
  
    return [...new Set(values)];
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    
    // If category changes, reset subCategory
    if (name === 'category') {
      setFilters(prev => ({ 
        ...prev, 
        category: value,
        subCategory: '' 
      }));
    } else {
      setFilters(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleDateChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      dateRange: { ...prev.dateRange, [name]: value }
    }));
  };

  const applyFilters = () => {
    const filtersToApply = {
      dateRange: {
        start: filters.dateRange.start,
        end: filters.dateRange.end
      },
      category: filters.category,
      subCategory: filters.subCategory,
      certainty: filters.certainty,
      severity: filters.severity,
      status: filters.status,
      originatorSystem: filters.originatorSystem,
      metro: filters.metro,
      governorate: filters.governorate,
      delegation: filters.delegation
    };
    
    onFilter(filtersToApply);
    setShowFilters(false);
  };

  const resetFilters = () => {
    setFilters({
      dateRange: { start: '', end: '' },
      category: '',
      subCategory: '',
      certainty: '',
      severity: '',
      status: '',
      originatorSystem: '',
      metro: '',
      governorate: '',
      delegation: ''
    });
    onReset();
    setShowFilters(false);
  };

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={() => setShowFilters(!showFilters)}
        className="flex items-center space-x-2 bg-[#00ADB5]/20 hover:bg-[#00ADB5]/30 px-4 py-2 rounded-lg border border-[#00ADB5]/30 transition-all"
      >
        <FaFilter />
        <span>Filters</span>
      </button>

      {showFilters && (
        <div className="absolute z-10 mt-2 w-full max-w-5xl bg-[#393E46]/90 backdrop-blur-lg p-4 rounded-xl shadow-lg border border-[#00ADB5]/30">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {/* Date Range */}
            <div className="space-y-2 col-span-full">
              <label className="block text-sm font-medium text-[#EEEEEE]">Date Range</label>
              <div className="flex space-x-2">
                <input
                  type="date"
                  name="start"
                  value={filters.dateRange.start}
                  onChange={handleDateChange}
                  className="w-full bg-[#393E46] border border-[#00ADB5]/30 rounded px-3 py-2 text-sm text-white"
                />
                <input
                  type="date"
                  name="end"
                  value={filters.dateRange.end}
                  onChange={handleDateChange}
                  className="w-full bg-[#393E46] border border-[#00ADB5]/30 rounded px-3 py-2 text-sm text-white"
                />
              </div>
            </div>

            {/* Category */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-[#EEEEEE]">Category</label>
              <select
                name="category"
                value={filters.category}
                onChange={handleFilterChange}
                className="w-full bg-[#393E46] border border-[#00ADB5]/30 rounded px-3 py-2 text-sm text-white"
              >
                <option value="">All Categories</option>
                {getUniqueValues('category').map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            {/* SubCategory - only shown when a category is selected */}
            {filters.category && (
              <div className="space-y-2">
                <label className="block text-sm font-medium text-[#EEEEEE]">Sub Category</label>
                <select
                  name="subCategory"
                  value={filters.subCategory}
                  onChange={handleFilterChange}
                  className="w-full bg-[#393E46] border border-[#00ADB5]/30 rounded px-3 py-2 text-sm text-white"
                >
                  <option value="">All Sub Categories</option>
                  {getUniqueSubCategories(filters.category).map(subCat => (
                    <option key={subCat} value={subCat}>{subCat}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Status */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-[#EEEEEE]">Status</label>
              <select
                name="status"
                value={filters.status}
                onChange={handleFilterChange}
                className="w-full bg-[#393E46] border border-[#00ADB5]/30 rounded px-3 py-2 text-sm text-white"
              >
                <option value="">All Statuses</option>
                {getUniqueValues('status').map(status => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
            </div>

            {/* Certainty */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-[#EEEEEE]">Certainty</label>
              <select
                name="certainty"
                value={filters.certainty}
                onChange={handleFilterChange}
                className="w-full bg-[#393E46] border border-[#00ADB5]/30 rounded px-3 py-2 text-sm text-white"
              >
                <option value="">All Certainties</option>
                {getUniqueValues('certainty').map(certainty => (
                  <option key={certainty} value={certainty}>{certainty}</option>
                ))}
              </select>
            </div>

            {/* Severity */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-[#EEEEEE]">Severity</label>
              <select
                name="severity"
                value={filters.severity}
                onChange={handleFilterChange}
                className="w-full bg-[#393E46] border border-[#00ADB5]/30 rounded px-3 py-2 text-sm text-white"
              >
                <option value="">All Severities</option>
                {getUniqueValues('severity').map(severity => (
                  <option key={severity} value={severity}>{severity}</option>
                ))}
              </select>
            </div>

            {/* Originator System */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-[#EEEEEE]">Originator System</label>
              <select
                name="originatorSystem"
                value={filters.originatorSystem}
                onChange={handleFilterChange}
                className="w-full bg-[#393E46] border border-[#00ADB5]/30 rounded px-3 py-2 text-sm text-white"
              >
                <option value="">All Originators</option>
                {getUniqueValues('originatorSystem').map(originator => (
                  <option key={originator} value={originator}>{originator}</option>
                ))}
              </select>
            </div>

            {/* Metropolitan Region */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-[#EEEEEE]">Metropolitan Region</label>
              <select
                name="metro"
                value={filters.metro}
                onChange={handleFilterChange}
                className="w-full bg-[#393E46] border border-[#00ADB5]/30 rounded px-3 py-2 text-sm text-white"
              >
                <option value="">All Metros</option>
                {getUniqueGroups(1).map(m => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>

            {/* Governorate */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-[#EEEEEE]">Governorate</label>
              <select
                name="governorate"
                value={filters.governorate}
                onChange={handleFilterChange}
                className="w-full bg-[#393E46] border border-[#00ADB5]/30 rounded px-3 py-2 text-sm text-white"
              >
                <option value="">All Governorates</option>
                {getUniqueGroups(2).map(g => (
                  <option key={g} value={g}>{g}</option>
                ))}
              </select>
            </div>

            {/* Delegation */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-[#EEEEEE]">Delegation</label>
              <select
                name="delegation"
                value={filters.delegation}
                onChange={handleFilterChange}
                className="w-full bg-[#393E46] border border-[#00ADB5]/30 rounded px-3 py-2 text-sm text-white"
              >
                <option value="">All Delegations</option>
                {getUniqueGroups(3).map(d => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex justify-end space-x-3 mt-4">
            <button
              onClick={resetFilters}
              className="flex items-center space-x-2 bg-[#393E46] hover:bg-[#393E46]/80 px-4 py-2 rounded-lg border border-[#00ADB5]/30 transition-all"
            >
              <FaTimes />
              <span>Reset</span>
            </button>
            <button
              onClick={applyFilters}
              className="flex items-center space-x-2 bg-[#00ADB5]/20 hover:bg-[#00ADB5]/30 px-4 py-2 rounded-lg border border-[#00ADB5]/30 transition-all"
            >
              <FaFilter />
              <span>Apply Filters</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AlarmFilters;