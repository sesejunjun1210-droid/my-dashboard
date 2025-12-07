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
import { Menu } from 'lucide-react';

const App: React.FC = () => {
  const [data, setData] = useState<SaleRecord[]>([]);
  const [view, setView] = useState<'dashboard' | 'list' | 'analytics' | 'calculator' | 'crm'>('dashboard');
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
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

  const handleLogout = () => {
    setData([]);
    setView('dashboard');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-slate-900"></div>
      </div>
    );
  }

  // If no data, show upload screen
  if (data.length === 0) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <FileUploader onDataLoaded={setData} />
      </div>
    );
  }

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
           <button onClick={() => setSidebarOpen(true)} className="p-2 rounded-lg bg-slate-100">
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