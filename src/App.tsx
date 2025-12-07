import React, { useState, useEffect } from 'react';
import Dashboard from './components/Dashboard';
import Sidebar from './components/Sidebar';
import FileUploader from './components/FileUploader';
import Analytics from './components/Analytics';
import SalesTable from './components/SalesTable';
import QuoteCalculator from './components/QuoteCalculator';
import CrmMarketing from './components/CrmMarketing';
import { SaleRecord } from './types';
import { fetchSheetData } from './services/dataService';
import { Menu, Lock, ArrowRight } from 'lucide-react';

const App: React.FC = () => {
  const [data, setData] = useState<SaleRecord[]>([]);
  const [view, setView] = useState<'dashboard' | 'list' | 'analytics' | 'calculator' | 'crm'>('dashboard');
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [loginError, setLoginError] = useState(false);

  useEffect(() => {
    // Check session storage for existing login
    const isAuth = sessionStorage.getItem('artimilano_auth');
    if (isAuth === 'true') {
      setIsAuthenticated(true);
    }

    // Attempt to load default data
    fetchSheetData()
      .then((records) => {
        if (records.length > 0) setData(records);
      })
      .catch(() => {
        // Silent fail, show uploader
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordInput === '0920') {
      setIsAuthenticated(true);
      setLoginError(false);
      sessionStorage.setItem('artimilano_auth', 'true');
    } else {
      setLoginError(true);
      // Shake animation effect could be added here
    }
  };

  const handleLogout = () => {
    setData([]);
    setView('dashboard');
    // Optional: Logout completely
    setIsAuthenticated(false);
    sessionStorage.removeItem('artimilano_auth');
  };

  // 1. Lock Screen (If not authenticated)
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4 font-sans">
        <div className="bg-white p-8 rounded-3xl shadow-xl w-full max-w-sm text-center border border-slate-200">
          <div className="w-16 h-16 bg-slate-900 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-slate-900/20">
            <Lock className="text-white w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold text-slate-800 mb-2">ARTIMILANO</h1>
          <p className="text-sm text-slate-500 mb-8">관리자 접속 코드를 입력하세요.</p>
          
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="relative">
              <input
                type="password"
                value={passwordInput}
                onChange={(e) => {
                  setPasswordInput(e.target.value);
                  setLoginError(false);
                }}
                className={`w-full px-4 py-3.5 bg-slate-50 border rounded-xl text-center text-lg font-bold tracking-widest focus:outline-none focus:ring-2 transition-all ${
                  loginError 
                    ? 'border-rose-300 focus:ring-rose-200 text-rose-500' 
                    : 'border-slate-200 focus:ring-slate-200 text-slate-800'
                }`}
                placeholder=""
                maxLength={4}
                autoFocus
              />
            </div>
            
            {loginError && (
              <p className="text-xs text-rose-500 font-medium animate-pulse">
                비밀번호가 올바르지 않습니다.
              </p>
            )}

            <button
              type="submit"
              className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 active:scale-[0.98]"
            >
              접속하기 <ArrowRight size={18} />
            </button>
          </form>
          <p className="text-[10px] text-slate-300 mt-8">Secure Admin Access</p>
        </div>
      </div>
    );
  }

  // 2. Loading Screen
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-slate-900"></div>
      </div>
    );
  }

  // 3. File Uploader (If no data)
  if (data.length === 0) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <FileUploader onDataLoaded={setData} />
      </div>
    );
  }

  // 4. Main App
  return (
    <div className="min-h-screen bg-slate-50 flex font-sans text-slate-900 overflow-hidden">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <div className={`fixed inset-y-0 left-0 z-50 transition-transform duration-300 md:relative ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
        <Sidebar 
          currentView={view} 
          onNavigate={(v) => {
            setView(v);
            setSidebarOpen(false);
          }} 
          onLogout={handleLogout}
        />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Mobile Header */}
        <div className="md:hidden bg-white border-b border-slate-200 p-4 flex items-center justify-between shrink-0">
           <h1 className="font-bold text-lg text-slate-800">ARTIMILANO</h1>
           <button onClick={() => setSidebarOpen(true)} className="p-2 rounded-lg bg-slate-100 text-slate-600">
             <Menu size={20} />
           </button>
        </div>

        {/* Scrollable Area */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8 custom-scrollbar">
          <div className="max-w-7xl mx-auto pb-10">
            {view === 'dashboard' && <Dashboard data={data} />}
            {view === 'analytics' && <Analytics data={data} />}
            {view === 'crm' && <CrmMarketing data={data} />}
            {view === 'calculator' && <QuoteCalculator data={data} />}
            {view === 'list' && <SalesTable data={data} />}
          </div>
        </main>
      </div>
    </div>
  );
};

export default App;
