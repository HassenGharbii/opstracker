// KpiCard.js
import React from 'react';

function KpiCard({ title, icon: Icon, value, description }) {
  return (
    <div className="bg-[#393E46]/30 backdrop-blur-sm rounded-xl shadow-lg p-4 h-32 flex flex-col justify-between transform hover:scale-105 hover:shadow-2xl transition-all duration-300 ease-in-out border border-[#00ADB5]/20">
      <div className="text-lg font-semibold text-white">{title}</div>
      <div className="flex items-center space-x-3 mt-2">
        {Icon && <Icon className="text-[#00ADB5] text-3xl transform hover:scale-110 transition-all" />}
        <div className="text-3xl font-bold text-[#00ADB5]">{value}</div>
      </div>
      <div className="text-sm text-[#EEEEEE]/80 mt-1">{description}</div>
    </div>
  );
}

export default KpiCard;
