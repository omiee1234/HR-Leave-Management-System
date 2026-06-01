import React from 'react';

const DashboardCard = ({ title, value, max, icon: Icon, colorClass }) => {
  // Calculate percentage of leave days remaining to represent in progress bar
  const percentage = max ? Math.max(0, Math.min(100, (value / max) * 100)) : 0;
  
  return (
    <div className="glass-card rounded-2xl p-6 relative overflow-hidden group hover:scale-[1.02] transition-all duration-300 shadow-lg border border-slate-850">
      
      {/* Background glow hover effect */}
      <div className={`absolute -right-10 -top-10 h-32 w-32 rounded-full blur-3xl opacity-10 group-hover:scale-150 transition-all duration-500 ${colorClass}`}></div>

      <div className="flex justify-between items-start mb-4">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">{title}</span>
          <h3 className="text-4xl font-extrabold text-white mt-1">{value}</h3>
          {max && <span className="text-[10px] text-slate-500">out of {max} days allocated</span>}
        </div>
        <div className={`p-3 rounded-xl ${colorClass} bg-opacity-10 text-white border border-white/5`}>
          <Icon className="h-6 w-6" />
        </div>
      </div>

      {/* Micro Progress Bar */}
      {max && (
        <div className="w-full bg-slate-800/80 rounded-full h-1.5 mt-6 border border-slate-700/30 overflow-hidden">
          <div 
            className={`h-full rounded-full transition-all duration-500 ${colorClass}`}
            style={{ width: `${percentage}%` }}
          ></div>
        </div>
      )}
      
    </div>
  );
};

export default DashboardCard;
