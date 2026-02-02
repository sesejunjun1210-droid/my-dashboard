import React from 'react';
import { LayoutDashboard, FileText, Settings, LogOut, Scissors, LineChart, Calculator, Users, Zap, Lightbulb } from 'lucide-react';
import { MARKET_INSIGHTS } from '../constants';

interface SidebarProps {
  currentView: 'dashboard' | 'list' | 'analytics' | 'calculator' | 'crm' | 'simulator' | 'retention';
  onNavigate: (view: 'dashboard' | 'list' | 'analytics' | 'calculator' | 'crm' | 'simulator' | 'retention') => void;
  onLogout?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, onNavigate, onLogout }) => {
  const navItems = [
    { id: 'dashboard', label: '대시보드', icon: LayoutDashboard },
    { id: 'analytics', label: '통계 분석', icon: LineChart },
    { id: 'simulator', label: '비즈니스 시뮬레이터', icon: Zap },
    { id: 'crm', label: 'CRM & 마케팅', icon: Users },
    { id: 'retention', label: '리텐션 센터', icon: Zap }, // New
    { id: 'calculator', label: '스마트 견적', icon: Calculator },
    { id: 'list', label: '거래 내역', icon: FileText },
  ];

  return (
    <div className="flex flex-col w-full md:w-72 h-full font-sans z-50 glass">
      {/* Brand Section */}
      <div className="flex items-center gap-3 p-6 mt-2">
        <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center shadow-lg shadow-slate-900/20">
          <Scissors className="w-4 h-4 text-white" />
        </div>
        <div>
          <h1 className="text-base font-bold tracking-tight text-slate-900">ARTIMILANO</h1>
          <p className="text-[10px] text-slate-500 font-medium opacity-80 tracking-wide">Premium Repair Admin</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-6 space-y-0.5">
        <div className="px-3 mb-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest opacity-80">Menu</div>
        {navItems.map((item) => {
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id as any)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group ${isActive
                ? 'bg-slate-900/5 text-slate-900'
                : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'
                }`}
            >
              <item.icon
                size={18}
                className={`transition-colors ${isActive ? 'text-slate-900' : 'text-slate-400 group-hover:text-slate-600'}`}
                strokeWidth={isActive ? 2.5 : 2}
              />
              <span className={isActive ? 'font-semibold' : 'font-normal'}>{item.label}</span>
              {isActive && (
                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-slate-900" />
              )}
            </button>
          );
        })}
      </nav>



      {/* Seasonal Focus */}
      <div className="px-4 mb-4">
        <div className="bg-gradient-to-br from-indigo-50 to-blue-50 border border-blue-100 rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <Lightbulb size={14} className="text-blue-600" />
            <h3 className="text-xs font-bold text-blue-900">
              {new Date().getMonth() + 1}월의 주요 이벤트
            </h3>
          </div>
          <div className="space-y-2">
            {MARKET_INSIGHTS[new Date().getMonth() + 1]?.events.map((event, i) => (
              <div key={i} className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                <span className="text-xs text-slate-600 font-medium">{event}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* User Profile / Bottom */}
      <div className="p-4 bg-white/40 border-t border-slate-200/50 backdrop-blur-sm">
        <div className="flex items-center gap-3 px-2 py-2 mb-1">
          <div className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center text-xs font-bold text-slate-600 shadow-sm">
            AM
          </div>
          <div className="flex-1">
            <p className="text-xs font-bold text-slate-800">Master Artisan</p>
            <p className="text-[10px] text-slate-400">artimilano.admin</p>
          </div>
          <button className="p-1.5 rounded-md hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors">
            <Settings size={14} />
          </button>
        </div>
        <button
          onClick={onLogout}
          className="w-full flex items-center justify-center gap-1.5 px-3 py-2 mt-2 text-[11px] font-bold text-slate-500 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
        >
          <LogOut size={12} />
          <span>Sign Out</span>
        </button>
      </div>
    </div >
  );
};

export default Sidebar;
