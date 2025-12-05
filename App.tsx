// App.tsx
import React, { useState } from 'react';
import Papa from 'papaparse';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import SalesTable from './components/SalesTable';
import Analytics from './components/Analytics';
import { SaleRecord } from './types';
import { Menu, Search, Bell, Lock, AlertCircle, Loader2 } from 'lucide-react';

/**
 * ====== 헬퍼 함수들 ======
 */

// 공백/줄바꿈 정리
const cleanString = (value?: string | null): string => {
  if (!value) return '';
  return String(value).replace(/\r?\n/g, ' ').trim();
};

// 날짜에서 연/월/일만 뽑기
// 예) "2024. 11. 1", "2024-11-01", "2024/11/01", "2024년 11월 1일"
// 전부 다: year=2024, month=11, day=1 로 강제 파싱
const parseDateParts = (raw?: string | null) => {
  const v = cleanString(raw);
  if (!v) return null;

  // "2024 무언가 11 무언가 1" 패턴만 잡으면 됨
  const m = v.match(/^(\d{4})\D+(\d{1,2})\D+(\d{1,2})?/);
  if (!m) return null;

  const year = Number(m[1]);
  const month = Number(m[2]);
  const day = m[3] ? Number(m[3]) : 1;

  if (!year || !month) return null;

  const mm = String(month).padStart(2, '0');
  const dd = String(day).padStart(2, '0');
  const display = `${year}-${mm}-${dd}`; // "2024-11-01"

  return { year, month, day, display };
};

// "김수아 [C / 수아]" → "김수아"
const cleanName = (raw?: string | null): string => {
  const base = cleanString(raw);
  const beforeBracket = base.split('[')[0];
  return beforeBracket.trim();
};

// 콤마/공백 제거 후 숫자 변환 (190,000 / "-50,000" 등)
const parseNumeric = (v: any): number => {
  if (v == null) return 0;
  const s = String(v).replace(/[^0-9.-]/g, '').trim();
  const n = Number(s);
  return isNaN(n) ? 0 : n;
};

