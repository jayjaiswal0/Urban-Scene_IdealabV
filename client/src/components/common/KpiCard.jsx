import React from 'react';

export const KpiCard = ({ title, value, subtitle, icon: Icon, color = 'blue', trend, onClick }) => {
  const colorMap = {
    blue: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
    amber: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
    emerald: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
    purple: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20',
    rose: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20',
  };

  return (
    <div
      onClick={onClick}
      className={`p-5 rounded-2xl bg-white dark:bg-[#131b2e] border border-slate-200 dark:border-white/10 shadow-sm transition-all hover:shadow-md ${
        onClick ? 'cursor-pointer hover:border-blue-400 dark:hover:border-blue-500/50' : ''
      }`}
    >
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-slate-500 dark:text-slate-400">{title}</span>
        {Icon && (
          <div className={`p-2.5 rounded-xl border ${colorMap[color] || colorMap.blue}`}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>
      <div className="mt-3 flex items-baseline gap-2">
        <span className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100 tnum">
          {value}
        </span>
        {trend && (
          <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
            {trend}
          </span>
        )}
      </div>
      {subtitle && (
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 truncate">{subtitle}</p>
      )}
    </div>
  );
};

export default KpiCard;
