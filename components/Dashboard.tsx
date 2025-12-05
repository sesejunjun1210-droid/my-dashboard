
import React, { useMemo, useState } from 'react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  BarChart, Bar, Cell
} from 'recharts';
import { DollarSign, Wallet, TrendingUp, Briefcase, Zap, Calendar, Filter, Lightbulb, Info } from 'lucide-react';
import { SaleRecord } from '../types';
import StatCard from './StatCard';

interface DashboardProps {
  data: SaleRecord[];
}

type ViewType = 'daily' | 'weekly' | 'monthly';

// Market Intelligence Database
const MARKET_INSIGHTS: Record<number, { title: string; events: string[]; tips: string }> = {
  1: {
    title: "새해 맞이 및 겨울 시즌",
    events: ["설날 선물 준비 수요", "겨울철 코트/패딩 수선 증가", "새해 맞이 가방 클리닝"],
    tips: "겨울 아우터 수선과 신년 맞이 클리닝 프로모션을 준비하세요."
  },
  2: {
    title: "졸업/입학 및 발렌타인",
    events: ["졸업/입학 선물 리폼", "발렌타인데이 선물 준비", "겨울 시즌 오프"],
    tips: "오래된 가방을 리폼하여 선물하는 수요를 공략해보세요."
  },
  3: {
    title: "S/S 시즌 시작 & 봄맞이",
    events: ["봄맞이 대청소(옷장 정리)", "가벼운 옷차림 준비", "화이트데이"],
    tips: "겨울 묵은 때를 벗기는 '프리미엄 클리닝' 패키지가 인기입니다."
  },
  4: {
    title: "본격적인 나들이 시즌",
    events: ["벚꽃 놀이 등 야외 활동", "웨딩 시즌 시작 (예물 가방)", "밝은 컬러 가방 사용"],
    tips: "밝은색 가방의 이염 복원 및 코팅 서비스를 강조하세요."
  },
  5: {
    title: "가정의 달 & 웨딩 피크",
    events: ["어버이날/성년의날 선물", "결혼식 하객 패션", "명품 브랜드 가격 인상 이슈"],
    tips: "부모님의 오래된 명품을 복원해드리는 '효도 수선' 마케팅이 유효합니다."
  },
  6: {
    title: "초여름 및 장마 대비",
    events: ["여름 샌들/슬리퍼 수선", "장마철 대비 방수/코팅", "휴가 준비"],
    tips: "장마철 가죽 손상을 방지하기 위한 발수 코팅 서비스를 미리 제안하세요."
  },
  7: {
    title: "장마철 집중 & 휴가",
    events: ["습기로 인한 곰팡이 발생", "빗물 얼룩 제거", "여름 휴가철 사용품 수리"],
    tips: "곰팡이 제거 및 빗물 얼룩 복원 접수가 급증하는 시기입니다. 건조 시간에 유의하세요."
  },
  8: {
    title: "한여름 & 휴가 후유증",
    events: ["휴가 후 손상된 제품 입고", "선크림/태닝오일 오염", "F/W 시즌 준비 시작"],
    tips: "휴가지에서 생긴 스크래치와 오염을 지우는 '애프터 바캉스 케어'를 추천합니다."
  },
  9: {
    title: "추석 & F/W 시즌 개막",
    events: ["추석 명절 선물", "가을 부츠/구두 꺼내기", "가죽 자켓 수선"],
    tips: "가을/겨울 대비 가죽 자켓 염색과 부츠 밑창 보강 수요가 늘어납니다."
  },
  10: {
    title: "가을 성수기 & 할로윈",
    events: ["본격적인 가죽 시즌", "단풍 놀이", "결혼식 시즌 (하반기)"],
    tips: "연중 객단가가 가장 높은 시기 중 하나입니다. 고가 가방 전체 염색/복원 작업에 집중하세요."
  },
  11: {
    title: "겨울 준비 & 블랙프라이데이",
    events: ["겨울 부츠 수선 급증", "연말 모임 준비", "쇼핑 시즌 (수선 물량 증가)"],
    tips: "연말 모임을 위한 '급행 서비스'를 운영하여 추가 수익을 창출할 수 있습니다."
  },
  12: {
    title: "연말 홀리데이 & 크리스마스",
    events: ["크리스마스 선물", "연말 파티", "한 해 마무리 클리닝"],
    tips: "연말 선물용 리폼이나, 새해를 위한 정비 수요가 많습니다."
  }
};

