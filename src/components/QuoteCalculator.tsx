import React, { useState, useMemo } from 'react';
import { SaleRecord } from '../types';
import {
  Search,
  Calculator,
  TrendingUp,
  Info,
  Tag,
  Briefcase,
  History,
  ArrowRight
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  ReferenceLine
} from 'recharts';

interface QuoteCalculatorProps {
  data: SaleRecord[];
}

const QuoteCalculator: React.FC<QuoteCalculatorProps> = ({ data }) => {
  const [selectedBrand, setSelectedBrand] = useState<string>('All');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [keyword, setKeyword] = useState<string>('');

  // Extract unique options
  const brands = useMemo(() => {
    const unique = new Set(data.map(d => d.brand).filter(b => b && b !== 'Others'));
    return ['All', ...Array.from(unique).sort()];
  }, [data]);

  const categories = useMemo(() => {
    const unique = new Set(data.map(d => d.category).filter(c => c));
    return ['All', ...Array.from(unique).sort()];
  }, [data]);

  // Filter Logic
  const filteredRecords = useMemo(() => {
    if (!data.length) return [];

    return data.filter(item => {
      const matchBrand = selectedBrand === 'All' || item.brand === selectedBrand;
      const matchCategory = selectedCategory === 'All' || item.category === selectedCategory;
      const matchKeyword = !keyword ||
        item.description.toLowerCase().includes(keyword.toLowerCase()) ||
        item.sub_category.toLowerCase().includes(keyword.toLowerCase());

      return matchBrand && matchCategory && matchKeyword && item.sales > 0;
    }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [data, selectedBrand, selectedCategory, keyword]);

  // Statistics
  const stats = useMemo(() => {
    if (filteredRecords.length === 0) return null;

    const prices = filteredRecords.map(r => r.sales);
    const sum = prices.reduce((a, b) => a + b, 0);
    const avg = Math.round(sum / prices.length);
    const min = Math.min(...prices);
    const max = Math.max(...prices);

    // Median
    const sortedPrices = [...prices].sort((a, b) => a - b);
    const mid = Math.floor(sortedPrices.length / 2);
    const median = sortedPrices.length % 2 !== 0
      ? sortedPrices[mid]
      : (sortedPrices[mid - 1] + sortedPrices[mid]) / 2;

    return { avg, min, max, median, count: prices.length };
  }, [filteredRecords]);

  // Chart Data (Price Distribution)
  const chartData = useMemo(() => {
    if (!stats || !filteredRecords.length) return [];

    // Create buckets based on range
    const step = 50000; // 5만원 단위
    const bucketMap: Record<string, number> = {};

    filteredRecords.forEach(r => {
      const bucketIndex = Math.floor(r.sales / step);
      const bucketStart = bucketIndex * step;
      const bucketLabel = `${(bucketStart / 10000).toLocaleString()}~${((bucketStart + step) / 10000).toLocaleString()}만`;
      bucketMap[bucketLabel] = (bucketMap[bucketLabel] || 0) + 1;
    });

    return Object.entries(bucketMap).map(([name, count]) => ({
      name,
      count
    })).sort((a, b) => {
      // Sort by range value (extracted from string)
      const valA = parseInt(a.name.replace(/[^0-9]/g, ''));
      const valB = parseInt(b.name.replace(/[^0-9]/g, ''));
      return valA - valB;
    });
  }, [filteredRecords, stats]);

  return (
    <div className="space-y-6 pb-20 animate-in fade-in duration-500">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 p-6 rounded-2xl shadow-lg border border-slate-700 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-10">
          <Calculator className="w-[120px] h-[120px]" />
        </div>
        <div className="relative z-10 max-w-2xl">
          <h2 className="text-2xl font-bold flex items-center gap-3 mb-2">
            <Calculator className="text-amber-400" />
            AI 스마트 견적 계산기
          </h2>
          <p className="text-slate-300 leading-relaxed">
            과거 시공 데이터를 분석하여 <strong>최적의 견적가</strong>를 제안합니다.<br />
            비슷한 브랜드와 작업 내용을 검색하여 시세 분포를 확인하세요.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        {/* Controls Section (Left) */}
        <div className="xl:col-span-4 space-y-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 h-full">
            <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
              <Search size={20} className="text-blue-600" />
              조건 검색
            </h3>

            <div className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2 flex items-center gap-1">
                  <Briefcase size={14} /> 브랜드
                </label>
                <select
                  value={selectedBrand}
                  onChange={(e) => setSelectedBrand(e.target.value)}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                >
                  {brands.map(b => <option key={b} value={b}>{b === 'All' ? '전체 브랜드' : b}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2 flex items-center gap-1">
                  <Tag size={14} /> 카테고리
                </label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                >
                  {categories.map(c => <option key={c} value={c}>{c === 'All' ? '전체 카테고리' : c}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2 flex items-center gap-1">
                  <Info size={14} /> 키워드 (작업내용)
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={keyword}
                    onChange={(e) => setKeyword(e.target.value)}
                    placeholder="예: 염색, 클리닝, 밑창..."
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-slate-400"
                  />
                  <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                </div>
                <p className="text-xs text-slate-400 mt-2">
                  상세 작업 내용(예: '전체염색', '안감교체')을 입력하면 더 정확도가 높아집니다.
                </p>
              </div>

              <div className="pt-4 border-t border-slate-100">
                <div className="flex justify-between items-center text-sm text-slate-600">
                  <span>검색 결과</span>
                  <span className="font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">
                    {filteredRecords.length}건
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Results Section (Right) */}
        <div className="xl:col-span-8 space-y-6">
          {filteredRecords.length > 0 && stats ? (
            <>
              {/* Price Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center justify-center text-center relative overflow-hidden group">
                  <div className="absolute top-0 w-full h-1 bg-gradient-to-r from-blue-400 to-blue-600"></div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">평균 견적가 (Average)</p>
                  <p className="text-3xl font-bold text-slate-800 group-hover:scale-105 transition-transform">
                    ₩ {stats.avg.toLocaleString()}
                  </p>
                </div>
                <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center justify-center text-center relative overflow-hidden group">
                  <div className="absolute top-0 w-full h-1 bg-gradient-to-r from-emerald-400 to-emerald-600"></div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">중위 가격 (Median)</p>
                  <p className="text-3xl font-bold text-emerald-600 group-hover:scale-105 transition-transform">
                    ₩ {stats.median.toLocaleString()}
                  </p>
                </div>
                <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center justify-center text-center relative overflow-hidden group">
                  <div className="absolute top-0 w-full h-1 bg-gradient-to-r from-slate-200 to-slate-400"></div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">범위 (Range)</p>
                  <div className="flex items-center gap-2 group-hover:scale-105 transition-transform">
                    <span className="text-lg font-bold text-slate-600">₩ {(stats.min / 10000).toFixed(0)}만</span>
                    <ArrowRight size={14} className="text-slate-300" />
                    <span className="text-lg font-bold text-slate-600">₩ {(stats.max / 10000).toFixed(0)}만</span>
                  </div>
                </div>
              </div>

              {/* Distribution Chart */}
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                <div className="mb-6">
                  <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                    <TrendingUp size={18} className="text-emerald-500" />
                    금액대별 분포 (유사 작업)
                  </h3>
                  <p className="text-xs text-slate-500">
                    검색된 작업들이 주로 어느 가격대에 형성되어 있는지 보여줍니다.
                  </p>
                </div>
                <div className="h-[250px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <XAxis
                        dataKey="name"
                        tick={{ fontSize: 10, fill: '#64748b' }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <YAxis
                        tick={{ fontSize: 10, fill: '#64748b' }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <Tooltip
                        cursor={{ fill: '#f1f5f9' }}
                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                      />
                      <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                        {chartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.name.includes(`${(stats.avg / 10000).toFixed(0)}`) ? '#3b82f6' : '#cbd5e1'} />
                        ))}
                      </Bar>
                      <ReferenceLine x={stats.avg} stroke="red" strokeDasharray="3 3" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Similar Records Table */}
              <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                  <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                    <History size={18} className="text-slate-500" />
                    최근 유사 작업 내역 (Reference)
                  </h3>
                </div>
                <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
                  <table className="w-full text-left">
                    <thead className="bg-white sticky top-0 z-10 shadow-sm">
                      <tr className="text-xs font-bold text-slate-500 uppercase border-b border-slate-100">
                        <th className="px-5 py-3">날짜</th>
                        <th className="px-5 py-3">브랜드/카테고리</th>
                        <th className="px-5 py-3">작업 내용</th>
                        <th className="px-5 py-3 text-right">매출액</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-sm">
                      {filteredRecords.slice(0, 50).map((record) => (
                        <tr key={record.id} className="hover:bg-slate-50 transition-colors">
                          <td className="px-5 py-3 text-slate-500 whitespace-nowrap text-xs font-mono">{record.date}</td>
                          <td className="px-5 py-3">
                            <div className="flex flex-col">
                              <span className="font-bold text-slate-700">{record.brand}</span>
                              <span className="text-xs text-slate-400">{record.category}</span>
                            </div>
                          </td>
                          <td className="px-5 py-3 text-slate-600 max-w-xs truncate" title={record.description}>
                            {record.description}
                          </td>
                          <td className="px-5 py-3 text-right font-bold text-slate-800 font-mono">
                            ₩ {record.sales.toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

            </>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-slate-400 bg-white rounded-2xl border border-slate-100 border-dashed p-10">
              <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                <Search size={32} className="opacity-20" />
              </div>
              <p className="text-lg font-bold text-slate-500">조건을 선택해주세요</p>
              <p className="text-sm mt-1">좌측 패널에서 브랜드, 카테고리 또는 키워드를 입력하면 분석 결과가 나타납니다.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuoteCalculator;
