import React, { useMemo, useState } from 'react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell, PieChart, Pie, Legend, ComposedChart, Line,
} from 'recharts';
import {
  DollarSign, Wallet, Briefcase, Zap, Lightbulb, Trophy, Cloud
} from 'lucide-react';
import { SaleRecord } from '../types';
import StatCard from './StatCard';
import ChurnAlert from './ChurnAlert';

interface DashboardProps {
  data: SaleRecord[];
}

type ViewType = 'daily' | 'weekly' | 'monthly';

// Market Intelligence Database
const MARKET_INSIGHTS: Record<number, { title: string; events: string[]; tips: string }> = {
  1: { title: '새해 맞이 및 겨울 시즌', events: ['설날', '코트 수선'], tips: '겨울 아우터 수선과 신년 맞이 클리닝 프로모션 준비' },
  2: { title: '졸업/입학 시즌', events: ['졸업/입학', '발렌타인'], tips: '오래된 가방 리폼 및 선물 수요 공략' },
  3: { title: 'S/S 시즌 시작', events: ['봄맞이', '화이트데이'], tips: '겨울 묵은 때 제거 프리미엄 클리닝 패키지' },
  4: { title: '나들이 시즌', events: ['웨딩', '야외활동'], tips: '밝은색상 가방 이염 복원 및 코팅 서비스 강조' },
  5: { title: '가정의 달 & 웨딩', events: ['어버이날', '결혼식'], tips: '부모님 명품 복원 "효도 수선" 마케팅' },
  6: { title: '초여름 대비', events: ['샌들 수선', '장마대비'], tips: '장마철 가죽 손상 방지 발수 코팅 제안' },
  7: { title: '장마철 집중', events: ['습기', '곰팡이'], tips: '곰팡이 제거 및 빗물 얼룩 복원 접수 급증' },
  8: { title: '한여름 휴가', events: ['휴가 손상', '오염'], tips: '휴가지 스크래치/오염 제거 "애프터 바캉스 케어"' },
  9: { title: 'F/W 시즌 개막', events: ['추석', '가죽자켓'], tips: '가을/겨울 대비 가죽 자켓 염색 및 부츠 보강' },
  10: { title: '가을 성수기', events: ['단풍놀이', '결혼식'], tips: '연중 객단가 최고 시기, 전체 복원 작업 집중' },
  11: { title: '겨울 준비', events: ['부츠', '블프'], tips: '겨울 부츠 수선 및 연말 모임 대비 급행 서비스' },
  12: { title: '연말 홀리데이', events: ['크리스마스', '선물'], tips: '연말 선물용 리폼 및 새해 맞이 정비 수요' },
  13: { title: '연간 분석', events: [], tips: '전체적인 흐름 파악' }
};

const COLORS = ['#0f172a', '#334155', '#475569', '#64748b', '#94a3b8', '#cbd5e1']; // Slate Scale