const Dashboard: React.FC<DashboardProps> = ({ data }) => {
  // Filters
  const [selectedYear, setSelectedYear] = useState<number | 'all'>('all');
  const [selectedMonth, setSelectedMonth] = useState<number | 'all'>('all');
  const [viewType, setViewType] = useState<ViewType>('monthly');

  // Extract available years
  const availableYears = useMemo(() => {
    const years = new Set(data.map(d => d.year));
    return Array.from(years).sort((a: number, b: number) => b - a);
  }, [data]);

  // Filter Data
  const filteredData = useMemo(() => {
    if (!data || data.length === 0) return [];
    
    return data.filter(d => {
      const yearMatch = selectedYear === 'all' || d.year === selectedYear;
      const monthMatch = selectedMonth === 'all' || d.month === selectedMonth;
      return yearMatch && monthMatch;
    });
  }, [data, selectedYear, selectedMonth]);

  // Market Insight Logic
  const currentInsight = useMemo(() => {
    const monthToShow = selectedMonth === 'all' ? new Date().getMonth() + 1 : selectedMonth;
    return MARKET_INSIGHTS[monthToShow];
  }, [selectedMonth]);

  // KPI Calculation
  const metrics = useMemo(() => {
    const totalRevenue = filteredData.reduce((acc, curr) => acc + curr.sales, 0);
    const totalNetProfit = filteredData.reduce((acc, curr) => acc + curr.netProfit, 0);
    const profitMargin = totalRevenue > 0 ? (totalNetProfit / totalRevenue) * 100 : 0;
    
    return { totalRevenue, totalNetProfit, profitMargin };
  }, [filteredData]);

  // Helper: Get Week Number
  const getWeekNumber = (dateStr: string) => {
    const d = new Date(dateStr);
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() + 3 - (d.getDay() + 6) % 7);
    const week1 = new Date(d.getFullYear(), 0, 4);
    return 1 + Math.round(((d.getTime() - week1.getTime()) / 86400000 - 3 + (week1.getDay() + 6) % 7) / 7);
  };

  // 1. Trend Chart Data
  const trendData = useMemo(() => {
    const map: Record<string, { revenue: number, profit: number, sortKey: string | number }> = {};
    
    filteredData.forEach(item => {
      let key = '';
      let sortKey: string | number = '';

      if (viewType === 'daily') {
        key = `${item.month}/${item.day}`;
        sortKey = new Date(item.date).getTime();
      } else if (viewType === 'weekly') {
        const wn = getWeekNumber(item.date);
        key = `${item.year}-W${wn}`;
        sortKey = item.year * 100 + wn;
      } else {
        key = `${item.year}.${String(item.month).padStart(2, '0')}`;
        sortKey = item.year * 100 + item.month;
      }

      if (!map[key]) map[key] = { revenue: 0, profit: 0, sortKey };
      map[key].revenue += item.sales;
      map[key].profit += item.netProfit;
    });

    return Object.keys(map).map(k => ({
      name: k,
      ...map[k]
    })).sort((a, b) => {
      if (typeof a.sortKey === 'number' && typeof b.sortKey === 'number') return a.sortKey - b.sortKey;
      return String(a.sortKey).localeCompare(String(b.sortKey));
    });
  }, [filteredData, viewType]);

  // 2. Weekday Aggregation Chart
  const weekdayData = useMemo(() => {
    const days = ['일', '월', '화', '수', '목', '금', '토']; 
    const stats = days.map(d => ({ name: d, revenue: 0, profit: 0 }));

    filteredData.forEach(item => {
      const date = new Date(item.date);
      const dayIdx = date.getDay();
      stats[dayIdx].revenue += item.sales;
      stats[dayIdx].profit += item.netProfit;
    });

    // Reorder to start from Monday: Mon-Sun
    return [...stats.slice(1), stats[0]];
  }, [filteredData]);

  // 3. Brand Data
  const brandData = useMemo(() => {
    const map: Record<string, { revenue: number, profit: number }> = {};
    filteredData.forEach(item => {
      const brand = item.brand || '기타';
      if (!map[brand]) map[brand] = { revenue: 0, profit: 0 };
      map[brand].revenue += item.sales;
      map[brand].profit += item.netProfit;
    });
    return Object.keys(map)
      .map(key => ({ name: key, ...map[key], margin: map[key].revenue > 0 ? Math.round((map[key].profit / map[key].revenue) * 100) : 0 }))
      .filter(i => i.name !== 'Others')
      .sort((a, b) => b.profit - a.profit)
      .slice(0, 5);
  }, [filteredData]);

  if (!data || data.length === 0) {
      return (
        <div className="p-20 text-center flex flex-col items-center justify-center">
           <Filter className="w-12 h-12 text-slate-300 mb-4" />
           <p className="text-slate-500 font-medium">데이터가 없습니다.<br/>Google Sheet를 확인해주세요.</p>
        </div>
      );
  }

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-500 pb-10">
      
      {/* 1. Market Intelligence Banner */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white p-5 rounded-2xl shadow-lg border border-slate-700 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-10">
          <Briefcase size={100} />
        </div>
        <div className="relative z-10 flex flex-col md:flex-row gap-6 items-start md:items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="bg-amber-400 text-slate-900 text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">Market Insight</span>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                 {selectedMonth === 'all' ? new Date().getMonth() + 1 : selectedMonth}월의 명품 수선 트렌드: {currentInsight.title}
              </h3>
            </div>
            <div className="flex flex-wrap gap-2 text-sm text-slate-300">
               {currentInsight.events.map((event, i) => (
                 <span key={i} className="flex items-center gap-1 bg-slate-800/50 px-2 py-1 rounded-lg border border-slate-600/50">
                   <Info size={12} className="text-blue-400" /> {event}
                 </span>
               ))}
            </div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm p-3 rounded-xl border border-white/10 max-w-md">
            <div className="flex gap-2">
              <Lightbulb size={18} className="text-amber-300 shrink-0 mt-0.5" />
              <p className="text-xs sm:text-sm text-slate-200 font-medium leading-relaxed">
                <span className="text-amber-300 font-bold">Pro Tip: </span>
                {currentInsight.tips}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Controls */}
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4 bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
        <div>
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
             <Filter size={18} className="text-blue-600" />
             기간 및 보기 설정
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            원하는 기간을 필터링하고, <strong>일간/주간/월간</strong> 버튼을 눌러 흐름을 변경하세요.
          </p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto">
          {/* View Type Toggle */}
          <div className="flex bg-slate-100 p-1 rounded-lg mr-2">
             <button 
               onClick={() => setViewType('daily')}
               className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${viewType === 'daily' ? 'bg-white shadow text-blue-700' : 'text-slate-500 hover:text-slate-700'}`}
             >
               일간
             </button>
             <button 
               onClick={() => setViewType('weekly')}
               className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${viewType === 'weekly' ? 'bg-white shadow text-blue-700' : 'text-slate-500 hover:text-slate-700'}`}
             >
               주간
             </button>
             <button 
               onClick={() => setViewType('monthly')}
               className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${viewType === 'monthly' ? 'bg-white shadow text-blue-700' : 'text-slate-500 hover:text-slate-700'}`}
             >
               월간
             </button>
          </div>

          <div className="h-6 w-px bg-slate-200 hidden sm:block"></div>

          {/* Filters */}
          <select 
            value={selectedYear}
            onChange={(e) => {
              const val = e.target.value === 'all' ? 'all' : Number(e.target.value);
              setSelectedYear(val);
              if (val === 'all') setSelectedMonth('all');
            }}
            className="px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-sm font-semibold text-slate-700 focus:outline-none"
          >
            <option value="all">전체 연도</option>
            {availableYears.map(y => <option key={y} value={y}>{y}년</option>)}
          </select>

          <select 
            value={selectedMonth}
            disabled={selectedYear === 'all'}
            onChange={(e) => setSelectedMonth(e.target.value === 'all' ? 'all' : Number(e.target.value))}
            className={`px-3 py-2 rounded-lg border text-sm font-semibold focus:outline-none ${
              selectedYear === 'all' 
              ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed' 
              : 'bg-slate-50 border-slate-200 text-slate-700'
            }`}
          >
            <option value="all">전체 월</option>
            {Array.from({length: 12}, (_, i) => i + 1).map(m => (
              <option key={m} value={m}>{m}월</option>
            ))}
          </select>
        </div>
      </div>

      {/* 3. Key Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <StatCard 
          title="총 매출" 
          value={`₩ ${(metrics.totalRevenue / 10000).toLocaleString(undefined, {maximumFractionDigits: 0})}만`} 
          subValue="기간 내 총 수주 금액"
          icon={DollarSign} 
          trend="up"
          trendValue="Revenue"
          color="blue"
        />
        <StatCard 
          title="순수익" 
          value={`₩ ${(metrics.totalNetProfit / 10000).toLocaleString(undefined, {maximumFractionDigits: 0})}만`} 
          subValue={`마진율: ${metrics.profitMargin.toFixed(1)}%`}
          icon={Wallet} 
          trend="up"
          trendValue="Profit"
          color="emerald"
        />
        <StatCard 
          title="Top 브랜드" 
          value={brandData[0]?.name || '-'} 
          subValue="가장 작업량이 많은 브랜드"
          icon={Briefcase} 
          color="amber"
        />
        <StatCard 
          title="작업 효율" 
          value={`${Math.round(metrics.totalRevenue / (filteredData.length || 1) / 10000)}만원`} 
          subValue="건당 평균 매출 (ASP)"
          icon={Zap} 
          color="indigo"
        />
      </div>

      {/* 4. Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Trend Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-slate-800">매출 흐름 ({viewType === 'daily' ? '일간' : viewType === 'weekly' ? '주간' : '월간'})</h3>
            <div className="flex gap-4">
              <div className="flex items-center gap-2 text-xs font-medium text-slate-600">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span> 매출
              </div>
              <div className="flex items-center gap-2 text-xs font-medium text-slate-600">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span> 순수익
              </div>
            </div>
          </div>
          
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" stroke="#94a3b8" tick={{fontSize: 11}} tickLine={false} axisLine={false} dy={10} minTickGap={30} />
                <YAxis tickFormatter={(value) => `${(value/10000).toFixed(0)}만`} stroke="#94a3b8" tick={{fontSize: 11}} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)', padding: '12px'}}
                  formatter={(value: number) => [`₩ ${value.toLocaleString()}`, '']}
                  labelStyle={{color: '#64748b', marginBottom: '4px', fontSize: '12px'}}
                />
                <Area type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
                <Area type="monotone" dataKey="profit" stroke="#10b981" strokeWidth={3} fillOpacity={0} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Weekday Analysis */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col">
          <div className="mb-4">
             <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
               <Calendar size={18} className="text-purple-500" /> 요일별 작업량
             </h3>
             <p className="text-xs text-slate-500">어떤 요일에 매출이 집중되는지 확인하세요.</p>
          </div>

          <div className="flex-1 w-full min-h-[250px]">
             <ResponsiveContainer width="100%" height="100%">
               <BarChart data={weekdayData}>
                 <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                 <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dy={10} />
                 <Tooltip 
                    cursor={{fill: '#f8fafc'}}
                    contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)'}}
                    formatter={(val: number) => [`₩ ${val.toLocaleString()}`, '매출']}
                 />
                 <Bar dataKey="revenue" radius={[6, 6, 6, 6]}>
                    {weekdayData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={index >= 5 ? '#f59e0b' : '#6366f1'} />
                    ))}
                 </Bar>
               </BarChart>
             </ResponsiveContainer>
          </div>
          <div className="mt-2 text-[10px] text-slate-400 text-center flex justify-center gap-3">
             <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-indigo-500"></span>평일</span>
             <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-500"></span>주말</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