const App: React.FC = () => {
  // Login State
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [loginError, setLoginError] = useState(false);

  // Data State
  const [currentView, setCurrentView] =
    useState<'dashboard' | 'list' | 'analytics'>('dashboard');
  const [salesData, setSalesData] = useState<SaleRecord[]>([]);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // Login Handler
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordInput === '0920') {
      setIsAuthenticated(true);
      fetchData();
    } else {
      setLoginError(true);
    }
  };

  // Google Sheet 연동
  const fetchData = () => {
    setIsLoading(true);
    setFetchError(null);

    let csvUrl: string;

    // 1) 로컬 개발 환경 (npm run dev)
    if (import.meta.env.DEV) {
      // dev에서는 CORS 프록시 + 원본 시트 URL 사용
      const RAW_SHEET_URL =
        'https://docs.google.com/spreadsheets/d/e/2PACX-1vSJIxq1RhvmU98aYusFWpwKcxuPu5c9wyJD2gVEQkx97CO0mThZTWgVi3dcOAiGSr2bupsuA_SqJFzI/pub?output=csv';
      const PROXY_PREFIX = 'https://cors.isomorphic-git.org/';
      csvUrl = `${PROXY_PREFIX}${RAW_SHEET_URL}`;
    } else {
      // 2) Vercel 배포 환경: 서버리스 함수 사용
      csvUrl = '/api/sheet';
    }

    Papa.parse(csvUrl, {
      download: true,
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        try {
          const parsedRecords: SaleRecord[] = (results.data as any[])
            .map((row: any, index: number) => {
              // 1) 날짜 파싱
              const rawDate = row.date || row.Date || row.날짜 || '';
              const dateParts = parseDateParts(rawDate);
              if (!dateParts) {
                // 날짜 완전 이상하면 이 행 버림
                return null;
              }
              const { year, month, day, display } = dateParts;

              // 2) 금액 파싱 (F열: 매출, G열: 외주비)
              const sales = parseNumeric(row.sales || row.매출 || '0');
              const cost = parseNumeric(row.cost || row.지출 || '0');

              return {
                id: `row-${index}`,
                date: display, // "YYYY-MM-DD"
                year,
                month,
                day,
                category: cleanString(row.category) || '기타',
                sub_category: cleanString(row.sub_category) || '기타',
                brand: cleanString(row.brand) || 'Others',
                description: cleanString(row.description),
                sales,
                cost,
                // ★ 순이익 = 매출(F) + 외주비(G, 시트에서 -50,000 형태라고 하셨으니 그대로 더함)
                netProfit: sales + cost,
                customer_name: cleanName(row.customer_name),
                phone: cleanString(row.phone),
              };
            })
            // null(날짜 이상) 제거 + 완전 빈 줄 제거
            .filter(
              (r): r is SaleRecord =>
                !!r && (r.sales !== 0 || r.category !== ''),
            );

          setSalesData(parsedRecords);
        } catch (err) {
          console.error('Processing Error:', err);
          setFetchError('데이터 처리 중 오류가 발생했습니다.');
        } finally {
          setIsLoading(false);
        }
      },
      error: (err) => {
        console.error('CSV Fetch Error:', err);
        setFetchError(
          '데이터를 불러오는데 실패했습니다. (시트 주소 또는 API 설정을 확인해주세요.)',
        );
        setIsLoading(false);
      },
    });
  };

  // ================== Login Screen ==================
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 relative overflow-hidden">
        {/* Background Effects */}
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-blue-600/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-amber-600/10 rounded-full blur-[120px]" />

        <div className="bg-white/10 backdrop-blur-xl p-8 sm:p-12 rounded-3xl shadow-2xl border border-white/10 w-full max-w-md relative z-10 animate-in fade-in zoom-in duration-500">
          <div className="flex flex-col items-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-amber-400 to-amber-600 rounded-2xl flex items-center justify-center shadow-lg shadow-amber-900/30 mb-4">
              <Lock className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">
              ARTIMILANO Admin
            </h1>
            <p className="text-slate-400 text-sm mt-2">
              보안 접속을 위해 암호를 입력하세요.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <input
                type="password"
                value={passwordInput}
                onChange={(e) => {
                  setPasswordInput(e.target.value);
                  setLoginError(false);
                }}
                className={`w-full px-4 py-3.5 bg-slate-800/50 border ${
                  loginError ? 'border-rose-500' : 'border-slate-600'
                } rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all text-center tracking-[0.5em] font-bold text-lg`}
                placeholder="••••"
                maxLength={4}
                autoFocus
              />
              {loginError && (
                <div className="flex items-center justify-center gap-2 mt-2 text-rose-400 text-xs font-medium animate-pulse">
                  <AlertCircle size={12} />
                  암호가 올바르지 않습니다.
                </div>
              )}
            </div>
            <button
              type="submit"
              className="w-full py-3.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow-lg shadow-blue-900/30 transition-all active:scale-[0.98]"
            >
              대시보드 접속
            </button>
          </form>
          <div className="mt-8 text-center">
            <p className="text-[10px] text-slate-500 uppercase tracking-widest">
              Premium Repair Service
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ================== Fetch Error Screen ==================
  if (fetchError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center p-8 bg-white rounded-2xl shadow-xl border border-slate-100 max-w-md">
          <AlertCircle className="w-12 h-12 text-rose-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-slate-900 mb-2">
            데이터 연동 실패
          </h2>
          <p className="text-slate-500 mb-6 text-sm">{fetchError}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-slate-900 text-white rounded-lg text-sm font-medium hover:bg-slate-800"
          >
            다시 시도
          </button>
        </div>
      </div>
    );
  }

  // ================== Main App ==================
  return (
    <div className="flex min-h-screen bg-[#f8fafc] font-sans">
      {/* Sidebar for Desktop */}
      <Sidebar currentView={currentView} onNavigate={setCurrentView} />

      {/* Main Content */}
      <div className="flex-1 md:ml-72 transition-all duration-300 flex flex-col min-h-screen">
        {/* Top Header Bar */}
        <header className="bg-white/80 backdrop-blur-md sticky top-0 z-30 border-b border-slate-200/60 px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4 md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 -ml-2 text-slate-600 hover:bg-slate-100 rounded-lg"
            >
              <Menu size={24} />
            </button>
            <span className="font-bold text-slate-800 tracking-tight">
              ARTIMILANO
            </span>
          </div>

          <div className="hidden md:flex flex-col">
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              {currentView === 'dashboard'
                ? '경영 현황 대시보드'
                : currentView === 'analytics'
                ? '고객 및 트렌드 분석'
                : '상세 매출 장부'}
            </h1>
            <p className="text-xs text-slate-500 font-medium">
              마스터 장인을 위한 실시간 비즈니스 인사이트
            </p>
          </div>

          <div className="flex items-center gap-3 sm:gap-4">
            <div className="hidden md:flex items-center bg-slate-100/50 rounded-full px-4 py-2 border border-slate-200 focus-within:ring-2 ring-blue-500/20 focus-within:border-blue-500 transition-all">
              <Search size={16} className="text-slate-400" />
              <input
                type="text"
                placeholder="고객명, 전화번호 검색..."
                className="bg-transparent border-none focus:outline-none text-sm ml-2 w-32 lg:w-48 text-slate-600 placeholder:text-slate-400"
              />
            </div>
            <button className="relative p-2 text-slate-500 hover:bg-slate-100 rounded-full transition-colors">
              <Bell size={22} />
              <span className="absolute top-1.5 right-2 w-2 h-2 bg-rose-500 rounded-full border-2 border-white" />
            </button>
            <div className="w-8 h-8 rounded-full bg-slate-700 border-2 border-white shadow-sm flex items-center justify-center text-xs text-white font-bold md:hidden">
              CF
            </div>
          </div>
        </header>

        {/* Mobile Menu Dropdown */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-slate-900 text-white absolute top-[64px] w-full z-40 shadow-xl border-t border-slate-800 animate-in slide-in-from-top-2 duration-200">
            <div className="p-4 border-b border-slate-800">
              <p className="text-xs text-slate-400 uppercase font-bold mb-2">
                메뉴 바로가기
              </p>
              <button
                onClick={() => {
                  setCurrentView('dashboard');
                  setIsMobileMenuOpen(false);
                }}
                className={`block w-full text-left p-4 rounded-xl mb-2 transition-colors ${
                  currentView === 'dashboard'
                    ? 'bg-blue-600 font-bold'
                    : 'hover:bg-slate-800 text-slate-300'
                }`}
              >
                경영 현황 (대시보드)
              </button>
              <button
                onClick={() => {
                  setCurrentView('analytics');
                  setIsMobileMenuOpen(false);
                }}
                className={`block w-full text-left p-4 rounded-xl mb-2 transition-colors ${
                  currentView === 'analytics'
                    ? 'bg-blue-600 font-bold'
                    : 'hover:bg-slate-800 text-slate-300'
                }`}
              >
                고객 및 트렌드 분석
              </button>
              <button
                onClick={() => {
                  setCurrentView('list');
                  setIsMobileMenuOpen(false);
                }}
                className={`block w-full text-left p-4 rounded-xl transition-colors ${
                  currentView === 'list'
                    ? 'bg-blue-600 font-bold'
                    : 'hover:bg-slate-800 text-slate-300'
                }`}
              >
                상세 매출 장부
              </button>
            </div>
          </div>
        )}

        {/* Content Area */}
        <main className="flex-1 p-3 sm:p-6 md:p-8 max-w-[1600px] w-full mx-auto relative">
          {isLoading ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/50 backdrop-blur-sm z-50">
              <Loader2 className="w-10 h-10 text-blue-600 animate-spin mb-4" />
              <p className="text-slate-600 font-medium">
                Google Sheet 데이터 동기화 중...
              </p>
            </div>
          ) : (
            <>
              {currentView === 'dashboard' ? (
                <Dashboard data={salesData} />
              ) : currentView === 'analytics' ? (
                <Analytics data={salesData} />
              ) : (
                <SalesTable data={salesData} />
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
};

export default App;
