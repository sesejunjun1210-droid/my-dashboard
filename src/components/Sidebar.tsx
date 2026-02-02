import React from 'react';
import { LayoutDashboard, FileText, Settings, LogOut, Scissors, LineChart, Calculator, Users, Zap } from 'lucide-react';

interface SidebarProps {
  currentView: 'dashboard' | 'list' | 'analytics' | 'calculator' | 'crm' | 'simulator';
  onNavigate: (view: 'dashboard' | 'list' | 'analytics' | 'calculator' | 'crm' | 'simulator') => void;
  onLogout?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, onNavigate, onLogout }) => {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'analytics', label: 'Analytics', icon: LineChart },
    { id: 'simulator', label: 'Business Simulator', icon: Zap },
    { id: 'crm', label: 'CRM & Marketing', icon: Users },
    { id: 'calculator', label: 'Smart Quote', icon: Calculator },
    { id: 'list', label: 'Transactions', icon: FileText },
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
    </div>
  );
};

export default Sidebar;
