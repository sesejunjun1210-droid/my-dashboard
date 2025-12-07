
import React, { useMemo, useState } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
  PieChart,
  Pie,
  Legend,
  ComposedChart,
  Line,
} from 'recharts';
import {
  DollarSign,
  Wallet,
  Briefcase,
  Zap,
  Calendar,
  Filter,
  Lightbulb,
  Info,
  PieChart as PieIcon,
  Target,
  Trophy,
  Cloud,
  TrendingUp
} from 'lucide-react';
import { SaleRecord } from '../../types';
import StatCard from './StatCard';

interface DashboardProps {
  data: SaleRecord[];
}

type ViewType = 'daily' | 'weekly' | 'monthly';

// Market Intelligence Database
const MARKET_INSIGHTS: Record<number, { title: string; events: string[]; tips: string }> = {
  1: {
    title: '새해 맞이 및 겨울 시즌',
    events: ['설날 선물 준비', '겨울 코트/패딩 수선', '새해 맞이 클리닝'],
    tips: '겨울 아우터 수선과 신년 맞이 클리닝 프로모션을 준비하세요.',
  },
  2: {
    title: '졸업/입학 및 발렌타인',
    events: ['졸업/입학 리폼', '발렌타인데이 선물', '겨울 시즌 오프'],
    tips: '오래된 가방을 리폼하여 선물하는 수요를 공략해보세요.',
  },
  3: {
    title: 'S/S 시즌 시작 & 봄맞이',
    events: ['봄맞이 옷장 정리', '가벼운 옷차림 준비', '화이트데이'],
    tips: "겨울 묵은 때를 벗기는 '프리미엄 클리닝' 패키지가 인기입니다.",
  },
  4: {
    title: '본격적인 나들이 시즌',
    events: ['야외 활동 증가', '웨딩 시즌 시작', '밝은 컬러 가방'],
    tips: '밝은색 가방의 이염 복원 및 코팅 서비스를 강조하세요.',
  },
  5: {
    title: '가정의 달 & 웨딩 피크',
    events: ['어버이날 선물', '결혼식 하객 패션', '명품 가격 인상'],
    tips: "부모님의 오래된 명품을 복원해드리는 '효도 수선' 마케팅이 유효합니다.",
  },
  6: {
    title: '초여름 및 장마 대비',
    events: ['샌들/슬리퍼 수선', '장마 대비 방수/코팅', '휴가 준비'],
    tips: '장마철 가죽 손상을 방지하기 위한 발수 코팅 서비스를 미리 제안하세요.',
  },
  7: {
    title: '장마철 집중 & 휴가',
    events: ['습기 곰팡이 발생', '빗물 얼룩 제거', '휴가철 수리'],
    tips: '곰팡이 제거 및 빗물 얼룩 복원 접수가 급증하는 시기입니다.',
  },
  8: {
    title: '한여름 & 휴가 후유증',
    events: ['휴가 후 손상 입고', '선크림 오염', 'F/W 준비 시작'],
    tips: "휴가지에서 생긴 스크래치와 오염을 지우는 '애프터 바캉스 케어'를 추천합니다.",
  },
  9: {
    title: '추석 & F/W 시즌 개막',
    events: ['추석 선물', '가을 부츠/구두', '가죽 자켓 수선'],
    tips: '가을/겨울 대비 가죽 자켓 염색과 부츠 밑창 보강 수요가 늘어납니다.',
  },
  10: {
    title: '가을 성수기 & 할로윈',
    events: ['본격적인 가죽 시즌', '단풍 놀이', '결혼식 시즌'],
    tips: '연중 객단가가 가장 높은 시기입니다. 전체 염색/복원 작업에 집중하세요.',
  },
  11: {
    title: '겨울 준비 & 블랙프라이데이',
    events: ['겨울 부츠 수선', '연말 모임 준비', '쇼핑 시즌'],
    tips: "연말 모임을 위한 '급행 서비스'를 운영하여 추가 수익을 창출할 수 있습니다.",
  },
  12: {
    title: '연말 홀리데이 & 크리스마스',
    events: ['크리스마스 선물', '연말 파티', '한 해 마무리'],
    tips: '연말 선물용 리폼이나, 새해를 위한 정비 수요가 많습니다.',
  },
  13: {
    title: '연간 분석',
    events: [],
    tips: '전체적인 흐름을 파악하세요.',
  }
};

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#f43f5e', '#8b5cf6', '#64748b'];

