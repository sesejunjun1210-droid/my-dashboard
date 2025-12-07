import React from 'react';
import { LayoutDashboard, FileText, Settings, LogOut, Scissors, LineChart, Calculator, Users } from 'lucide-react';

interface SidebarProps {
  currentView: 'dashboard' | 'list' | 'analytics' | 'calculator' | 'crm';
  onNavigate: (view: 'dashboard' | 'list' | 'analytics' | 'calculator' | 'crm') => void;
  onLogout?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, onNavigate, onLogout }) => {
  const navItems = [
    { id: 'dashboard', label: '경영 현황 (Dashboard)', icon: LayoutDashboard },
    { id: 'analytics', label: '매출 분석 및 예측', icon: LineChart },
    { id: 'crm', label: 'CRM 마케팅', icon: Users },
    { id: 'calculator', label: 'AI 스마트 견적 계산', icon: Calculator },
    { id: 'list', label: '상세 매출 장부', icon: FileText },
  ];

  return (
    <div className="hidden md:flex flex-col w-72 bg-[#0f172a] h-full font-sans border-r border-slate-800 text-white shadow-2xl z-50">
      {/* Brand Section */}
      <div className="flex items-center gap-4 p-8 border-b border-slate-800/50">
        <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-amber-600 rounded-xl flex items-center justify-center shadow-lg shadow-amber-900/20">
          <Scissors className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-lg font-bold tracking-tight text-slate-100">ARTIMILANO</h1>
          <p className="text-[11px] opacity-80 text-amber-500 font-semibold mt-0.5">프리미엄 명품 수선</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-8 space-y-1">
        <div className="px-4 mb-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">메뉴</div>
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onNavigate(item.id as any)}
            className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-lg text-sm font-medium transition-all duration-200 group ${
              currentView === item.id
                ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-md shadow-blue-900/20'
                : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'
            }`}
          >
            <item.icon size={18} className={currentView === item.id ? 'text-white' : 'text-slate-500 group-hover:text-slate-300'} />
            <span>{item.label}</span>
            {currentView === item.id && (
              <div className="ml-auto w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_8px_rgba(255,255,255,0.8)]" />
            )}
          </button>
        ))}
      </nav>

      {/* User Profile / Bottom */}
      <div className="p-4 border-t border-slate-800 bg-slate-900/50">
        <div className="flex items-center gap-3 px-4 py-2 mb-2">
          <div className="w-8 h-8 rounded-full bg-slate-700 border border-slate-600 flex items-center justify-center text-xs font-bold text-slate-300">
            AM
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-slate-200">아르티밀라노</p>
            <p className="text-xs text-slate-500">Master Artisan</p>
          </div>
          <Settings size={16} className="text-slate-500 hover:text-white cursor-pointer" />
        </div>
        <button 
          onClick={onLogout}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 mt-2 text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
        >
          <LogOut size={14} />
          <span>초기화 (새 파일)</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;