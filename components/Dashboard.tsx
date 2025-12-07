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
import { SaleRecord } from '../types';
import StatCard from './StatCard';

interface DashboardProps {
  data: SaleRecord[];
}

type ViewType = 'daily' | 'weekly' | 'monthly';

// Market Intelligence Database
const MARKET_INSIGHTS: Record<number, { title: string; events: string[]; tips: string }> = {
  1: {
    title: '새해 맞이 및 겨울 시즌',
    events: ['설날 선물 준비 수요', '겨울철 코트/패딩 수선 증가', '새해 맞이 가방 클리닝'],
    tips: '겨울 아우터 수선과 신년 맞이 클리닝 프로모션을 준비하세요.',
  },
  2: {
    title: '졸업/입학 및 발렌타인',
    events: ['졸업/입학 선물 리폼', '발렌타인데이 선물 준비', '겨울 시즌 오프'],
    tips: '오래된 가방을 리폼하여 선물하는 수요를 공략해보세요.',
  },
  3: {
    title: 'S/S 시즌 시작 & 봄맞이',
    events: ['봄맞이 대청소(옷장 정리)', '가벼운 옷차림 준비', '화이트데이'],
    tips: "겨울 묵은 때를 벗기는 '프리미엄 클리닝' 패키지가 인기입니다.",
  },
  4: {
    title: '본격적인 나들이 시즌',
    events: ['벚꽃 놀이 등 야외 활동', '웨딩 시즌 시작 (예물 가방)', '밝은 컬러 가방 사용'],
    tips: '밝은색 가방의 이염 복원 및 코팅 서비스를 강조하세요.',
  },
  5: {
    title: '가정의 달 & 웨딩 피크',
    events: ['어버이날/성년의날 선물', '결혼식 하객 패션', '명품 브랜드 가격 인상 이슈'],
    tips: "부모님의 오래된 명품을 복원해드리는 '효도 수선' 마케팅이 유효합니다.",
  },
  6: {
    title: '초여름 및 장마 대비',
    events: ['여름 샌들/슬리퍼 수선', '장마철 대비 방수/코팅', '휴가 준비'],
    tips: '장마철 가죽 손상을 방지하기 위한 발수 코팅 서비스를 미리 제안하세요.',
  },
  7: {
    title: '장마철 집중 & 휴가',
    events: ['습기로 인한 곰팡이 발생', '빗물 얼룩 제거', '여름 휴가철 사용품 수리'],
    tips: '곰팡이 제거 및 빗물 얼룩 복원 접수가 급증하는 시기입니다. 건조 시간에 유의하세요.',
  },
  8: {
    title: '한여름 & 휴가 후유증',
    events: ['휴가 후 손상된 제품 입고', '선크림/태닝오일 오염', 'F/W 시즌 준비 시작'],
    tips: "휴가지에서 생긴 스크래치와 오염을 지우는 '애프터 바캉스 케어'를 추천합니다.",
  },
  9: {
    title: '추석 & F/W 시즌 개막',
    events: ['추석 명절 선물', '가을 부츠/구두 꺼내기', '가죽 자켓 수선'],
    tips: '가을/겨울 대비 가죽 자켓 염색과 부츠 밑창 보강 수요가 늘어납니다.',
  },
  10: {
    title: '가을 성수기 & 할로윈',
    events: ['본격적인 가죽 시즌', '단풍 놀이', '결혼식 시즌 (하반기)'],
    tips: '연중 객단가가 가장 높은 시기 중 하나입니다. 고가 가방 전체 염색/복원 작업에 집중하세요.',
  },
  11: {
    title: '겨울 준비 & 블랙프라이데이',
    events: ['겨울 부츠 수선 급증', '연말 모임 준비', '쇼핑 시즌 (수선 물량 증가)'],
    tips: "연말 모임을 위한 '급행 서비스'를 운영하여 추가 수익을 창출할 수 있습니다.",
  },
  12: {
    title: '연말 홀리데이 & 크리스마스',
    events: ['크리스마스 선물', '연말 파티', '한 해 마무리 클리닝'],
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
  const [selectedYear, setSelectedYear] = useState<number | 'all'>('all');
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

  // 1. Trend Chart Data (일/주/월)
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

    // Reorder to start from Monday: Mon-Sun
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

  // 4. Channel Analysis (Sub_Category)
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
    // Target: 40 Million KRW per month (User Request)
    const MONTHLY_TARGET = 40_000_000;
    const YEARLY_TARGET = MONTHLY_TARGET * 12;

    let target = MONTHLY_TARGET;
    let projection = 0;
    
    const today = new Date();
    const currentDay = today.getDate();
    const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();

    if (selectedMonth === 'all' && selectedYear === 'all') {
       target = YEARLY_TARGET * availableYears.length; // Approximate for multi-year
    } else if (selectedMonth === 'all') {
       target = YEARLY_TARGET;
    } else {
       // Monthly Mode
       target = MONTHLY_TARGET;
       
       // Calculate Projection only if we are looking at the current month/year
       if (selectedYear === today.getFullYear() && selectedMonth === today.getMonth() + 1) {
          const runRate = metrics.totalRevenue / currentDay;
          projection = runRate * daysInMonth;
       }
    }

    const percent = Math.min(100, Math.round((metrics.totalRevenue / target) * 100));
    
    // Gauge data: [Achieved, Remaining]
    const gaugeData = [
      { name: 'Achieved', value: metrics.totalRevenue },
      { name: 'Remaining', value: Math.max(0, target - metrics.totalRevenue) },
    ];

    // Determine color based on threshold (35m = ~87.5% of 40m)
    let gaugeColor = '#f59e0b'; // Amber (Default)
    if (percent >= 100) gaugeColor = '#10b981'; // Emerald (Success)
    else if (percent >= 87.5) gaugeColor = '#84cc16'; // Lime (Stable)

    return { target, percent, gaugeData, projection, gaugeColor };
  }, [metrics.totalRevenue, selectedYear, selectedMonth, availableYears.length]);

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
      .slice(0, 15); // Top 15 keywords
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
        <p className="text-slate-500 font-medium">
          데이터가 없습니다.
        </p>
      </div>
    );
  }

  const monthLabel = selectedMonth === 'all' ? new Date().getMonth() + 1 : selectedMonth;

  return (
    <div className="space-y-4 sm:space-y-8 animate-in fade-in duration-500 pb-10">
      {/* 1. Market Intelligence Banner */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white p-4 sm:p-5 rounded-2xl shadow-lg border border-slate-700 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-10">
          <Briefcase className="w-[80px] h-[80px] sm:w-[100px] sm:h-[100px]" />
        </div>
        <div className="relative z-10 flex flex-col md:flex-row gap-4 sm:gap-6 items-start md:items-center justify-between">
          <div className="w-full md:w-auto">
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <span className="bg-amber-400 text-slate-900 text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">
                Market Insight
              </span>
              <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                {monthLabel}월 트렌드:{' '}
                {currentInsight?.title ?? '명품 수선 트렌드'}
              </h3>
            </div>
            <div className="flex flex-wrap gap-1.5 sm:gap-2 text-xs sm:text-sm text-slate-300">
              {currentInsight?.events?.map((event, i) => (
                <span
                  key={i}
                  className="flex items-center gap-1 bg-slate-800/50 px-2 py-1 rounded-lg border border-slate-600/50"
                >
                  <Info size={12} className="text-blue-400" /> {event}
                </span>
              ))}
            </div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm p-3 rounded-xl border border-white/10 w-full md:max-w-md">
            <div className="flex gap-2">
              <Lightbulb
                size={18}
                className="text-amber-300 shrink-0 mt-0.5"
              />
              <p className="text-xs sm:text-sm text-slate-200 font-medium leading-relaxed break-keep">
                <span className="text-amber-300 font-bold">Tip: </span>
                {currentInsight?.tips ??
                  '시즌별로 어떤 작업이 늘어나는지 보고, 미리 프로모션을 설계해두면 좋습니다.'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Controls */}
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4 bg-white p-4 sm:p-5 rounded-2xl shadow-sm border border-slate-100">
        <div className="w-full xl:w-auto">
          <h2 className="text-base sm:text-lg font-bold text-slate-800 flex items-center gap-2">
            <Filter size={18} className="text-blue-600" />
            기간 및 보기 설정
          </h2>
          <p className="text-xs text-slate-500 mt-1 hidden sm:block">
            원하는 기간을 필터링하고, <strong>일간/주간/월간</strong> 버튼을 눌러
            흐름을 변경하세요.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:gap-3 w-full xl:w-auto">
          {/* View Type Toggle */}
          <div className="flex bg-slate-100 p-1 rounded-lg w-full sm:w-auto overflow-hidden">
            {(['daily', 'weekly', 'monthly'] as const).map((type) => (
              <button
                key={type}
                onClick={() => setViewType(type)}
                className={`flex-1 sm:flex-none px-3 py-1.5 text-xs font-bold rounded-md transition-all whitespace-nowrap ${
                  viewType === type
                    ? 'bg-white shadow text-blue-700'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                {type === 'daily'
                  ? '일간'
                  : type === 'weekly'
                  ? '주간'
                  : '월간'}
              </button>
            ))}
          </div>

          <div className="h-6 w-px bg-slate-200 hidden sm:block" />

          {/* Filters */}
          <div className="flex gap-2 w-full sm:w-auto">
            <select
              value={selectedYear}
              onChange={(e) => {
                const val = e.target.value === 'all' ? 'all' : Number(e.target.value);
                setSelectedYear(val);
                if (val === 'all') setSelectedMonth('all');
              }}
              className="flex-1 sm:flex-none px-2 sm:px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-sm font-semibold text-slate-700 focus:outline-none min-w-[80px]"
            >
              <option value="all">전체 연도</option>
              {availableYears.map((y) => (
                <option key={y} value={y}>
                  {y}년
                </option>
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
              className={`flex-1 sm:flex-none px-2 sm:px-3 py-2 rounded-lg border text-sm font-semibold focus:outline-none min-w-[80px] ${
                selectedYear === 'all'
                  ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed'
                  : 'bg-slate-50 border-slate-200 text-slate-700'
              }`}
            >
              <option value="all">전체 월</option>
              {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                <option key={m} value={m}>
                  {m}월
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* 3. Key Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
        <StatCard
          title="총 매출"
          value={`₩ ${(metrics.totalRevenue / 10000).toLocaleString(undefined, {
            maximumFractionDigits: 0,
          })}만`}
          subValue="기간 내 총 수주 금액"
          icon={DollarSign}
          trend="up"
          trendValue="Revenue"
          color="blue"
        />
        <StatCard
          title="순수익"
          value={`₩ ${(metrics.totalNetProfit / 10000).toLocaleString(
            undefined,
            {
              maximumFractionDigits: 0,
            },
          )}만`}
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
          value={`${Math.round(
            metrics.totalRevenue / (filteredData.length || 1) / 10000,
          )}만원`}
          subValue="건당 평균 매출 (ASP)"
          icon={Zap}
          color="indigo"
        />
      </div>

      {/* 4. Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Trend Chart */}
        <div className="lg:col-span-2 bg-white p-4 sm:p-6 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-base sm:text-lg font-bold text-slate-800">
              매출 흐름 (
              {viewType === 'daily'
                ? '일간'
                : viewType === 'weekly'
                ? '주간'
                : '월간'}
              )
            </h3>
            <div className="flex gap-2 sm:gap-4">
              <div className="flex items-center gap-1.5 text-[10px] sm:text-xs font-medium text-slate-600">
                <span className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-blue-500" />
                매출
              </div>
            </div>
          </div>

          <div className="h-[250px] sm:h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={trendData}
                margin={{ top: 10, right: 0, left: -20, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="5%"
                      stopColor="#2563eb"
                      stopOpacity={0.3}
                    />
                    <stop
                      offset="95%"
                      stopColor="#2563eb"
                      stopOpacity={0}
                    />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#f1f5f9"
                />
                <XAxis
                  dataKey="name"
                  stroke="#94a3b8"
                  tick={{ fontSize: 10 }}
                  tickLine={false}
                  axisLine={false}
                  dy={10}
                  minTickGap={20}
                />
                <YAxis
                  tickFormatter={(value) =>
                    `${(value / 10000).toFixed(0)}만`
                  }
                  stroke="#94a3b8"
                  tick={{ fontSize: 10 }}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: '12px',
                    border: 'none',
                    boxShadow:
                      '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                    padding: '12px',
                  }}
                  formatter={(value: number) => [
                    `₩ ${value.toLocaleString()}`,
                    '',
                  ]}
                  labelStyle={{
                    color: '#64748b',
                    marginBottom: '4px',
                    fontSize: '12px',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#2563eb"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorRev)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Weekday Analysis */}
        <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col">
          <div className="mb-4">
            <h3 className="text-base sm:text-lg font-bold text-slate-800 flex items-center gap-2">
              <Calendar size={18} className="text-purple-500" /> 요일별 작업량
            </h3>
            <p className="text-xs text-slate-500">
              어떤 요일에 매출이 집중되는지 확인하세요.
            </p>
          </div>

          <div className="flex-1 w-full min-h-[200px] sm:min-h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weekdayData}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#f1f5f9"
                />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#64748b', fontSize: 11 }}
                  dy={10}
                />
                <Tooltip
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{
                    borderRadius: '12px',
                    border: 'none',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                  }}
                  formatter={(val: number) => [
                    `₩ ${val.toLocaleString()}`,
                    '매출',
                  ]}
                />
                <Bar dataKey="revenue" radius={[6, 6, 6, 6]}>
                  {weekdayData.map((_, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={index >= 5 ? '#f59e0b' : '#6366f1'}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-2 text-[10px] text-slate-400 text-center flex justify-center gap-3">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-indigo-500" />
              평일
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              주말
            </span>
          </div>
        </div>
      </div>

      {/* NEW SECTION: Goal Gauge & Word Cloud */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Goal Gauge & Projection */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col">
          <div className="mb-2">
            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <Trophy size={18} className="text-amber-500" />
              매출 목표 및 예상 (Forecast)
            </h3>
            <p className="text-xs text-slate-500">
              목표 {selectedMonth === 'all' ? '연간 6억' : '월간 4천만'}원 기준 현황 및 예측입니다.
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
              <p className="text-4xl font-bold text-slate-800">{goalMetrics.percent}%</p>
              <p className="text-sm text-slate-500 mt-1 font-medium">
                {metrics.totalRevenue.toLocaleString()} / {goalMetrics.target.toLocaleString()}
              </p>
            </div>
            
            {/* Projection Text */}
            {goalMetrics.projection > 0 && (
              <div className="absolute bottom-0 mb-6 bg-slate-50 px-4 py-2 rounded-xl border border-slate-100 flex items-center gap-2 max-w-full">
                 <TrendingUp size={16} className={`shrink-0 ${goalMetrics.projection >= goalMetrics.target ? 'text-emerald-500' : 'text-slate-400'}`} />
                 <div className="text-center overflow-hidden">
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">이번 달 예상 매출 (Projection)</p>
                    <p className={`text-sm sm:text-base font-bold ${goalMetrics.projection >= goalMetrics.target ? 'text-emerald-600' : 'text-slate-600'}`}>
                       ₩ {Math.round(goalMetrics.projection).toLocaleString()} 
                       <span className="text-[10px] font-normal ml-1 text-slate-400 block sm:inline">
                         ({goalMetrics.projection >= goalMetrics.target ? '달성 예상 🎉' : '분발 필요 🔥'})
                       </span>
                    </p>
                 </div>
              </div>
            )}
          </div>
        </div>

        {/* Repair Word Cloud */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col">
          <div className="mb-4">
            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <Cloud size={18} className="text-sky-500" />
              인기 수선 키워드 (Word Cloud)
            </h3>
            <p className="text-xs text-slate-500">
              최근 가장 많이 의뢰받은 작업 내용을 분석했습니다.
            </p>
          </div>
          <div className="flex-1 flex flex-wrap gap-2 content-center justify-center p-4">
            {wordCloudData.map((item, index) => {
              // Simple scaling logic
              const fontSize = Math.max(12, Math.min(32, 12 + (item.value / wordCloudData[0].value) * 20));
              const opacity = 0.4 + (item.value / wordCloudData[0].value) * 0.6;
              
              return (
                <span 
                  key={index}
                  style={{ fontSize: `${fontSize}px`, opacity }}
                  className={`font-bold px-3 py-1 rounded-full bg-slate-50 border border-slate-100 text-slate-700 transition-all hover:scale-110 hover:bg-blue-50 hover:text-blue-600 cursor-default`}
                >
                  {item.text}
                  <span className="text-[10px] ml-1 text-slate-400 font-normal">{item.value}</span>
                </span>
              );
            })}
          </div>
        </div>
      </div>

      {/* 5. Channel Efficiency Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Channel Market Share (Pie) */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <div className="mb-6">
            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <PieIcon size={18} className="text-orange-500" />
              유입 채널 점유율 (Volume)
            </h3>
            <p className="text-xs text-slate-500">
              어떤 채널을 통해 주문이 가장 많이 들어오는지 보여줍니다.
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

        {/* Channel Profitability (Composed) */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <div className="mb-6">
            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <Target size={18} className="text-blue-600" />
              채널별 알짜 수익성 (Margin)
            </h3>
            <p className="text-xs text-slate-500">
              막대는 순이익(Profit), 선은 마진율(%)을 나타냅니다. 마진율이 높은 채널이 효자 채널입니다.
            </p>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart
                data={channelData.byProfit}
                margin={{ top: 20, right: 20, bottom: 20, left: 0 }}
              >
                <CartesianGrid stroke="#f5f5f5" vertical={false} />
                <XAxis dataKey="name" scale="band" tick={{ fontSize: 11 }} />
                <YAxis yAxisId="left" tickFormatter={(v) => `${(v/10000).toFixed(0)}만`} tick={{ fontSize: 10 }} />
                <YAxis yAxisId="right" orientation="right" tickFormatter={(v) => `${v}%`} tick={{ fontSize: 10 }} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                  formatter={(val: number, name: string) => {
                    if (name === 'margin') return [`${val.toFixed(1)}%`, '마진율'];
                    return [`₩ ${val.toLocaleString()}`, '순이익'];
                  }}
                />
                <Bar yAxisId="left" dataKey="profit" barSize={30} radius={[4, 4, 0, 0]} fill="#3b82f6">
                   {channelData.byProfit.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.margin > 70 ? '#10b981' : '#3b82f6'} />
                  ))}
                </Bar>
                <Line yAxisId="right" type="monotone" dataKey="margin" stroke="#f59e0b" strokeWidth={2} dot={{ r: 4 }} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* 6. 월별 매출표 (진짜 숫자 확인용) */}
      <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-sm border border-slate-100">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h3 className="text-base sm:text-lg font-bold text-slate-800">
              월별 매출/순이익 표
            </h3>
            <p className="text-xs text-slate-500">
              현재 필터(연도/월)에 맞는 데이터를 기준으로 월별 합계를 정리했습니다.
            </p>
          </div>
        </div>

        {monthlySummary.rows.length === 0 ? (
          <p className="text-sm text-slate-500">표시할 데이터가 없습니다.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="px-3 py-2 text-left text-xs font-semibold text-slate-500">
                    연도
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-slate-500">
                    월
                  </th>
                  <th className="px-3 py-2 text-right text-xs font-semibold text-slate-500">
                    매출 합계
                  </th>
                  <th className="px-3 py-2 text-right text-xs font-semibold text-slate-500">
                    외주 / 비용 합계
                  </th>
                  <th className="px-3 py-2 text-right text-xs font-semibold text-slate-500">
                    순이익
                  </th>
                </tr>
              </thead>
              <tbody>
                {monthlySummary.rows.map((m) => (
                  <tr
                    key={`${m.year}-${m.month}`}
                    className="border-b border-slate-100"
                  >
                    <td className="px-3 py-2 text-slate-700">{m.year}</td>
                    <td className="px-3 py-2 text-slate-700">
                      {String(m.month).padStart(2, '0')}월
                    </td>
                    <td className="px-3 py-2 text-right text-slate-900 font-medium">
                      {m.sales.toLocaleString()}원
                    </td>
                    <td className="px-3 py-2 text-right text-rose-600 font-medium">
                      {m.cost.toLocaleString()}원
                    </td>
                    <td className="px-3 py-2 text-right text-emerald-600 font-bold">
                      {m.net.toLocaleString()}원
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t border-slate-200 bg-slate-50/80">
                  <td className="px-3 py-2 text-xs font-semibold text-slate-600">
                    합계
                  </td>
                  <td />
                  <td className="px-3 py-2 text-right text-xs font-semibold text-slate-900">
                    {monthlySummary.totalSales.toLocaleString()}원
                  </td>
                  <td className="px-3 py-2 text-right text-xs font-semibold text-rose-600">
                    {monthlySummary.totalCost.toLocaleString()}원
                  </td>
                  <td className="px-3 py-2 text-right text-xs font-semibold text-emerald-600">
                    {monthlySummary.totalNet.toLocaleString()}원
                  </td>
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