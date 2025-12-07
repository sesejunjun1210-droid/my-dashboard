import React from 'react';
import { LucideIcon, ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  subValue?: string;
  icon: LucideIcon;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
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
    blue: { bg: 'bg-blue-50/80', text: 'text-blue-600', border: 'border-blue-100' },
    emerald: { bg: 'bg-emerald-50/80', text: 'text-emerald-600', border: 'border-emerald-100' },
    amber: { bg: 'bg-amber-50/80', text: 'text-amber-600', border: 'border-amber-100' },
    rose: { bg: 'bg-rose-50/80', text: 'text-rose-600', border: 'border-rose-100' },
    indigo: { bg: 'bg-indigo-50/80', text: 'text-indigo-600', border: 'border-indigo-100' },
  }[color];

  return (
    <div className="group relative bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-md hover:border-slate-200 transition-all duration-300">
      <div className="flex justify-between items-start mb-5">
        <div className={`p-3.5 rounded-2xl ${colorStyles.bg} ${colorStyles.text} transition-colors ring-1 ring-inset ${colorStyles.border}`}>
          <Icon size={22} strokeWidth={2} />
        </div>
        {trendValue && (
          <div className={`flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full ${
            trend === 'up' ? 'bg-emerald-50 text-emerald-600' : 
            trend === 'down' ? 'bg-rose-50 text-rose-600' : 'bg-slate-50 text-slate-500'
          }`}>
            {trend === 'up' && <ArrowUpRight size={12} />}
            {trend === 'down' && <ArrowDownRight size={12} />}
            {trend === 'neutral' && <Minus size={12} />}
            {trendValue}
          </div>
        )}
      </div>
      
      <div>
        <h3 className="text-3xl font-bold text-slate-900 tracking-tight mb-1.5">{value}</h3>
        <p className="text-sm font-medium text-slate-500">{title}</p>
        {subValue && (
          <p className="text-xs text-slate-400 mt-4 pt-4 border-t border-slate-50 break-keep leading-relaxed">
            {subValue}
          </p>
        )}
      </div>
    </div>
  );
};

export default StatCard;
