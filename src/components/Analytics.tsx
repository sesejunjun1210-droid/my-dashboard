
import React, { useMemo, useState } from 'react';
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  ZAxis,
  Cell,
  ReferenceLine,
  LineChart,
  Line,
  Legend
} from 'recharts';
import { SaleRecord, AggregatedMetric } from '../../types';
import {
  TrendingUp,
  Activity,
  ArrowUp,
  ArrowDown,
  Minus,
  MousePointerClick,
  Calendar,
  BarChart2,
  GitMerge
} from 'lucide-react';

interface AnalyticsProps {
  data: SaleRecord[];
}

const Analytics: React.FC<AnalyticsProps> = ({ data }) => {
  const [filterBrand, setFilterBrand] = useState<string | null>(null);
  const [sortConfig, setSortConfig] = useState<{
    key: keyof AggregatedMetric;
    direction: 'asc' | 'desc';
  }>({ key: 'profit', direction: 'desc' });
  const [viewMode, setViewMode] = useState<'brand' | 'menu'>('menu');

  // Brand 필터링
  const activeData = useMemo(
    () => (!filterBrand ? data : data.filter((d) => d.brand === filterBrand)),
    [data, filterBrand],
  );

  const isRework = (desc: string, category: string) => {
    const text = `${desc}${category}`.toLowerCase();
    return text.includes('as') || text.includes('재작업') || text.includes('수정') || text.includes('다시');
  };

  // 1. ABC / Menu Engineering Data
  const aggregatedData = useMemo<AggregatedMetric[]>(() => {
    const map = new Map<string, AggregatedMetric>();

    activeData.forEach((item) => {
      const key = viewMode === 'menu' ? `${item.brand} ${item.category}` : item.brand;

      if (!map.has(key)) {
        map.set(key, {
          id: key,
          name: key,
          count: 0,
          revenue: 0,
          profit: 0,
          asp: 0,
          margin: 0,
          reworkCount: 0,
          reworkRate: 0,
        });
      }

      const entry = map.get(key)!;
      entry.count += 1;
      entry.revenue += item.sales;
      entry.profit += item.netProfit;
      if (isRework(item.description, item.category)) {
        entry.reworkCount += 1;
      }
    });

    return Array.from(map.values())
      .map((entry) => ({
        ...entry,
        asp: entry.count > 0 ? Math.round(entry.revenue / entry.count) : 0,
        margin: entry.revenue > 0 ? parseFloat(((entry.profit / entry.revenue) * 100).toFixed(1)) : 0,
        reworkRate:
          entry.count > 0 ? parseFloat(((entry.reworkCount / entry.count) * 100).toFixed(1)) : 0,
      }))
      .filter((r) => r.revenue > 0);
  }, [activeData, viewMode]);

  // Sorting
  const sortedData = useMemo(
    () =>
      [...aggregatedData].sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) return sortConfig.direction === 'asc' ? -1 : 1;
        if (a[sortConfig.key] > b[sortConfig.key]) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      }),
    [aggregatedData, sortConfig],
  );

  // Matrix Data
  const matrixData = useMemo(() => {
    const avgMargin =
      aggregatedData.reduce((acc, cur) => acc + cur.margin, 0) / (aggregatedData.length || 1);
    const avgCount =
      aggregatedData.reduce((acc, cur) => acc + cur.count, 0) / (aggregatedData.length || 1);

    return { data: aggregatedData, avgMargin, avgCount };
  }, [aggregatedData]);

  // 2. Seasonality Heatmap Data
  const heatmapData = useMemo(() => {
    const grid: Record<string, number> = {};
    const months = Array.from({ length: 12 }, (_, i) => i + 1);
    const weekdays = ['월', '화', '수', '목', '금', '토', '일'];

    activeData.forEach((d) => {
      const date = new Date(d.date);
      const m = d.month;
      let dIdx = date.getDay() - 1; // 일요일(0) → 6
      if (dIdx === -1) dIdx = 6;
      const key = `${m}-${dIdx}`;
      if (!grid[key]) grid[key] = 0;
      grid[key] += d.sales;
    });

    const values = Object.values(grid);
    const maxVal = values.length ? Math.max(...values) : 1;

    return { grid, months, weekdays, maxVal };
  }, [activeData]);

  // 3. Brand Trend Data (Multi-line Chart)
  const brandTrendData = useMemo(() => {
    // 1. Identify Top 5 Brands by Revenue
    const brandRevenueMap: Record<string, number> = {};
    data.forEach(d => {
        const b = d.brand || 'Others';
        if (b === 'Others') return;
        brandRevenueMap[b] = (brandRevenueMap[b] || 0) + d.sales;
    });
    const topBrands = Object.entries(brandRevenueMap)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(entry => entry[0]);

    // 2. Group data by Month (YYYY-MM) and Brand
    const monthMap: Record<string, any> = {}; // key: "2024-01"
    
    // Sort data chronologically first
    const sortedRawData = [...data].sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    sortedRawData.forEach(d => {
        const key = `${d.year}-${String(d.month).padStart(2, '0')}`;
        if (!monthMap[key]) {
            monthMap[key] = { name: key };
            topBrands.forEach(b => monthMap[key][b] = 0);
        }
        if (topBrands.includes(d.brand)) {
            monthMap[key][d.brand] += d.sales;
        }
    });

    return { 
        chartData: Object.values(monthMap), 
        topBrands 
    };
  }, [data]);

  // 4. Cohort Retention Analysis Data
  const cohortData = useMemo(() => {
    // A. Identify First Visit Month for each customer
    const firstVisitMap = new Map<string, string>(); // Phone -> "YYYY-MM"
    
    // Sort data by date ascending
    const sortedByDate = [...data].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
    sortedByDate.forEach(d => {
        if (!d.phone || d.phone.length < 8) return;
        const cleanPhone = d.phone.replace(/[^0-9]/g, '');
        const visitMonth = `${d.year}-${String(d.month).padStart(2, '0')}`;
        
        if (!firstVisitMap.has(cleanPhone)) {
            firstVisitMap.set(cleanPhone, visitMonth);
        }
    });

    // B. Build Cohort Grid
    // Cohorts: Rows (First Visit Month), Columns: Months Since First Visit (0, 1, 2...)
    // Re-processing for accurate unique counts
    const cohortSets: Record<string, { total: Set<string>, retention: Record<number, Set<string>> }> = {};
    
    sortedByDate.forEach(d => {
        if (!d.phone || d.phone.length < 8) return;
        const cleanPhone = d.phone.replace(/[^0-9]/g, '');
        const cohortMonth = firstVisitMap.get(cleanPhone);
        if (!cohortMonth) return;

        const visitMonth = `${d.year}-${String(d.month).padStart(2, '0')}`;
        const cDate = new Date(cohortMonth + "-01");
        const vDate = new Date(visitMonth + "-01");
        const diff = (vDate.getFullYear() - cDate.getFullYear()) * 12 + (vDate.getMonth() - cDate.getMonth());

        if (!cohortSets[cohortMonth]) {
            cohortSets[cohortMonth] = { total: new Set(), retention: {} };
        }
        
        // Add to total (Month 0)
        cohortSets[cohortMonth].total.add(cleanPhone);

        // Add to retention month bucket
        if (!cohortSets[cohortMonth].retention[diff]) {
            cohortSets[cohortMonth].retention[diff] = new Set();
        }
        cohortSets[cohortMonth].retention[diff].add(cleanPhone);
    });

    // Convert Sets to Numbers and Format for Render
    const rows = Object.keys(cohortSets).sort().map(month => {
        const data = cohortSets[month];
        const total = data.total.size;
        const retentionStats: number[] = [];
        
        // Show up to 6 months after
        for (let i = 0; i <= 6; i++) {
            const count = data.retention[i]?.size || 0;
            const percentage = total > 0 ? Math.round((count / total) * 100) : 0;
            retentionStats.push(percentage);
        }

        return { month, total, retentionStats };
    });

    return rows; // Recent cohorts at bottom
  }, [data]);

  // Helpers for UI
  const handleSort = (key: keyof AggregatedMetric) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === 'desc' ? 'asc' : 'desc',
    }));
  };

  const getSortIcon = (key: keyof AggregatedMetric) => {
    if (sortConfig.key !== key) return <Minus size={12} className="opacity-20" />;
    return sortConfig.direction === 'asc' ? <ArrowUp size={12} /> : <ArrowDown size={12} />;
  };

  const BRAND_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6'];

  return (
    <div className="space-y-6 pb-20 animate-in fade-in duration-500">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <Activity className="text-blue-600" />
            비즈니스 분석 (Analytics)
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            수익 구조와 브랜드/메뉴별 성과를 심층 분석합니다.
          </p>
        </div>
      </div>

      {/* Brand Trend Chart (New) */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <div className="mb-6">
            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <BarChart2 size={18} className="text-purple-600" />
                브랜드별 매출 추이 (Top 5)
            </h3>
            <p className="text-xs text-slate-500 mt-1">
                주요 브랜드들의 월별 성장세를 비교합니다. 어떤 브랜드가 뜨고 있는지 확인하세요.
            </p>
        </div>
        <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
                <LineChart data={brandTrendData.chartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="name" tick={{ fontSize: 10 }} stroke="#94a3b8" />
                    <YAxis tickFormatter={(v) => `${(v/10000).toFixed(0)}만`} tick={{ fontSize: 10 }} stroke="#94a3b8" width={30} />
                    <Tooltip 
                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                        formatter={(val: number) => `₩ ${val.toLocaleString()}`}
                    />
                    <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                    {brandTrendData.topBrands.map((brand, idx) => (
                        <Line 
                            key={brand}
                            type="monotone" 
                            dataKey={brand} 
                            stroke={BRAND_COLORS[idx % BRAND_COLORS.length]} 
                            strokeWidth={2}
                            dot={{ r: 2 }}
                            activeDot={{ r: 5 }}
                        />
                    ))}
                </LineChart>
            </ResponsiveContainer>
        </div>
      </div>

      {/* NEW: Cohort Analysis */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="mb-6">
            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <GitMerge size={18} className="text-rose-500" />
                코호트 유지율 분석 (Cohort Retention)
            </h3>
            <p className="text-xs text-slate-500 mt-1">
                월별 신규 고객이 이후 개월(Month + N)에 얼마나 재방문하는지 보여주는 히트맵입니다. 색이 진할수록 충성도가 높습니다.
            </p>
        </div>
        <div className="overflow-x-auto pb-2">
            <table className="w-full text-center border-collapse min-w-[600px]">
                <thead>
                    <tr className="text-xs font-bold text-slate-500 border-b border-slate-100">
                        <th className="p-3 text-left w-32 sticky left-0 bg-white z-10">첫 방문 월</th>
                        <th className="p-3 w-20">신규 고객</th>
                        <th className="p-3">Month 0</th>
                        <th className="p-3">Month +1</th>
                        <th className="p-3">Month +2</th>
                        <th className="p-3">Month +3</th>
                        <th className="p-3">Month +4</th>
                        <th className="p-3">Month +5</th>
                        <th className="p-3">Month +6</th>
                    </tr>
                </thead>
                <tbody className="text-sm">
                    {cohortData.map((row) => (
                        <tr key={row.month} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                            <td className="p-3 font-bold text-slate-700 text-left text-xs sticky left-0 bg-white z-10 border-r border-slate-50">{row.month}</td>
                            <td className="p-3 text-slate-500 font-mono text-xs">{row.total}명</td>
                            {row.retentionStats.map((pct, i) => {
                                // Dynamic background color based on percentage
                                let bg = 'bg-white';
                                let text = 'text-slate-300';
                                if (pct > 0) {
                                    text = 'text-blue-900';
                                    if (pct >= 50) bg = 'bg-blue-500 text-white';
                                    else if (pct >= 20) bg = 'bg-blue-300 text-white';
                                    else if (pct >= 10) bg = 'bg-blue-200';
                                    else if (pct >= 5) bg = 'bg-blue-100';
                                    else bg = 'bg-blue-50';
                                }
                                
                                return (
                                    <td key={i} className="p-1">
                                        <div className={`w-full h-8 flex items-center justify-center rounded-md ${bg} text-xs font-medium ${text}`}>
                                            {pct > 0 ? `${pct}%` : '-'}
                                        </div>
                                    </td>
                                );
                            })}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
      </div>

      {/* 상단: 히트맵 + 매트릭스 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Seasonality Heatmap */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col">
          <div className="mb-6">
            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <Calendar size={18} className="text-indigo-600" />
              시즌 & 요일별 매출 지도
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              색이 진할수록 매출이 높은 시기입니다.
            </p>
          </div>
          <div className="flex-1 flex flex-col justify-center">
            <div className="grid grid-cols-8 gap-1 text-xs">
              <div className="text-center font-bold text-slate-400">월\요일</div>
              {heatmapData.weekdays.map((d) => (
                <div key={d} className="text-center font-bold text-slate-600">
                  {d}
                </div>
              ))}
              {heatmapData.months.map((m) => (
                <React.Fragment key={m}>
                  <div className="flex items-center justify-center font-bold text-slate-500">
                    {m}월
                  </div>
                  {heatmapData.weekdays.map((_, dIdx) => {
                    const key = `${m}-${dIdx}`;
                    const val = heatmapData.grid[key] || 0;
                    const intensity = val / heatmapData.maxVal;

                    let bgClass = 'bg-slate-50';
                    if (intensity > 0) bgClass = 'bg-blue-50';
                    if (intensity > 0.25) bgClass = 'bg-blue-200';
                    if (intensity > 0.5) bgClass = 'bg-blue-400';
                    if (intensity > 0.75) bgClass = 'bg-blue-600';

                    return (
                      <div
                        key={key}
                        className={`aspect-square rounded-md ${bgClass} transition-all hover:scale-110 flex items-center justify-center group relative cursor-default`}
                      >
                        {val > 0 && (
                          <div className="hidden group-hover:block absolute bottom-full mb-2 bg-slate-900 text-white p-2 rounded text-[10px] whitespace-nowrap z-10 shadow-lg">
                            {m}월 {heatmapData.weekdays[dIdx]}요일: ₩
                            {(val / 10000).toLocaleString()}
                            만
                          </div>
                        )}
                      </div>
                    );
                  })}
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>

        {/* Menu Matrix */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col">
          <div className="mb-4">
            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <TrendingUp size={18} className="text-emerald-600" />
              수익성 매트릭스
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              X축: 판매건수, Y축: 마진율. 우상단(Star)이 효자 상품입니다.
            </p>
          </div>
          <div className="flex-1 min-h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart
                margin={{
                  top: 10,
                  right: 10,
                  bottom: 10,
                  left: -10,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis
                  type="number"
                  dataKey="count"
                  name="건수"
                  unit="건"
                  tick={{ fontSize: 10 }}
                  stroke="#94a3b8"
                />
                <YAxis
                  type="number"
                  dataKey="margin"
                  name="마진"
                  unit="%"
                  tick={{ fontSize: 10 }}
                  stroke="#94a3b8"
                />
                <ZAxis type="number" dataKey="revenue" range={[60, 600]} />
                <Tooltip
                  cursor={{ strokeDasharray: '3 3' }}
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const d = payload[0].payload as AggregatedMetric;
                      return (
                        <div className="bg-slate-900 text-white p-3 rounded-lg shadow-xl text-xs z-50">
                          <p className="font-bold text-amber-400 mb-1">{d.name}</p>
                          <p>
                            마진: {d.margin}% ({d.count}건)
                          </p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <ReferenceLine x={matrixData.avgCount} stroke="#cbd5e1" strokeDasharray="3 3" />
                <ReferenceLine y={matrixData.avgMargin} stroke="#cbd5e1" strokeDasharray="3 3" />
                <Scatter
                  data={matrixData.data}
                  onClick={(e: any) => {
                    if (!e?.name) return;
                    const brand = String(e.name).split(' ')[0];
                    setFilterBrand(filterBrand === brand ? null : brand);
                  }}
                >
                  {matrixData.data.map((entry, index) => {
                    const isHighMargin = entry.margin >= matrixData.avgMargin;
                    const isHighVol = entry.count >= matrixData.avgCount;

                    let fill = '#94a3b8'; // 기본
                    if (isHighMargin && isHighVol) fill = '#10b981'; // Star
                    else if (!isHighMargin && isHighVol) fill = '#f59e0b'; // Cash Cow
                    else if (isHighMargin && !isHighVol) fill = '#f43f5e'; // Question

                    return (
                      <Cell
                        key={`cell-${index}`}
                        fill={fill}
                        stroke="white"
                        strokeWidth={1}
                      />
                    );
                  })}
                </Scatter>
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Ranking Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden flex flex-col">
        <div className="p-5 border-b border-slate-100 flex justify-between items-center gap-4">
          <div>
            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <MousePointerClick size={18} className="text-slate-600" />
              상세 성과 순위표
            </h3>
          </div>
          <div className="flex bg-slate-100 p-1 rounded-lg">
            <button
              onClick={() => setViewMode('menu')}
              className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all ${
                viewMode === 'menu' ? 'bg-white shadow text-slate-800' : 'text-slate-500'
              }`}
            >
              작업별
            </button>
            <button
              onClick={() => setViewMode('brand')}
              className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all ${
                viewMode === 'brand' ? 'bg-white shadow text-slate-800' : 'text-slate-500'
              }`}
            >
              브랜드별
            </button>
          </div>
        </div>
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse min-w-[900px]">
            <thead className="bg-slate-50 text-slate-500 text-[11px] uppercase font-bold tracking-wider sticky top-0 z-10">
              <tr>
                <th className="px-6 py-4 border-b border-slate-100 w-16">순위</th>
                <th
                  className="px-6 py-4 border-b border-slate-100 cursor-pointer hover:bg-slate-100"
                  onClick={() => handleSort('name')}
                >
                  항목명 {getSortIcon('name')}
                </th>
                <th
                  className="px-6 py-4 border-b border-slate-100 text-right cursor-pointer hover:bg-slate-100"
                  onClick={() => handleSort('revenue')}
                >
                  총 매출 {getSortIcon('revenue')}
                </th>
                <th
                  className="px-6 py-4 border-b border-slate-100 text-right cursor-pointer hover:bg-slate-100"
                  onClick={() => handleSort('profit')}
                >
                  순이익 {getSortIcon('profit')}
                </th>
                <th
                  className="px-6 py-4 border-b border-slate-100 text-right cursor-pointer hover:bg-slate-100"
                  onClick={() => handleSort('margin')}
                >
                  마진율 {getSortIcon('margin')}
                </th>
                <th
                  className="px-6 py-4 border-b border-slate-100 text-right cursor-pointer hover:bg-slate-100"
                  onClick={() => handleSort('asp')}
                >
                  건단가 {getSortIcon('asp')}
                </th>
                <th
                  className="px-6 py-4 border-b border-slate-100 text-right cursor-pointer hover:bg-slate-100"
                  onClick={() => handleSort('count')}
                >
                  건수 {getSortIcon('count')}
                </th>
              </tr>
            </thead>
            <tbody className="text-sm divide-y divide-slate-50">
              {sortedData.map((row, index) => (
                <tr key={row.id} className="group hover:bg-blue-50/40 transition-colors">
                  <td className="px-6 py-4 text-slate-400 font-mono text-xs">
                    {index + 1}
                  </td>
                  <td className="px-6 py-4 font-bold text-slate-700">{row.name}</td>
                  <td className="px-6 py-4 text-right font-mono text-slate-600">
                    ₩ {row.revenue.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-right font-mono font-bold text-slate-800">
                    ₩ {row.profit.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span
                      className={`font-bold ${
                        row.margin >= 50 ? 'text-emerald-600' : 'text-slate-500'
                      }`}
                    >
                      {row.margin}%
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right font-mono text-slate-600">
                    ₩ {row.asp.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-right text-slate-600">{row.count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
