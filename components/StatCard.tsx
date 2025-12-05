import React from 'react';
import { LucideIcon, ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string;
  subValue?: string;
  icon: LucideIcon;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string; // e.g. "+12.5%"
  color?: 'blue' | 'emerald' | 'amber' | 'rose' | 'indigo';
}

const StatCard: React.FC<StatCardProps> = ({ 
  title, 
  value, 
  subValue, 
  icon: Icon, 
  trend = 'neutral',
  trendValue,
  color = 'blue' 
}) => {
  const colorStyles = {
    blue: { bg: 'bg-blue-50', text: 'text-blue-600', iconBg: 'bg-blue-100' },
    emerald: { bg: 'bg-emerald-50', text: 'text-emerald-600', iconBg: 'bg-emerald-100' },
    amber: { bg: 'bg-amber-50', text: 'text-amber-600', iconBg: 'bg-amber-100' },
    rose: { bg: 'bg-rose-50', text: 'text-rose-600', iconBg: 'bg-rose-100' },
    indigo: { bg: 'bg-indigo-50', text: 'text-indigo-600', iconBg: 'bg-indigo-100' },
  }[color];

  return (
    <div className="group relative bg-white rounded-2xl p-5 shadow-[0_2px_10px_-4px_rgba(6,11,40,0.08)] border border-slate-100 hover:shadow-[0_8px_30px_-4px_rgba(6,11,40,0.12)] hover:-translate-y-1 transition-all duration-300">
      <div className="flex justify-between items-start mb-4">
        <div className={`p-3 rounded-xl ${colorStyles.bg} ${colorStyles.text} transition-colors`}>
          <Icon size={24} strokeWidth={2} />
        </div>
        {trendValue && (
          <div className={`flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full ${
            trend === 'up' ? 'bg-emerald-50 text-emerald-600' : 
            trend === 'down' ? 'bg-rose-50 text-rose-600' : 'bg-slate-50 text-slate-500'
          }`}>
            {trend === 'up' && <ArrowUpRight size={14} />}
            {trend === 'down' && <ArrowDownRight size={14} />}
            {trend === 'neutral' && <Minus size={14} />}
            {trendValue}
          </div>
        )}
      </div>
      
      <div>
        <h3 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight mb-1">{value}</h3>
        <p className="text-sm font-medium text-slate-500">{title}</p>
        {subValue && (
          <p className="text-xs text-slate-400 mt-3 pt-3 border-t border-slate-50 break-keep">
            {subValue}
          </p>
        )}
      </div>
    </div>
  );
};

export default StatCard;