const Dashboard: React.FC<DashboardProps> = ({ data }) => {
  // Filters
  const [selectedYear, setSelectedYear] = useState<number | 'all'>(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState<number | 'all'>('all');
  const [viewType, setViewType] = useState<ViewType>('monthly');

  // Extract available years
  const availableYears = useMemo(() => {
    const years = new Set(data.map((d) => d.year));
    return Array.from(years).sort((a: number, b: number) => b - a);
  }, [data]);

  // Filter Data
  const filteredData = useMemo(() => {
    if (!data || data.length === 0) return [];

    return data.filter((d) => {
      const yearMatch = selectedYear === 'all' || d.year === selectedYear;
      const monthMatch = selectedMonth === 'all' || d.month === selectedMonth;
      return yearMatch && monthMatch;
    });
  }, [data, selectedYear, selectedMonth]);

  // Market Insight Logic
  const currentInsight = useMemo(() => {
    const monthToShow = selectedMonth === 'all' ? new Date().getMonth() + 1 : selectedMonth;
    return MARKET_INSIGHTS[monthToShow as number] || MARKET_INSIGHTS[13];
  }, [selectedMonth]);

  // KPI Calculation
  const metrics = useMemo(() => {
    const totalRevenue = filteredData.reduce((acc, curr) => acc + curr.sales, 0);
    const totalNetProfit = filteredData.reduce(
      (acc, curr) => acc + curr.netProfit,
      0,
    );
    const profitMargin = totalRevenue > 0 ? (totalNetProfit / totalRevenue) * 100 : 0;

    return { totalRevenue, totalNetProfit, profitMargin };
  }, [filteredData]);

  // 1. Trend Chart Data
  const trendData = useMemo(() => {
    const map: Record<
      string,
      { revenue: number; profit: number; sortKey: string | number }
    > = {};

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
        key = `${weekStart.getMonth()+1}/${weekStart.getDate()}주`;
        sortKey = weekStart.getTime();
      } else {
        key = `${item.year}.${String(item.month).padStart(2, '0')}`;
        sortKey = item.year * 100 + item.month;
      }

      if (!map[key]) map[key] = { revenue: 0, profit: 0, sortKey };
      map[key].revenue += item.sales;
      map[key].profit += item.netProfit;
    });

    return Object.keys(map)
      .map((k) => ({
        name: k,
        ...map[k],
      }))
      .sort((a, b) => {
        if (typeof a.sortKey === 'number' && typeof b.sortKey === 'number')
          return a.sortKey - b.sortKey;
        return String(a.sortKey).localeCompare(String(b.sortKey));
      });
  }, [filteredData, viewType]);

  // 2. Weekday Aggregation Chart
  const weekdayData = useMemo(() => {
    const days = ['일', '월', '화', '수', '목', '금', '토'];
    const stats = days.map((d) => ({ name: d, revenue: 0, profit: 0 }));

    filteredData.forEach((item) => {
      const date = new Date(item.date);
      const dayIdx = date.getDay();
      stats[dayIdx].revenue += item.sales;
      stats[dayIdx].profit += item.netProfit;
    });

    return [...stats.slice(1), stats[0]];
  }, [filteredData]);

  // 3. Brand Data
  const brandData = useMemo(() => {
    const map: Record<string, { revenue: number; profit: number }> = {};
    filteredData.forEach((item) => {
      const brand = item.brand || '기타';
      if (!map[brand]) map[brand] = { revenue: 0, profit: 0 };
      map[brand].revenue += item.sales;
      map[brand].profit += item.netProfit;
    });
    return Object.keys(map)
      .map((key) => ({
        name: key,
        ...map[key],
        margin:
          map[key].revenue > 0
            ? Math.round((map[key].profit / map[key].revenue) * 100)
            : 0,
      }))
      .filter((i) => i.name !== 'Others')
      .sort((a, b) => b.profit - a.profit)
      .slice(0, 5);
  }, [filteredData]);

  // 4. Channel Analysis
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
      name: k,
      ...map[k],
      margin: map[k].revenue > 0 ? (map[k].profit / map[k].revenue) * 100 : 0
    }));

    const byCount = [...list].sort((a, b) => b.count - a.count);
    const byProfit = [...list].sort((a, b) => b.profit - a.profit);

    return { byCount, byProfit };
  }, [filteredData]);

  // 5. Goal Gauge & Projection Data
  const goalMetrics = useMemo(() => {
    const YEARLY_TARGET = 450_000_000; // 4.5억
    const MONTHLY_TARGET = 37_500_000; // 3,750만

    let target = MONTHLY_TARGET;
    let projection = 0;
    
    const today = new Date();
    const currentDay = today.getDate();
    const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();

    if (selectedMonth === 'all') {
       target = YEARLY_TARGET;
    } else {
       target = MONTHLY_TARGET;
       
       if (selectedYear === today.getFullYear() && selectedMonth === today.getMonth() + 1) {
          const runRate = metrics.totalRevenue / currentDay;
          projection = runRate * daysInMonth;
       }
    }

    const percent = Math.min(100, Math.round((metrics.totalRevenue / target) * 100));
    
    const gaugeData = [
      { name: 'Achieved', value: metrics.totalRevenue },
      { name: 'Remaining', value: Math.max(0, target - metrics.totalRevenue) },
    ];

    let gaugeColor = '#f59e0b'; // Amber (Default)
    if (percent >= 100) gaugeColor = '#10b981'; // Emerald
    else if (percent >= 87.5) gaugeColor = '#84cc16'; // Lime

    return { target, percent, gaugeData, projection, gaugeColor };
  }, [metrics.totalRevenue, selectedYear, selectedMonth]);

  // 6. Word Cloud Data
  const wordCloudData = useMemo(() => {
    const textMap: Record<string, number> = {};
    const stopWords = ['수선', '및', '전체', '부분', '교체', '가방', '지갑', '등', '백', '작업', '복원'];

    filteredData.forEach(item => {
      const words = item.description.split(/[\s,/+]+/);
      words.forEach(w => {
        const cleanWord = w.trim();
        if (cleanWord.length > 1 && !stopWords.includes(cleanWord) && !/^\d/.test(cleanWord)) {
          textMap[cleanWord] = (textMap[cleanWord] || 0) + 1;
        }
      });
    });

    return Object.entries(textMap)
      .map(([text, value]) => ({ text, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 15);
  }, [filteredData]);

  // 7. Monthly Summary
  const monthlySummary = useMemo(() => {
    const map: Record<
      string,
      { year: number; month: number; sales: number; cost: number; net: number }
    > = {};

    filteredData.forEach((row) => {
      const year = row.year || 0;
      const month = row.month || 0;
      if (!year || !month) return;

      const key = `${year}-${String(month).padStart(2, '0')}`;
      if (!map[key]) {
        map[key] = { year, month, sales: 0, cost: 0, net: 0 };
      }
      map[key].sales += row.sales || 0;
      map[key].cost += row.cost || 0;
      map[key].net +=
        typeof row.netProfit === 'number'
          ? row.netProfit
          : (row.sales || 0) + (row.cost || 0);
    });

    const rows = Object.values(map).sort((a, b) => {
      if (a.year !== b.year) return a.year - b.year;
      return a.month - b.month;
    });

    const totalSales = rows.reduce((s, r) => s + r.sales, 0);
    const totalCost = rows.reduce((s, r) => s + r.cost, 0);
    const totalNet = rows.reduce((s, r) => s + r.net, 0);

    return { rows, totalSales, totalCost, totalNet };
  }, [filteredData]);

  if (!data || data.length === 0) {
    return (
      <div className="p-20 text-center flex flex-col items-center justify-center">
        <Filter className="w-12 h-12 text-slate-300 mb-4" />
        <p className="text-slate-500 font-medium">데이터가 없습니다.</p>
      </div>
    );
  }

  const monthLabel = selectedMonth === 'all' ? new Date().getMonth() + 1 : selectedMonth;

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-500 pb-12">
      {/* 1. Market Intelligence Banner */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white p-5 sm:p-6 rounded-2xl shadow-lg border border-slate-700 relative overflow-hidden flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="absolute top-0 right-0 p-4 opacity-5">
          <Briefcase className="w-32 h-32" />
        </div>
        <div className="relative z-10 w-full md:w-auto">
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <span className="bg-amber-400 text-slate-900 text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">
              Market Insight
            </span>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              {monthLabel}월 트렌드:{' '}
              {currentInsight?.title ?? '명품 수선 트렌드'}
            </h3>
          </div>
          <div className="flex flex-wrap gap-2 text-sm text-slate-300">
            {currentInsight?.events?.map((event, i) => (
              <span
                key={i}
                className="flex items-center gap-1.5 bg-white/10 px-2.5 py-1 rounded-lg border border-white/10"
              >
                <Info size={12} className="text-blue-300" /> {event}
              </span>
            ))}
          </div>
        </div>
        <div className="bg-white/5 backdrop-blur-md p-4 rounded-xl border border-white/10 w-full md:max-w-md">
          <div className="flex gap-3">
            <Lightbulb
              size={20}
              className="text-amber-300 shrink-0 mt-0.5"
            />
            <p className="text-sm text-slate-200 font-medium leading-relaxed break-keep">
              <span className="text-amber-300 font-bold">Tip: </span>
              {currentInsight?.tips ?? '시즌별 작업 흐름을 파악하여 프로모션을 준비하세요.'}
            </p>
          </div>
        </div>
      </div>

      {/* 2. Controls */}
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4 bg-white p-5 sm:p-6 rounded-2xl shadow-sm border border-slate-100">
        <div className="w-full xl:w-auto">
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <Filter size={18} className="text-blue-600" />
            기간 및 보기 설정
          </h2>
          <p className="text-sm text-slate-500 mt-1 hidden sm:block">
            원하는 기간을 필터링하고, <strong>일간/주간/월간</strong> 버튼을 눌러 흐름을 변경하세요.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:gap-3 w-full xl:w-auto">
          <div className="flex bg-slate-50 p-1 rounded-xl w-full sm:w-auto overflow-hidden border border-slate-100">
            {(['daily', 'weekly', 'monthly'] as const).map((type) => (
              <button
                key={type}
                onClick={() => setViewType(type)}
                className={`flex-1 sm:flex-none px-4 py-2 text-xs font-bold rounded-lg transition-all whitespace-nowrap ${
                  viewType === type
                    ? 'bg-white shadow-sm text-blue-600 border border-slate-100'
                    : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100'
                }`}
              >
                {type === 'daily' ? '일간' : type === 'weekly' ? '주간' : '월간'}
              </button>
            ))}
          </div>

          <div className="h-8 w-px bg-slate-200 hidden sm:block" />

          <div className="flex gap-2 w-full sm:w-auto">
            <select
              value={selectedYear}
              onChange={(e) => {
                const val = e.target.value === 'all' ? 'all' : Number(e.target.value);
                setSelectedYear(val);
                if (val === 'all') setSelectedMonth('all');
              }}
              className="flex-1 sm:flex-none px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 min-w-[100px]"
            >
              <option value="all">전체 연도</option>
              {availableYears.map((y) => (
                <option key={y} value={y}>{y}년</option>
              ))}
            </select>

            <select
              value={selectedMonth}
              disabled={selectedYear === 'all'}
              onChange={(e) =>
                setSelectedMonth(
                  e.target.value === 'all' ? 'all' : Number(e.target.value),
                )
              }
              className={`flex-1 sm:flex-none px-3 py-2.5 rounded-xl border text-sm font-semibold focus:outline-none min-w-[90px] ${
                selectedYear === 'all'
                  ? 'bg-slate-50 text-slate-400 border-slate-200 cursor-not-allowed'
                  : 'bg-slate-50 border-slate-200 text-slate-700 focus:ring-2 focus:ring-blue-500/20'
              }`}
            >
              <option value="all">전체 월</option>
              {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                <option key={m} value={m}>{m}월</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* 3. Key Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <StatCard
          title="총 매출"
          value={`₩ ${(metrics.totalRevenue / 10000).toLocaleString(undefined, { maximumFractionDigits: 0 })}만`}
          subValue="기간 내 총 수주 금액"
          icon={DollarSign}
          trend="up"
          trendValue="Revenue"
          color="blue"
        />
        <StatCard
          title="순수익"
          value={`₩ ${(metrics.totalNetProfit / 10000).toLocaleString(undefined, { maximumFractionDigits: 0 })}만`}
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
        <div className="lg:col-span-2 bg-white p-5 sm:p-6 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-slate-800">
              매출 흐름 ({viewType === 'daily' ? '일간' : viewType === 'weekly' ? '주간' : '월간'})
            </h3>
            <div className="flex gap-2">
              <div className="flex items-center gap-1.5 text-xs font-medium text-slate-600 bg-slate-50 px-2 py-1 rounded-md">
                <span className="w-2 h-2 rounded-full bg-blue-500" />
                매출
              </div>
            </div>
          </div>

          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="name" 
                  stroke="#94a3b8" 
                  tick={{ fontSize: 11, fill: '#64748b' }} 
                  tickLine={false} 
                  axisLine={false} 
                  dy={10} 
                  minTickGap={30} 
                />
                <YAxis 
                  tickFormatter={(value) => `${(value / 10000).toFixed(0)}만`} 
                  stroke="#94a3b8" 
                  tick={{ fontSize: 11, fill: '#64748b' }} 
                  tickLine={false} 
                  axisLine={false} 
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: '12px',
                    border: 'none',
                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                    padding: '12px 16px',
                    fontFamily: 'Pretendard',
                  }}
                  formatter={(value: number) => [`₩ ${value.toLocaleString()}`, '']}
                  labelStyle={{ color: '#64748b', marginBottom: '4px', fontSize: '12px' }}
                />
                <Area type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Weekday Analysis */}
        <div className="bg-white p-5 sm:p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col">
          <div className="mb-4">
            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <Calendar size={18} className="text-purple-500" /> 요일별 작업량
            </h3>
            <p className="text-sm text-slate-500">
              매출이 집중되는 요일을 확인하세요.
            </p>
          </div>

          <div className="flex-1 w-full min-h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weekdayData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} dy={10} />
                <Tooltip
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                  formatter={(val: number) => [`₩ ${val.toLocaleString()}`, '매출']}
                />
                <Bar dataKey="revenue" radius={[6, 6, 6, 6]}>
                  {weekdayData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={index >= 5 ? '#f59e0b' : '#6366f1'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 flex justify-center gap-4 text-xs font-medium text-slate-500">
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-indigo-500" />평일</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-amber-500" />주말</span>
          </div>
        </div>
      </div>

      {/* Goal Gauge & Word Cloud */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col relative overflow-hidden">
          <div className="mb-2 z-10">
            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <Trophy size={18} className="text-amber-500" />
              매출 목표 및 예상 (Forecast)
            </h3>
            <p className="text-sm text-slate-500 mt-1">
              목표 {selectedMonth === 'all' ? '연간 4.5억 (고정)' : '월간 3,750만'}원 기준 달성 현황입니다.
            </p>
          </div>
          
          <div className="flex-1 min-h-[250px] relative flex flex-col items-center justify-center">
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={goalMetrics.gaugeData}
                  cx="50%"
                  cy="70%"
                  startAngle={180}
                  endAngle={0}
                  innerRadius={80}
                  outerRadius={120}
                  paddingAngle={0}
                  dataKey="value"
                  stroke="none"
                >
                  <Cell fill={goalMetrics.gaugeColor} />
                  <Cell fill="#f1f5f9" />
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute bottom-20 text-center">
              <p className="text-5xl font-bold text-slate-800 tracking-tight">{goalMetrics.percent}%</p>
              <p className="text-sm text-slate-400 mt-2 font-medium">
                {metrics.totalRevenue.toLocaleString()} / {goalMetrics.target.toLocaleString()}
              </p>
            </div>
            
            {goalMetrics.projection > 0 && (
              <div className="absolute bottom-0 mb-4 bg-slate-50 px-5 py-3 rounded-2xl border border-slate-100 flex items-center gap-3 shadow-sm">
                 <TrendingUp size={20} className={`shrink-0 ${goalMetrics.projection >= goalMetrics.target ? 'text-emerald-500' : 'text-slate-400'}`} />
                 <div className="text-center">
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-0.5">이번 달 예상 매출 (Projection)</p>
                    <p className={`text-base font-bold ${goalMetrics.projection >= goalMetrics.target ? 'text-emerald-600' : 'text-slate-600'}`}>
                       ₩ {Math.round(goalMetrics.projection).toLocaleString()} 
                       <span className="text-xs font-medium ml-1.5 text-slate-400">
                         ({goalMetrics.projection >= goalMetrics.target ? '달성 유력 🎉' : '분발 필요 🔥'})
                       </span>
                    </p>
                 </div>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col">
          <div className="mb-4">
            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <Cloud size={18} className="text-sky-500" />
              인기 수선 키워드
            </h3>
            <p className="text-sm text-slate-500 mt-1">
              최근 가장 많이 의뢰받은 작업 키워드입니다.
            </p>
          </div>
          <div className="flex-1 flex flex-wrap gap-2.5 content-center justify-center p-4">
            {wordCloudData.map((item, index) => {
              const fontSize = Math.max(13, Math.min(32, 13 + (item.value / wordCloudData[0].value) * 18));
              const opacity = 0.5 + (item.value / wordCloudData[0].value) * 0.5;
              
              return (
                <span 
                  key={index}
                  style={{ fontSize: `${fontSize}px`, opacity }}
                  className="font-bold px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-100 text-slate-700 transition-all hover:scale-105 hover:bg-blue-50 hover:text-blue-600 cursor-default shadow-sm hover:shadow-md"
                >
                  {item.text}
                  <span className="text-[10px] ml-1.5 text-slate-400 font-normal align-top">{item.value}</span>
                </span>
              );
            })}
          </div>
        </div>
      </div>

      {/* Channel Efficiency */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <div className="mb-6">
            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <PieIcon size={18} className="text-orange-500" />
              유입 채널 점유율 (Volume)
            </h3>
            <p className="text-sm text-slate-500 mt-1">
              주문 건수 기준 채널별 비중입니다.
            </p>
          </div>
          <div className="h-[300px] w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={channelData.byCount}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="count"
                  stroke="none"
                >
                  {channelData.byCount.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(val: number) => [`${val}건`, '주문 건수']}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                />
                <Legend verticalAlign="bottom" height={36} iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <div className="mb-6">
            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <Target size={18} className="text-blue-600" />
              채널별 알짜 수익성 (Margin)
            </h3>
            <p className="text-sm text-slate-500 mt-1">
              막대는 순이익(Profit), 선은 마진율(%)입니다.
            </p>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={channelData.byProfit} margin={{ top: 20, right: 20, bottom: 20, left: 0 }}>
                <CartesianGrid stroke="#f5f5f5" vertical={false} />
                <XAxis dataKey="name" scale="band" tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis yAxisId="left" tickFormatter={(v) => `${(v/10000).toFixed(0)}만`} tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis yAxisId="right" orientation="right" tickFormatter={(v) => `${v}%`} tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                  formatter={(val: number, name: string) => {
                    if (name === 'margin') return [`${val.toFixed(1)}%`, '마진율'];
                    return [`₩ ${val.toLocaleString()}`, '순이익'];
                  }}
                />
                <Bar yAxisId="left" dataKey="profit" barSize={32} radius={[6, 6, 0, 0]} fill="#3b82f6">
                   {channelData.byProfit.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.margin > 70 ? '#10b981' : '#3b82f6'} />
                  ))}
                </Bar>
                <Line yAxisId="right" type="monotone" dataKey="margin" stroke="#f59e0b" strokeWidth={2.5} dot={{ r: 4, strokeWidth: 2, fill: '#fff' }} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Monthly Summary Table */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <div className="mb-4">
          <h3 className="text-lg font-bold text-slate-800">
            월별 매출/순이익 표
          </h3>
          <p className="text-sm text-slate-500 mt-1">
            선택된 필터 기준 월별 합계입니다.
          </p>
        </div>

        {monthlySummary.rows.length === 0 ? (
          <div className="py-10 text-center text-slate-400 text-sm">표시할 데이터가 없습니다.</div>
        ) : (
          <div className="overflow-x-auto custom-scrollbar pb-2">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50">
                  <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">연도</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">월</th>
                  <th className="px-4 py-3 text-right text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">매출 합계</th>
                  <th className="px-4 py-3 text-right text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">비용 합계</th>
                  <th className="px-4 py-3 text-right text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">순이익</th>
                </tr>
              </thead>
              <tbody>
                {monthlySummary.rows.map((m) => (
                  <tr key={`${m.year}-${m.month}`} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                    <td className="px-4 py-3.5 text-slate-600 font-medium whitespace-nowrap">{m.year}</td>
                    <td className="px-4 py-3.5 text-slate-600 font-medium whitespace-nowrap">{String(m.month).padStart(2, '0')}월</td>
                    <td className="px-4 py-3.5 text-right text-slate-800 font-bold whitespace-nowrap">{m.sales.toLocaleString()}원</td>
                    <td className="px-4 py-3.5 text-right text-rose-500 font-medium whitespace-nowrap">{m.cost.toLocaleString()}원</td>
                    <td className="px-4 py-3.5 text-right text-emerald-600 font-bold whitespace-nowrap">{m.net.toLocaleString()}원</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-slate-50/50 font-bold border-t border-slate-200">
                  <td className="px-4 py-4 text-slate-600 whitespace-nowrap">합계</td>
                  <td />
                  <td className="px-4 py-4 text-right text-slate-900 whitespace-nowrap">{monthlySummary.totalSales.toLocaleString()}원</td>
                  <td className="px-4 py-4 text-right text-rose-600 whitespace-nowrap">{monthlySummary.totalCost.toLocaleString()}원</td>
                  <td className="px-4 py-4 text-right text-emerald-600 whitespace-nowrap">{monthlySummary.totalNet.toLocaleString()}원</td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
