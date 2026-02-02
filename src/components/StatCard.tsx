import React from 'react';
import { LucideIcon, ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  subValue?: string;
  icon: LucideIcon;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subValue,
  icon: Icon,
  trend = 'neutral',
  trendValue,
}) => {
  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow duration-200">
      <div className="flex justify-between items-start mb-4">
        <span className="text-sm font-semibold text-slate-500 flex items-center gap-2">
          {title}
        </span>
        <div className="text-slate-300 p-2 bg-slate-50 rounded-lg">
          <Icon size={18} />
        </div>
      </div>

      <div>
        <div className="flex items-baseline gap-2">
          <h3 className="text-3xl font-[800] text-slate-900 tracking-tight">{value}</h3>
        </div>

        {(subValue || trendValue) && (
          <div className="flex items-center gap-3 mt-2">
            {trendValue && (
              <div className={`flex items-center gap-0.5 text-xs font-bold px-1.5 py-0.5 rounded ${trend === 'up' ? 'bg-emerald-50 text-emerald-600' :
                  trend === 'down' ? 'bg-rose-50 text-rose-600' : 'bg-slate-50 text-slate-500'
                }`}>
                {trend === 'up' && <ArrowUpRight size={12} />}
                {trend === 'down' && <ArrowDownRight size={12} />}
                {trendValue}
              </div>
            )}
            {subValue && (
              <p className="text-xs text-slate-400 font-medium tracking-tight truncate">
                {subValue}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default StatCard;
