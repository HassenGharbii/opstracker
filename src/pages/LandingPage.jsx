import React, { useState, useEffect } from 'react';
import { FaHome, FaChartBar, FaCog, FaUserAlt, FaBell, FaSearch, FaBars } from "react-icons/fa";
import { fetchAndProcessExcelData } from '../utils/processAlarms';
import KpiCard from '../charts/KPICard';
import AlarmsByCategoryChart from '../charts/Alarmsbarchart';
import AlarmsStatusPieChart from '../charts/AlarmsStatusPieChart';
import AlarmFilters from '../utils/Alarmsfilter';
import AlarmsHeatMap from "../charts/AlarmsHeatMap";
import AlarmsSeverityPieChart from '../charts/Alarmsies';
import CertaintyPieChart from '../charts/Alarmsbycertinity';
import AlarmsLineChart from '../charts/AlarmsLineChart';


function Landingpage() {
  const [openedAlarmsCount, setOpenedAlarmsCount] = useState(0);
  const [closedAlarmsCount, setClosedAlarmsCount] = useState(0);
  const [uniqueCategories, setUniqueCategories] = useState(new Set());
  const [alarmData, setAlarmData] = useState(null);
  const [filteredData, setFilteredData] = useState(null); // State for filtered data
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const data = await fetchAndProcessExcelData();
        setAlarmData(data); // Set the raw data
        setFilteredData(data.alarms); // Set initial filtered data to the full alarm data

        // Count closed and opened alarms
        const closedCount = data.alarms.filter(alarm => alarm.status === 'Closed').length;
        const openedCount = data.alarms.filter(alarm => alarm.status === 'Opened').length;

        setClosedAlarmsCount(closedCount);
        setOpenedAlarmsCount(openedCount);

        // Calculate unique categories
        const uniqueCategoriesSet = new Set(data.alarms.map(alarm => alarm.category));
        setUniqueCategories(uniqueCategoriesSet);

      } catch (err) {
        setError('Failed to load alarm data. Please check if the file exists.');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
    


  }, []);

  // Function to apply filters to alarm data
  const handleFilter = (filters) => {
    let filtered = alarmData.alarms;

    // Filter by date range
    if (filters.dateRange.start && filters.dateRange.end) {
      filtered = filtered.filter(alarm => {
        const alarmDate = new Date(alarm.date);
        const startDate = new Date(filters.dateRange.start);
        const endDate = new Date(filters.dateRange.end);
        return alarmDate >= startDate && alarmDate <= endDate;
      });
    }
    

    // Filter by category
    if (filters.category) {
      filtered = filtered.filter(alarm => alarm.category === filters.category);
    }

    // Filter by status
    if (filters.status) {
      filtered = filtered.filter(alarm => alarm.status === filters.status);
    }

    // Filter by certainty
    if (filters.certainty) {
      filtered = filtered.filter(alarm => alarm.certainty === filters.certainty);
    }

    // Filter by severity
    if (filters.severity) {
      filtered = filtered.filter(alarm => alarm.severity === filters.severity);
    }

    // Filter by originator system
    if (filters.originatorSystem) {
      filtered = filtered.filter(alarm => alarm.originatorSystem === filters.originatorSystem);
    }

    // Filter by user name
    if (filters.userName) {
      filtered = filtered.filter(alarm => alarm.author.userName === filters.userName);
    }

    // Set the filtered data
    setFilteredData({ alarms: filtered });
  };
  useEffect(() => {
    if (alarmData) {
      console.table("Updated Alarm Data:", filteredData);  // <---- Log all data whenever it changes
    }
  }, [filteredData]);

  // Function to reset filters
  const handleReset = () => {
    setFilteredData({ alarms: alarmData.alarms }); // Reset to the original data

  };

  return (
    <div className="h-screen bg-gradient-to-br from-[#1E1E2F] to-[#2D2D42] text-white flex flex-col overflow-hidden">
      <header className="bg-[#00ADB5]/20 backdrop-blur-md h-16 flex items-center px-4 sm:px-6 border-b border-[#00ADB5]/30 w-full">
        <div className="w-full flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <button className="sm:hidden p-2 rounded-lg bg-[#393E46]/50">
              <FaBars />
            </button>
            <div className="bg-[#393E46]/50 backdrop-blur-sm h-10 w-36 rounded-lg flex items-center justify-center text-sm font-semibold shadow-lg border border-[#00ADB5]/20">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00ADB5] to-[#EEEEEE]">
                Dashboard
              </span>
            </div>
          </div>
          <div className="flex space-x-3 sm:space-x-4">
            <div className="bg-[#393E46]/50 backdrop-blur-sm h-10 w-10 rounded-full flex items-center justify-center shadow-lg border border-[#00ADB5]/20 cursor-pointer hover:bg-[#00ADB5]/30 transition-all">
              <FaSearch />
            </div>
            <div className="bg-[#393E46]/50 backdrop-blur-sm h-10 w-10 rounded-full flex items-center justify-center shadow-lg border border-[#00ADB5]/20 cursor-pointer hover:bg-[#00ADB5]/30 transition-all">
              <FaBell />
            </div>
          </div>
        </div>
      </header>

      <div className="flex flex-grow overflow-hidden">
        {/* Sidebar */}
        <aside className="hidden sm:flex w-20 bg-[#00ADB5]/10 backdrop-blur-md h-full flex-col items-center py-6 space-y-8 border-r border-[#00ADB5]/20">
          <div className="p-3 bg-[#393E46]/30 backdrop-blur-sm rounded-xl shadow-lg border border-[#00ADB5]/20 cursor-pointer hover:bg-[#00ADB5]/20 transition-all">
            <FaHome className="text-xl" />
          </div>
          <div className="p-3 bg-[#393E46]/30 backdrop-blur-sm rounded-xl shadow-lg border border-[#00ADB5]/20 cursor-pointer hover:bg-[#00ADB5]/20 transition-all">
            <FaChartBar className="text-xl" />
          </div>
          <div className="p-3 bg-[#393E46]/30 backdrop-blur-sm rounded-xl shadow-lg border border-[#00ADB5]/20 cursor-pointer hover:bg-[#00ADB5]/20 transition-all">
            <FaUserAlt className="text-xl" />
          </div>
          <div className="p-3 bg-[#393E46]/30 backdrop-blur-sm rounded-xl shadow-lg border border-[#00ADB5]/20 cursor-pointer hover:bg-[#00ADB5]/20 transition-all">
            <FaCog className="text-xl" />
          </div>
        </aside>

        <div className="flex flex-col flex-grow p-2 sm:p-2 lg:p-8 space-y-6 overflow-y-auto">
          {/* Filters Section */}
          <AlarmFilters 
            alarms={alarmData?.alarms || []}
            onFilter={handleFilter}
            onReset={handleReset}
          />

          {/* KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
  <KpiCard
    title="Closed Alarms Count"
    icon={FaChartBar}
    value={filteredData?.alarms?.filter(alarm => alarm.status === 'Closed').length || 0}
    description="Total number of alarms that have been closed."
  />
  <KpiCard
    title="Opened Alarms Count"
    icon={FaChartBar}
    value={filteredData?.alarms?.filter(alarm => alarm.status === 'Opened').length || 0}
    description="Total number of alarms that are still open."
  />
  <KpiCard
    title="Unique Categories"
    icon={FaChartBar}
    value={new Set(filteredData?.alarms?.map(alarm => alarm.category)).size || 0}
    description="Total number of unique alarm categories."
  />
  <KpiCard
    title="Total Alarms"
    icon={FaChartBar}
    value={filteredData?.alarms?.length || 0}
    description="Total number of alarms recorded."
  />
</div>


          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-[#393E46]/30 backdrop-blur-sm rounded-xl shadow-lg p-4 border border-[#00ADB5]/20 h-80">
              <AlarmsByCategoryChart alarms={filteredData?.alarms || alarmData?.alarms || []} />
            </div>
            <div className="bg-[#393E46]/30 backdrop-blur-sm rounded-xl shadow-lg p-4 border border-[#00ADB5]/20 h-80">
              <CertaintyPieChart alarms={filteredData?.alarms || alarmData?.alarms || []} />
            </div>

          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-2 mt-2">
            <div className="bg-[#393E46]/30 backdrop-blur-sm rounded-xl shadow-lg p-4 border border-[#00ADB5]/20 h-full">
            <AlarmsHeatMap  alarms={filteredData?.alarms || alarmData?.alarms || []} />
            
              
            </div>
            <div className="bg-[#393E46]/30 backdrop-blur-sm rounded-xl shadow-lg p-4 border border-[#00ADB5]/20 h-96">
            <AlarmsSeverityPieChart alarms={filteredData?.alarms || alarmData?.alarms || []} />
            <div className="bg-[#393E46]/30 backdrop-blur-sm rounded-xl shadow-lg p-2 border border-[#00ADB5]/20 h-96 mt-18">
            <AlarmsLineChart alarms={filteredData?.alarms || alarmData?.alarms || []} />


            </div>
          </div>
          </div>

        </div>
      </div>
    </div>
  );
}

export default Landingpage;
