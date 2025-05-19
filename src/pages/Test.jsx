import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { FaHome, FaChartBar, FaCog, FaUserAlt, FaSignOutAlt, FaBars } from "react-icons/fa";
import KpiCard from '../charts/KPICard';
import AlarmsByCategoryChart from '../charts/Alarmsbarchart';
import AlarmsStatusPieChart from '../charts/AlarmsStatusPieChart';
import AlarmsHeatMap from "../charts/AlarmsHeatMap";
import AlarmsSeverityPieChart from '../charts/Alarmsies';
import CertaintyPieChart from '../charts/Alarmsbycertinity';
import AlarmFilters from '../utils/Alarmsfilter';
import AlarmTimeDistributionChart from '../charts/Datetimechart';
import MonthlyAlarmTrends from '../charts/Alarmtrend';
import AlarmsGroupedChart from '../charts/AlarmsLineChart';

function TestObvious() {
  const [alarmData, setAlarmData] = useState([]);
  const [filteredAlarms, setFilteredAlarms] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [username, setUsername] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch("http://192.168.1.23:3000/self", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        const data = await res.json();
        setUsername(data.username); // use a useState or context setter
      } catch (err) {
        console.error("Failed to fetch username", err);
      }
    };
  
    fetchUser();
    const loadData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const token = localStorage.getItem('obviousToken');
        if (!token) {
          navigate('/login');
          return;
        }

        const response = await axios.get('http://192.168.1.23:8000/alerts', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        
        setAlarmData(response.data);
        setFilteredAlarms(response.data);
        console.log('Fetched Alarm Data:', response.data);

      } catch (err) {
        if (err.response?.status === 401) {
          localStorage.removeItem('obviousToken');
          navigate('/login');
        } else {
          setError('Failed to load alarm data.');
          console.error(err);
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('obviousToken');
    setTimeout(() => {
      navigate('/login');
    }, 300);
  };
  
  

  const handleFilterChange = (filters) => {
    console.log('Filters applied:', filters);
  
    const dateRange = filters.dateRange || { start: null, end: null };
  
    const filtered = alarmData.filter(alarm => {
      // Date filtering
      if (dateRange.start || dateRange.end) {
        const alarmDate = new Date(alarm.creationDate);
        const startDate = dateRange.start ? new Date(dateRange.start) : null;
        const endDate = dateRange.end ? new Date(dateRange.end) : null;
  
        if (startDate && alarmDate < new Date(startDate.setHours(0, 0, 0, 0))) return false;
        if (endDate && alarmDate > new Date(endDate.setHours(23, 59, 59, 999))) return false;
      }
  
      // Other filters
      const matchesCategory = filters.category ? alarm.category === filters.category : true;
      const matchesSubCategory = filters.subCategory ? alarm.subCategory === filters.subCategory : true;
      const matchesCertainty = filters.certainty ? alarm.certainty === filters.certainty : true;
      const matchesSeverity = filters.severity ? alarm.severity === filters.severity : true;
      const matchesStatus = filters.status ? alarm.status === filters.status : true;
      const matchesOriginatorSystem = filters.originatorSystem ? alarm.originatorSystem === filters.originatorSystem : true;
  
      // Groups filtering logic - improved with early return if no group filters
      let matchesGroups = true;
      const hasGroupFilters = filters.metro || filters.governorate || filters.delegation;
      
      if (hasGroupFilters) {
        const groupsArray = Array.isArray(alarm.groups) ? alarm.groups : [];
        
        // If no groups exist but group filters are applied, exclude this alarm
        if (groupsArray.length === 0) return false;
        
        matchesGroups = groupsArray.some(group => {
          if (typeof group !== 'string') return false;
          const match = group.match(/\/ooda\/tunisia\/([^/]+)\/([^/]+)\/([^/]+)\//);
          if (!match) return false;
  
          const metroMatch = filters.metro ? match[1] === filters.metro : true;
          const governorateMatch = filters.governorate ? match[2] === filters.governorate : true;
          const delegationMatch = filters.delegation ? match[3] === filters.delegation : true;
  
          return metroMatch && governorateMatch && delegationMatch;
        });
      }
  
      return matchesCategory &&
             matchesSubCategory &&
             matchesCertainty &&
             matchesSeverity &&
             matchesStatus &&
             matchesOriginatorSystem &&
             matchesGroups;
    });
  
    setFilteredAlarms(filtered);
  };
  

  const handleResetFilters = () => {
    setFilteredAlarms(alarmData);
  };

  if (isLoading) {
    return (
      <div className="h-screen bg-gradient-to-br from-[#1E1E2F] to-[#2D2D42] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#00ADB5]"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-screen bg-gradient-to-br from-[#1E1E2F] to-[#2D2D42] flex items-center justify-center text-white">
        <div className="bg-[#393E46]/50 p-6 rounded-xl shadow-lg border border-[#00ADB5]/20">
          <p className="text-red-400 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="bg-[#00ADB5] hover:bg-[#00ADB5]/80 text-white px-4 py-2 rounded-lg"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-gradient-to-br from-[#1E1E2F] to-[#2D2D42] text-white flex flex-col overflow-hidden">
      <header className="bg-[#00ADB5]/20 backdrop-blur-md h-16 flex items-center px-4 sm:px-6 border-b border-[#00ADB5]/30 w-full">

        <div className="w-full flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <button className="sm:hidden p-2 rounded-lg bg-[#393E46]/50">
              <FaBars />
            </button>
          
          </div>
          <div className="flex space-x-3 sm:space-x-4 items-center">
          <div className="text-sm text-[#EEEEEE] font-medium hidden sm:block">
    <span className="text-[#00ADB5]">{username}</span>
  </div>
            <button 
              onClick={handleLogout}
              className="bg-red-500/20 hover:bg-red-500/30 p-2 rounded-full flex items-center justify-center shadow-lg border border-red-500/20 cursor-pointer transition-all"
              title="Logout"
            >
              <FaSignOutAlt />
            </button>
          </div>
        </div>
      </header>

      <div className="flex flex-grow overflow-hidden">
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
          <AlarmFilters
            alarms={alarmData}
            onFilter={handleFilterChange}
            onReset={handleResetFilters}
          />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <KpiCard
            title="عدد الأحداث المنجزة"
            icon={FaChartBar}
            value={filteredAlarms.filter(alarm => alarm.status === 'Closed').length || 0}
            description="عدد الأحداث التي تم إنجازها  "
          />
          <KpiCard
            title="إجمالي الإنذارات الجارية"
            icon={FaChartBar}
            value={filteredAlarms.filter(alarm => alarm.status === 'Opened').length || 0}
            description=" عدد الأحداث التي بصدد إنجازها  "
          />
          <KpiCard
            title="عدد الفئات الفريدة"
            icon={FaChartBar}
            value={new Set(filteredAlarms.map(alarm => alarm.category)).size || 0}
            description=" إجمالي الأحداث حسب التصنيف."
          />
          <KpiCard
            title="إجمالي عدد الإنذارات"
            icon={FaChartBar}
            value={filteredAlarms.length || 0}
            description="إجمالي عدد الإنذارات المسجلة."
          />
        </div>


          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-[#393E46]/30 backdrop-blur-sm rounded-xl shadow-lg p-4 border border-[#00ADB5]/20 h-80">
              <AlarmsByCategoryChart alarms={filteredAlarms || []} />
            </div>
            <div className="bg-[#393E46]/30 backdrop-blur-sm rounded-xl shadow-lg p-4 border border-[#00ADB5]/20 h-80">
              <CertaintyPieChart alarms={filteredAlarms || []} />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-2 mt-2">
            <div className="bg-[#393E46]/30 backdrop-blur-sm rounded-xl shadow-lg p-4 border border-[#00ADB5]/20 h-full">
              <AlarmsHeatMap alarms={filteredAlarms || []} />
            </div>
        

            <div className="bg-[#393E46]/30 backdrop-blur-sm rounded-xl shadow-lg p-4 border border-[#00ADB5]/20 h-96">
              <AlarmsSeverityPieChart alarms={filteredAlarms || []} />
              <div className="bg-[#393E46]/30 backdrop-blur-sm rounded-xl shadow-lg p-2 border border-[#00ADB5]/20 h-96 mt-18">
                <AlarmsGroupedChart alarms={filteredAlarms || []} />
              </div>
             

    
            </div>
            
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-2 mt-2">

            <div className="bg-[#393E46]/30 backdrop-blur-sm rounded-xl shadow-lg p-2 border border-[#00ADB5]/20 h-96 ">

            <AlarmTimeDistributionChart alarms={filteredAlarms || []} />
            </div>
            <div className="bg-[#393E46]/30 backdrop-blur-sm rounded-xl shadow-lg p-2 border border-[#00ADB5]/20 h-96">

            <MonthlyAlarmTrends alarms={filteredAlarms || []} />
            </div>
            </div>
        </div>
    

      </div>


    </div>
    
  );
}

export default TestObvious;