const Dashboard: React.FC<DashboardProps> = ({ data }) => {
  const [selectedYear, setSelectedYear] = useState<number | 'all'>(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState<number | 'all'>('all');
  const [viewType, setViewType] = useState<ViewType>('monthly');

  const availableYears = useMemo(() => {
    const years = new Set(data.map((d) => d.year));
    return Array.from(years).sort((a: number, b: number) => b - a);
  }, [data]);

  const filteredData = useMemo(() => {
    if (!data || data.length === 0) return [];
    return data.filter((d) => {
      const yearMatch = selectedYear === 'all' || d.year === selectedYear;
      const monthMatch = selectedMonth === 'all' || d.month === selectedMonth;
      return yearMatch && monthMatch;
    });
  }, [data, selectedYear, selectedMonth]);

  const currentInsight = useMemo(() => {
    const monthToShow = selectedMonth === 'all' ? new Date().getMonth() + 1 : selectedMonth;
    return MARKET_INSIGHTS[monthToShow as number] || MARKET_INSIGHTS[13];
  }, [selectedMonth]);

  const metrics = useMemo(() => {
    const totalRevenue = filteredData.reduce((acc, curr) => acc + curr.sales, 0);
    const totalNetProfit = filteredData.reduce((acc, curr) => acc + curr.netProfit, 0);
    const profitMargin = totalRevenue > 0 ? (totalNetProfit / totalRevenue) * 100 : 0;
    return { totalRevenue, totalNetProfit, profitMargin };
  }, [filteredData]);

  // Data Processing (Simplified for brevity, logic maintained)
  const trendData = useMemo(() => {
    const map: Record<string, { revenue: number; profit: number; sortKey: string | number }> = {};
    filteredData.forEach((item) => {
      let key = '';
      let sortKey: string | number = '';
      if (viewType === 'daily') {
        key = `${item.month}/${item.day}`;
        sortKey = new Date(item.date).getTime();
      } else if (viewType === 'weekly') {
        const d = new Date(item.date);
        const day = d.getDay();
        const diff = d.getDate() - day + (day === 0 ? -6 : 1);
        const weekStart = new Date(d.setDate(diff));
        key = `${weekStart.getMonth() + 1}/${weekStart.getDate()}주`;
        sortKey = weekStart.getTime();
      } else {
        key = `${item.year}.${String(item.month).padStart(2, '0')}`;
        sortKey = item.year * 100 + item.month;
      }
      if (!map[key]) map[key] = { revenue: 0, profit: 0, sortKey };
      map[key].revenue += item.sales;
      map[key].profit += item.netProfit;
    });
    return Object.keys(map).map((k) => ({ name: k, ...map[k] })).sort((a, b) => {
      if (typeof a.sortKey === 'number' && typeof b.sortKey === 'number') return a.sortKey - b.sortKey;
      return String(a.sortKey).localeCompare(String(b.sortKey));
    });
  }, [filteredData, viewType]);

  const weekdayData = useMemo(() => {
    const days = ['일', '월', '화', '수', '목', '금', '토'];
    const stats = days.map((d) => ({ name: d, revenue: 0 }));
    filteredData.forEach((item) => {
      stats[new Date(item.date).getDay()].revenue += item.sales;
    });
    return [...stats.slice(1), stats[0]];
  }, [filteredData]);

  const brandData = useMemo(() => {
    const map: Record<string, number> = {};
    filteredData.forEach(item => { map[item.brand || '기타'] = (map[item.brand || '기타'] || 0) + item.sales; });
    return Object.entries(map).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value).slice(0, 5);
  }, [filteredData]);

  const channelData = useMemo(() => {
    const map: Record<string, { count: number; revenue: number; profit: number }> = {};
    filteredData.forEach((item) => {
      const ch = item.sub_category || '기타';
      if (!map[ch]) map[ch] = { count: 0, revenue: 0, profit: 0 };
      map[ch].count += 1;
      map[ch].revenue += item.sales;
      map[ch].profit += item.netProfit;
    });
    const list = Object.keys(map).map(k => ({
      name: k, ...map[k], margin: map[k].revenue > 0 ? (map[k].profit / map[k].revenue) * 100 : 0
    }));
    return { byCount: [...list].sort((a, b) => b.count - a.count), byProfit: [...list].sort((a, b) => b.profit - a.profit) };
  }, [filteredData]);

  const goalMetrics = useMemo(() => {
    const YEARLY_TARGET = 450_000_000;
    const MONTHLY_TARGET = 37_500_000;
    const today = new Date();
    let target = selectedMonth === 'all' ? YEARLY_TARGET : MONTHLY_TARGET;
    let projection = 0;
    if (selectedMonth !== 'all' && selectedYear === today.getFullYear() && selectedMonth === today.getMonth() + 1) {
      projection = (metrics.totalRevenue / today.getDate()) * new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
    }
    const percent = Math.min(100, Math.round((metrics.totalRevenue / target) * 100));
    return { target, percent, projection, gaugeData: [{ name: 'Achieved', value: metrics.totalRevenue }, { name: 'Remaining', value: Math.max(0, target - metrics.totalRevenue) }] };
  }, [metrics.totalRevenue, selectedYear, selectedMonth]);

  const wordCloudData = useMemo(() => {
    const textMap: Record<string, number> = {};
    const stopWords = ['수선', '및', '전체', '부분', '교체', '가방', '지갑', '등', '백', '작업', '복원', '염색'];
    filteredData.forEach(item => {
      item.description.split(/[\s,/+]+/).forEach(w => {
        const clean = w.trim();
        if (clean.length > 1 && !stopWords.includes(clean) && !/^\d/.test(clean)) textMap[clean] = (textMap[clean] || 0) + 1;
      });
    });
    return Object.entries(textMap).map(([text, value]) => ({ text, value })).sort((a, b) => b.value - a.value).slice(0, 15);
  }, [filteredData]);



  if (!data || data.length === 0) return <div className="p-20 text-center"><p className="text-slate-500 font-medium">데이터가 없습니다.</p></div>;
  const monthLabel = selectedMonth === 'all' ? new Date().getMonth() + 1 : selectedMonth;

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-12 font-sans text-slate-900">
      {/* 1. Market Insight (Callout Style) */}
      <div className="flex items-start gap-4 p-5 bg-slate-50 rounded-xl border border-slate-200">
        <div className="p-2 bg-white rounded-lg text-slate-900 border border-slate-200 mt-0.5 shadow-sm">
          <Lightbulb size={20} />
        </div>
        <div>
          <h3 className="text-base font-bold mb-1">{monthLabel}월 인사이트: {currentInsight?.title}</h3>
          <p className="text-sm text-slate-600 mb-3 leading-relaxed">{currentInsight?.tips}</p>
          <div className="flex flex-wrap gap-2">
            {currentInsight?.events?.map((event, i) => (
              <span key={i} className="text-xs font-semibold px-2.5 py-1 bg-white border border-slate-200 text-slate-600 rounded-md">
                {event}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* 2. Header & Controls */}
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6">
        <div>
          <h2 className="text-2xl font-[800] tracking-tight">Dashboard</h2>
          <p className="text-sm text-slate-500 font-medium mt-1">Business Overview</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex bg-slate-100 p-1 rounded-lg">
            {(['daily', 'weekly', 'monthly'] as const).map((type) => (
              <button key={type} onClick={() => setViewType(type)} className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all ${viewType === type ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}>
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </button>
            ))}
          </div>
          <div className="h-6 w-px bg-slate-200 hidden sm:block" />
          <select value={selectedYear} onChange={(e) => { setSelectedYear(e.target.value === 'all' ? 'all' : Number(e.target.value)); if (e.target.value === 'all') setSelectedMonth('all'); }} className="px-3 py-2 rounded-lg bg-white border border-slate-200 text-sm font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-900/10">
            <option value="all">Year: All</option>
            {availableYears.map((y) => <option key={y} value={y}>{y}</option>)}
          </select>
          <select value={selectedMonth} disabled={selectedYear === 'all'} onChange={(e) => setSelectedMonth(e.target.value === 'all' ? 'all' : Number(e.target.value))} className={`px-3 py-2 rounded-lg bg-white border border-slate-200 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-slate-900/10 ${selectedYear === 'all' ? 'opacity-50 cursor-not-allowed' : 'text-slate-700'}`}>
            <option value="all">Month: All</option>
            {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => <option key={m} value={m}>{m}월</option>)}
          </select>
        </div>
      </div>

      {/* 3. Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Revenue" value={`₩ ${(metrics.totalRevenue / 10000).toLocaleString()}만`} subValue="Gross Sales" icon={DollarSign} trend="up" trendValue="Sales" />
        <StatCard title="Net Profit" value={`₩ ${(metrics.totalNetProfit / 10000).toLocaleString()}만`} subValue={`Margin: ${metrics.profitMargin.toFixed(1)}%`} icon={Wallet} trend="up" trendValue="Profit" />
        <StatCard title="Top Brand" value={brandData[0]?.name || '-'} subValue="Highest Volume" icon={Briefcase} />
        <StatCard title="Efficiency (ASP)" value={`₩ ${Math.round(metrics.totalRevenue / (filteredData.length || 1) / 10000)}만`} subValue="Avg Ticket" icon={Zap} />
      </div>

      {/* 4. Main Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-base font-bold">Revenue Trend</h3>
          </div>
          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0f172a" stopOpacity={0.1} />
                    <stop offset="95%" stopColor="#0f172a" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                <XAxis dataKey="name" stroke="transparent" tick={{ fontSize: 11, fill: '#94a3b8', fontWeight: 600 }} tickLine={false} dy={10} minTickGap={30} />
                <YAxis tickFormatter={(v) => `${(v / 10000).toFixed(0)}`} stroke="transparent" tick={{ fontSize: 11, fill: '#94a3b8' }} tickLine={false} />
                <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', fontFamily: 'sans-serif', fontSize: '12px' }} formatter={(val: number) => [`₩ ${val.toLocaleString()}`, 'Revenue']} itemStyle={{ color: '#0f172a' }} />
                <Area type="monotone" dataKey="revenue" stroke="#0f172a" strokeWidth={2} fillOpacity={1} fill="url(#colorRev)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="flex flex-col gap-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col">
            <h3 className="text-base font-bold mb-4">Weekly Pattern</h3>
            <div className="flex-1 w-full min-h-[180px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weekdayData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 600 }} dy={10} />
                  <Tooltip cursor={{ fill: '#f1f5f9' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.08)', fontSize: '12px' }} formatter={(val: number) => [`₩ ${val.toLocaleString()}`, '']} />
                  <Bar dataKey="revenue" radius={[4, 4, 4, 4]}>
                    {weekdayData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={index >= 5 ? '#94a3b8' : '#334155'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <ChurnAlert data={filteredData} />
        </div>
      </div>

      {/* 5. Metrics & Word Cloud */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col relative overflow-hidden">
          <div className="mb-4 flex justify-between items-start">
            <div>
              <h3 className="text-lg font-bold flex items-center gap-2"><Trophy size={18} className="text-amber-500" /> Goal & Forecast</h3>
              <p className="text-xs text-slate-500 mt-1 font-medium">{selectedMonth === 'all' ? 'Annual Target: 4.5억' : 'Monthly Target: 3,750만'}</p>
            </div>
            <div className="text-right">
              <p className="text-3xl font-[900] text-slate-900">{goalMetrics.percent}%</p>
              <p className="text-xs text-slate-400 font-medium">Achieved</p>
            </div>
          </div>
          <div className="flex-1 relative flex items-center justify-center min-h-[160px]">
            {/* Simplified Progress Bar instead of Pie for cleaner look */}
            <div className="w-full space-y-4">
              <div className="h-4 w-full bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-slate-900 rounded-full transition-all duration-1000 ease-out" style={{ width: `${goalMetrics.percent}%` }}></div>
              </div>
              {goalMetrics.projection > 0 && (
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-xs font-bold text-slate-500 uppercase">Projection</span>
                  <span className={`text-sm font-bold ${goalMetrics.projection >= goalMetrics.target ? 'text-emerald-600' : 'text-slate-600'}`}>
                    ₩ {Math.round(goalMetrics.projection).toLocaleString()}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <h3 className="text-lg font-bold flex items-center gap-2 mb-4"><Cloud size={18} className="text-slate-400" /> Keywords</h3>
          <div className="flex flex-wrap gap-2">
            {wordCloudData.map((item, index) => (
              <span key={index} className="px-3 py-1.5 bg-slate-50 border border-slate-100 rounded-lg text-sm font-semibold text-slate-600">
                {item.text} <span className="text-xs text-slate-400 ml-1">{item.value}</span>
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* 6. Channel Analysis & Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <h3 className="text-lg font-bold mb-6">Channel Volume</h3>
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={channelData.byCount} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="count" stroke="none">
                  {channelData.byCount.map((_, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                </Pie>
                <Tooltip formatter={(val: number) => [`${val}건`, 'Orders']} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                <Legend verticalAlign="middle" align="right" layout="vertical" iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <h3 className="text-lg font-bold mb-6">Channel Profitability</h3>
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={channelData.byProfit} margin={{ top: 20, right: 20, bottom: 20, left: 0 }}>
                <CartesianGrid stroke="#f5f5f5" vertical={false} />
                <XAxis dataKey="name" scale="band" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis yAxisId="left" tickFormatter={(v) => `${(v / 10000).toFixed(0)}`} tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis yAxisId="right" orientation="right" tickFormatter={(v) => `${v}%`} tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                <Bar yAxisId="left" dataKey="profit" barSize={24} radius={[4, 4, 0, 0]} fill="#334155" />
                <Line yAxisId="right" type="monotone" dataKey="margin" stroke="#94a3b8" strokeWidth={2} dot={{ r: 3, fill: '#fff', strokeWidth: 2 }} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

    </div>
  );
};

export default Dashboard;
