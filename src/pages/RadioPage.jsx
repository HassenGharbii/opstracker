import React, { useState, useEffect } from "react";
import { FaHome, FaChartBar, FaCog, FaUserAlt } from "react-icons/fa";
import KpiCard from "../charts/KPICard";

function RadioPage() {
  const [gpsData, setGpsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
useEffect(() => {
  const fetchData = async () => {
    try {
      const response = await fetch('http://192.168.100.50:3000/radio');
      if (!response.ok) throw new Error('Network response was not ok');
      const data = await response.json();

      console.log('Raw GPS Data:', data);
      setGpsData(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  fetchData();
}, []);



  if (loading) return <div className="flex items-center justify-center h-full">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#00ADB5]"></div>
  </div>;

  if (error) return <div className="flex items-center justify-center h-full text-red-500">
    Error: {error}
  </div>;

  // KPI calculations
  const totalEntries = gpsData.length;
  const uniqueDevices = new Set(gpsData.map(item => item.uid)).size;
  const maxSpeed = Math.max(...gpsData.map(item => item.speed || 0)).toFixed(2);
  const avgSpeed = (gpsData.reduce((sum, item) => sum + (item.speed || 0), 0) / totalEntries).toFixed(2);

  return (
    <div className="h-screen bg-gradient-to-br from-[#1E1E2F] to-[#2D2D42] text-white flex flex-col overflow-hidden">
      <header className="bg-[#00ADB5]/20 backdrop-blur-md h-16 flex items-center px-4 sm:px-6 border-b border-[#00ADB5]/30 w-full">
        {/* Header */}
      </header>

      <div className="flex flex-grow overflow-hidden">
        <aside className="hidden sm:flex w-20 bg-[#00ADB5]/10 backdrop-blur-md h-full flex-col items-center py-6 space-y-8 border-r border-[#00ADB5]/20">
          {[FaHome, FaChartBar, FaUserAlt, FaCog].map((Icon, i) => (
            <div key={i} className="p-3 bg-[#393E46]/30 backdrop-blur-sm rounded-xl shadow-lg border border-[#00ADB5]/20 cursor-pointer hover:bg-[#00ADB5]/20 transition-all">
              <Icon className="text-xl" />
            </div>
          ))}
        </aside>

        <div className="flex flex-col flex-grow p-2 sm:p-2 lg:p-8 space-y-6 overflow-y-auto">

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <KpiCard
              title="عدد الأجهزة النشطة"
              icon={FaChartBar}
              value={uniqueDevices}
              description="إجمالي الأجهزة التي أرسلت بيانات"
            />
            <KpiCard
              title="إجمالي المواقع المسجلة"
              icon={FaChartBar}
              value={totalEntries}
              description="عدد سجلات المواقع الكلي"
            />
            <KpiCard
              title="أعلى سرعة مسجلة"
              icon={FaChartBar}
              value={`${maxSpeed} كم/س`}
              description="أقصى سرعة تم تسجيلها"
            />
            <KpiCard
              title="متوسط السرعة"
              icon={FaChartBar}
              value={`${avgSpeed} كم/س`}
              description="المتوسط العام للسرعة"
            />
          </div>

          {/* Placeholder grid sections below remain unchanged */}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-[#393E46]/30 backdrop-blur-sm rounded-xl shadow-lg p-4 border border-[#00ADB5]/20 h-80"></div>
            <div className="bg-[#393E46]/30 backdrop-blur-sm rounded-xl shadow-lg p-4 border border-[#00ADB5]/20 h-80"></div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-2 mt-2">
            <div className="bg-[#393E46]/30 backdrop-blur-sm rounded-xl shadow-lg p-4 border border-[#00ADB5]/20 h-full"></div>
            <div className="bg-[#393E46]/30 backdrop-blur-sm rounded-xl shadow-lg p-4 border border-[#00ADB5]/20 h-96">
              <div className="bg-[#393E46]/30 backdrop-blur-sm rounded-xl shadow-lg p-2 border border-[#00ADB5]/20 h-96 mt-18"></div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-2 mt-2">
            <div className="bg-[#393E46]/30 backdrop-blur-sm rounded-xl shadow-lg p-2 border border-[#00ADB5]/20 h-96"></div>
            <div className="bg-[#393E46]/30 backdrop-blur-sm rounded-xl shadow-lg p-2 border border-[#00ADB5]/20 h-96"></div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RadioPage;