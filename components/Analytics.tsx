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
} from 'recharts';
import { SaleRecord, CustomerStats } from '../types';
import {
  TrendingUp,
  Activity,
  ArrowUp,
  ArrowDown,
  Minus,
  MousePointerClick,
  Calendar,
  Users,
  Crown,
  X,
  History,
  Phone,
  CreditCard,
  Clock,
  Star,
  CalendarDays,
  Gem,
  Sparkles,
  Tag,
  ChevronRight,
} from 'lucide-react';

interface AnalyticsProps {
  data: SaleRecord[];
}

interface AggregatedMetric {
  id: string;
  name: string;
  count: number;
  revenue: number;
  profit: number;
  asp: number;
  margin: number;
  reworkCount: number;
  reworkRate: number;
}

// 기존 CustomerStats(전화/이름/visitCount/totalSpend/lastVisit)에
// dates/avgCycle/firstVisit만 로컬에서 추가로 쓰기 위한 확장 타입
interface EnhancedCustomerStats extends CustomerStats {
  dates: Date[];
  avgCycle: number; // days
  firstVisit: string;
}

const Analytics: React.FC<AnalyticsProps> = ({ data }) => {
  const [filterBrand, setFilterBrand] = useState<string | null>(null);
  const [sortConfig, setSortConfig] = useState<{
    key: keyof AggregatedMetric;
    direction: 'asc' | 'desc';
  }>({ key: 'profit', direction: 'desc' });
  const [viewMode, setViewMode] = useState<'brand' | 'menu'>('menu');
  const [analyticsTab, setAnalyticsTab] = useState<'trends' | 'retention'>('trends');

  // CRM State
  const [selectedCustomer, setSelectedCustomer] = useState<EnhancedCustomerStats | null>(null);

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

  // 3. Customer Retention / CRM Data
  const retentionData = useMemo(() => {
    const map = new Map<string, EnhancedCustomerStats>();

    data.forEach((item) => {
      // 유령 데이터 정리: 번호 없거나 0000 포함 → CRM에서는 제외
      if (!item.phone || item.phone.length < 4 || item.phone.includes('0000')) return;

      const phoneKey = item.phone.replace(/[^0-9]/g, '');
      if (!map.has(phoneKey)) {
        map.set(phoneKey, {
          phone: item.phone,
          name: item.customer_name || `고객(${item.phone.slice(-4)})`,
          visitCount: 0,
          totalSpend: 0,
          lastVisit: item.date,
          firstVisit: item.date,
          dates: [],
          avgCycle: 0,
        });
      }

      const stat = map.get(phoneKey)!;
      stat.visitCount += 1;
      stat.totalSpend += item.sales;

      const currentDate = new Date(item.date);
      if (!Number.isNaN(currentDate.getTime())) {
        stat.dates.push(currentDate);
        if (currentDate > new Date(stat.lastVisit)) {
          stat.lastVisit = item.date;
        }
      }
    });

    const allCustomers = Array.from(map.values());

    // 재방문 주기 계산
    allCustomers.forEach((c) => {
      if (c.dates.length > 1) {
        const sortedDates = [...c.dates].sort((a, b) => a.getTime() - b.getTime());
        c.firstVisit = sortedDates[0].toISOString().split('T')[0];

        let totalDiff = 0;
        for (let i = 1; i < sortedDates.length; i += 1) {
          totalDiff += sortedDates[i].getTime() - sortedDates[i - 1].getTime();
        }

        const days = totalDiff / (c.visitCount - 1) / (1000 * 60 * 60 * 24);
        c.avgCycle = Math.round(days);
      }
    });

    // VVIP 기준: 상위 1% 지출액, 최소 200만 이상
    const spends = allCustomers.map((c) => c.totalSpend).sort((a, b) => b - a);
    const top1PercentIndex = Math.max(0, Math.floor(spends.length * 0.01) - 1);
    const vvipThreshold = spends[top1PercentIndex] || 2_000_000;

    const returningCustomers = allCustomers.filter((c) => c.visitCount > 1);

    const topLoyal = [...allCustomers]
      .sort((a, b) => b.totalSpend - a.totalSpend)
      .slice(0, 50); // TOP 50
    const topFrequent = [...allCustomers]
      .sort((a, b) => b.visitCount - a.visitCount)
      .slice(0, 10);

    return {
      total: allCustomers.length,
      returning: returningCustomers.length,
      returnRate:
        allCustomers.length > 0
          ? ((returningCustomers.length / allCustomers.length) * 100).toFixed(1)
          : '0.0',
      topLoyal,
      topFrequent,
      vvipThreshold,
    };
  }, [data]);

  // 선택 고객 히스토리
  const customerHistory = useMemo(() => {
    if (!selectedCustomer) return [];
    const cleanPhone = selectedCustomer.phone.replace(/[^0-9]/g, '');
    return data
      .filter((d) => d.phone && d.phone.replace(/[^0-9]/g, '') === cleanPhone)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [selectedCustomer, data]);

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

  const predictNextVisit = (lastVisit: string, cycle: number) => {
    if (!cycle || cycle <= 0) return null;
    const d = new Date(lastVisit);
    if (Number.isNaN(d.getTime())) return null;
    d.setDate(d.getDate() + cycle);
    return d.toISOString().split('T')[0];
  };

  return (
    <div className="space-y-6 pb-20 animate-in fade-in duration-500">
      {/* Header & Tabs */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <Activity className="text-blue-600" />
            비즈니스 분석
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            수익 구조와 고객 충성도를 입체적으로 분석합니다.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setAnalyticsTab('trends')}
            className={`px-4 py-2 text-sm font-bold rounded-xl transition-all ${
              analyticsTab === 'trends'
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30'
                : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
            }`}
          >
            트렌드 & 수익성
          </button>
          <button
            onClick={() => setAnalyticsTab('retention')}
            className={`px-4 py-2 text-sm font-bold rounded-xl transition-all ${
              analyticsTab === 'retention'
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30'
                : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
            }`}
          >
            고객 재방문 (CRM)
          </button>
        </div>
      </div>

      {analyticsTab === 'trends' ? (
        <>
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
        </>
      ) : (
        // ==========================
        // 고객 재방문 (CRM) 탭
        // ==========================
        <div className="space-y-6">
          {/* Retention Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-blue-50 rounded-xl text-blue-600">
                  <Users size={24} />
                </div>
                <div>
                  <p className="text-sm text-slate-500">총 식별 고객</p>
                  <p className="text-2xl font-bold text-slate-900">{retentionData.total}명</p>
                </div>
              </div>
              <p className="text-xs text-slate-400">전화번호 기준 식별된 고유 고객 수</p>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-emerald-50 rounded-xl text-emerald-600">
                  <Activity size={24} />
                </div>
                <div>
                  <p className="text-sm text-slate-500">재방문 고객</p>
                  <p className="text-2xl font-bold text-slate-900">
                    {retentionData.returning}명
                  </p>
                </div>
              </div>
              <p className="text-xs text-slate-400">2회 이상 서비스를 이용한 고객</p>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-amber-50 rounded-xl text-amber-600">
                  <Crown size={24} />
                </div>
                <div>
                  <p className="text-sm text-slate-500">고객 재방문율</p>
                  <p className="text-2xl font-bold text-slate-900">
                    {retentionData.returnRate}%
                  </p>
                </div>
              </div>
              <p className="text-xs text-slate-400">
                전체 고객 대비 재방문 고객 비율
              </p>
            </div>
          </div>

          {/* Top Customers List */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="p-6 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-800">
                🎖️ VIP 고객 (매출 기준 TOP 50)
              </h3>
              <p className="text-sm text-slate-500">
                테이블 행을 클릭하면 해당 고객의 <strong>전체 방문 이력(타임라인)</strong>을 확인할
                수 있습니다.
              </p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50 text-xs font-bold text-slate-500 uppercase">
                  <tr>
                    <th className="px-6 py-4">순위</th>
                    <th className="px-6 py-4">고객명 & 등급</th>
                    <th className="px-6 py-4">전화번호</th>
                    <th className="px-6 py-4 text-right">총 방문 횟수</th>
                    <th className="px-6 py-4 text-right">총 매출 기여</th>
                    <th className="px-6 py-4 text-right">최근 방문일</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {retentionData.topLoyal.map((c, i) => {
                    const isVVIP = c.totalSpend >= retentionData.vvipThreshold;
                    const isRegular = c.visitCount >= 3;

                    return (
                      <tr
                        key={`${c.phone}-${i}`}
                        className="hover:bg-blue-50/50 cursor-pointer transition-colors group"
                        onClick={() => setSelectedCustomer(c)}
                      >
                        <td className="px-6 py-4 font-mono text-slate-400">
                          {i < 3 ? <span className="text-base">🥇</span> : i + 1}
                        </td>
                        <td className="px-6 py-4 font-bold text-slate-800">
                          <div className="flex items-center gap-2">
                            <span>{c.name}</span>
                            {isVVIP && (
                              <span className="px-2 py-0.5 bg-black text-amber-400 text-[10px] rounded-full font-bold shadow-sm flex items-center gap-1 border border-amber-500/30">
                                <Crown size={10} fill="currentColor" />
                                VVIP
                              </span>
                            )}
                            {!isVVIP && isRegular && (
                              <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-[10px] rounded-full font-bold border border-blue-200">
                                단골
                              </span>
                            )}
                            {!isVVIP && !isRegular && c.visitCount === 1 && (
                              <span className="px-2 py-0.5 bg-slate-100 text-slate-500 text-[10px] rounded-full font-bold">
                                New
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-slate-500">
                          {c.phone.replace(/(\d{3})(\d{4})(\d{4})/, '$1-****-$3')}
                        </td>
                        <td className="px-6 py-4 text-right text-slate-700 font-semibold group-hover:text-blue-600 transition-colors">
                          {c.visitCount}회
                        </td>
                        <td className="px-6 py-4 text-right font-bold text-blue-600">
                          ₩ {c.totalSpend.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 text-right text-slate-500">{c.lastVisit}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Customer Detail Modal (Timeline & CRM) */}
      {selectedCustomer && (
        <div
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-in fade-in duration-300"
          onClick={() => setSelectedCustomer(null)}
        >
          <div
            className="bg-white rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl animate-in zoom-in-95 duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-100 flex justify-between items-start bg-slate-50/50 rounded-t-2xl">
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <div
                    className={`w-14 h-14 rounded-full flex items-center justify-center shadow-lg border-2 ${
                      selectedCustomer.totalSpend >= retentionData.vvipThreshold
                        ? 'bg-black border-amber-400 text-amber-400'
                        : 'bg-white border-blue-100 text-blue-600'
                    }`}
                  >
                    {selectedCustomer.totalSpend >= retentionData.vvipThreshold ? (
                      <Crown size={28} fill="currentColor" />
                    ) : (
                      <Users size={28} />
                    )}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                      {selectedCustomer.name}
                      {selectedCustomer.totalSpend >= retentionData.vvipThreshold && (
                        <span className="px-3 py-1 bg-black text-amber-400 text-xs rounded-full font-bold shadow-sm flex items-center gap-1 border border-amber-500/50">
                          <Sparkles size={12} />
                          BLACK VVIP
                        </span>
                      )}
                      {selectedCustomer.totalSpend < retentionData.vvipThreshold &&
                        selectedCustomer.visitCount >= 3 && (
                          <span className="px-3 py-1 bg-blue-600 text-white text-xs rounded-full font-bold shadow-sm flex items-center gap-1">
                            <Star size={12} fill="currentColor" />
                            단골 고객
                          </span>
                        )}
                    </h3>
                    <div className="flex flex-wrap items-center gap-2 mt-2 text-slate-500 text-sm">
                      <span className="flex items-center gap-1.5 bg-white px-2 py-1 rounded-md border border-slate-200">
                        <Phone size={14} className="text-slate-400" />
                        {selectedCustomer.phone}
                      </span>
                      <span className="flex items-center gap-1.5 bg-white px-2 py-1 rounded-md border border-slate-200">
                        <CalendarDays size={14} className="text-slate-400" />
                        첫 방문: {selectedCustomer.firstVisit}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setSelectedCustomer(null)}
                className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-400 hover:text-slate-600"
              >
                <X size={20} />
              </button>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-slate-100 border-b border-slate-100 bg-white">
              <div className="p-5 text-center">
                <p className="text-xs font-medium text-slate-400 mb-2 flex items-center justify-center gap-1">
                  <CreditCard size={14} />
                  총 결제액 (LTV)
                </p>
                <p className="text-xl font-bold text-slate-900">
                  ₩ {selectedCustomer.totalSpend.toLocaleString()}
                </p>
              </div>
              <div className="p-5 text-center">
                <p className="text-xs font-medium text-slate-400 mb-2 flex items-center justify-center gap-1">
                  <History size={14} />
                  총 방문 횟수
                </p>
                <p className="text-xl font-bold text-blue-600">
                  {selectedCustomer.visitCount}회
                </p>
              </div>
              <div className="p-5 text-center bg-blue-50/20">
                <p className="text-xs font-medium text-blue-500 mb-2 flex items-center justify-center gap-1">
                  <Clock size={14} />
                  재방문 주기
                </p>
                <p className="text-xl font-bold text-slate-800">
                  {selectedCustomer.avgCycle > 0 ? `약 ${selectedCustomer.avgCycle}일` : '-'}
                </p>
              </div>
              <div className="p-5 text-center bg-amber-50/20">
                <p className="text-xs font-medium text-amber-500 mb-2 flex items-center justify-center gap-1">
                  <Gem size={14} />
                  다음 방문 예상
                </p>
                <p className="text-xl font-bold text-amber-600">
                  {predictNextVisit(selectedCustomer.lastVisit, selectedCustomer.avgCycle) || '-'}
                </p>
              </div>
            </div>

            {/* Timeline (History) */}
            <div className="flex-1 overflow-y-auto p-6 bg-slate-50">
              <div className="flex justify-between items-end mb-6">
                <h4 className="text-sm font-bold text-slate-700 flex items-center gap-2">
                  <Activity size={16} className="text-blue-500" />
                  상세 방문 타임라인 (History)
                </h4>
                <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">
                  Latest First
                </span>
              </div>

              <div className="relative pl-4 space-y-8 before:absolute before:left-[19px] before:top-2 before:bottom-4 before:w-0.5 before:bg-slate-200 before:border-l before:border-dashed before:border-slate-300">
                {customerHistory.map((record, idx) => (
                  <div key={record.id} className="relative pl-10 group">
                    {/* Timeline Dot */}
                    <div className="absolute left-0 top-1.5 w-10 h-10 flex items-center justify-center z-10 transition-transform duration-300 group-hover:scale-110">
                      <div
                        className={`w-3 h-3 rounded-full shadow-sm ring-4 ring-white ${
                          idx === 0 ? 'bg-blue-600' : 'bg-slate-300'
                        }`}
                      />
                    </div>

                    {/* Card */}
                    <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 group-hover:shadow-md group-hover:border-blue-200 transition-all">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex flex-col">
                          <span
                            className={`text-xs font-bold px-2 py-1 rounded mb-1 w-fit ${
                              idx === 0 ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            {record.date}
                          </span>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-slate-800">
                              {record.brand || '기타'}
                            </span>
                            <ChevronRight size={12} className="text-slate-300" />
                            <span className="text-sm text-slate-600">{record.category}</span>
                          </div>
                        </div>
                        <span className="text-sm font-mono font-bold text-slate-900 bg-slate-50 px-2 py-1 rounded-lg border border-slate-100">
                          ₩ {record.sales.toLocaleString()}
                        </span>
                      </div>

                      <div className="bg-slate-50/50 p-3 rounded-xl border border-slate-100">
                        <p className="text-sm text-slate-600 leading-relaxed break-keep">
                          {record.description || '비고 내용이 없습니다.'}
                        </p>
                        {record.sub_category && (
                          <div className="flex justify-end mt-2">
                            <span className="text-[10px] bg-white border border-slate-200 px-2 py-0.5 rounded-full text-slate-400 flex items-center gap-1">
                              <Tag size={10} />
                              {record.sub_category}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {customerHistory.length === 0 && (
                <div className="text-center text-slate-400 py-10 flex flex-col items-center">
                  <History size={40} className="mb-2 opacity-20" />
                  기록된 상세 내역이 없습니다.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Analytics;
