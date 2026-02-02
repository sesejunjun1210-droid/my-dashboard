
import React, { useState } from 'react';
import { SaleRecord } from '../types';
import { Search, Download, Filter, User } from 'lucide-react';

interface SalesTableProps {
  data: SaleRecord[];
}

const SalesTable: React.FC<SalesTableProps> = ({ data }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [rowLimit, setRowLimit] = useState(20);

  const sortedData = [...data].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const filteredData = sortedData.filter(item => {
    const term = searchTerm.toLowerCase();
    return (
      item.description?.toLowerCase().includes(term) ||
      item.category?.toLowerCase().includes(term) ||
      item.brand?.toLowerCase().includes(term) ||
      item.customer_name?.toLowerCase().includes(term) ||
      item.phone?.includes(term)
    );
  });

  const displayData = filteredData.slice(0, rowLimit);

  const getBrandBadge = (brand: string = 'Others') => {
    const b = brand.toLowerCase();
    let styleClass = "text-slate-600 bg-slate-100 border border-slate-200";

    if (b.includes('chanel') || b.includes('샤넬')) styleClass = "text-white bg-black border border-black";
    else if (b.includes('hermes') || b.includes('에르메스')) styleClass = "text-white bg-orange-600 border border-orange-600";
    else if (b.includes('louis') || b.includes('루이비통')) styleClass = "text-white bg-[#8d6e63] border border-[#8d6e63]";
    else if (b.includes('dior') || b.includes('디올')) styleClass = "text-slate-900 bg-white border border-slate-300";
    else if (b.includes('prada') || b.includes('프라다')) styleClass = "text-white bg-slate-900 border border-slate-900";

    return <span className={`inline-block px-2 py-0.5 text-[10px] font-bold tracking-wide uppercase rounded-md shadow-sm ${styleClass}`}>{brand === 'Others' ? '기타' : brand}</span>;
  }

  const exportToCSV = () => {
    const headers = ["날짜", "카테고리", "브랜드", "내용", "채널", "고객명", "전화번호", "매출", "지출", "순수익"];
    const csvContent = "data:text/csv;charset=utf-8,\uFEFF"
      + headers.join(",") + "\n"
      + filteredData.map(e => {
        return [
          e.date, e.category, e.brand, `"${e.description.replace(/"/g, '""')}"`,
          e.sub_category, e.customer_name, e.phone, e.sales, e.cost, e.netProfit
        ].join(",");
      }).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "매출장부_export.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden flex flex-col h-full animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header Controls */}
      <div className="p-5 sm:p-6 border-b border-slate-100 flex flex-col lg:flex-row justify-between items-center gap-4 bg-white sticky top-0 z-20">
        <div className="w-full lg:w-auto text-left">
          <h3 className="text-lg font-bold text-slate-800">상세 매출 장부</h3>
          <p className="text-sm text-slate-500 mt-1">모든 거래 내역을 필터링하고 검색합니다.</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
          <div className="relative group flex-1 sm:w-72">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={18} />
            <input
              type="text"
              placeholder="검색어 입력 (고객명, 브랜드, 전화번호)"
              className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-slate-400"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="flex gap-2">
            <button
              onClick={exportToCSV}
              className="flex-1 sm:flex-none justify-center px-5 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-sm font-bold flex items-center gap-2 transition-all shadow-md shadow-slate-900/10 hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0"
            >
              <Download size={18} />
              <span className="inline">엑셀 다운로드</span>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Card View (Visible < md) */}
      <div className="md:hidden">
        {displayData.length > 0 ? (
          <div className="divide-y divide-slate-100">
            {displayData.map((item) => {
              const margin = item.sales > 0 ? ((item.netProfit / item.sales) * 100).toFixed(0) : '0';
              return (
                <div key={item.id} className="p-4 bg-white hover:bg-slate-50 transition-colors">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex flex-col gap-1">
                      <span className="text-xs font-bold text-slate-400">{item.date}</span>
                      <div className="flex items-center gap-1.5 align-middle">
                        {getBrandBadge(item.brand)}
                        <span className="text-sm font-bold text-slate-800">{item.category}</span>
                      </div>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${item.sub_category === '워크인' ? 'bg-blue-50 text-blue-600' :
                      item.sub_category === '택배' ? 'bg-purple-50 text-purple-600' :
                        'bg-slate-100 text-slate-600'
                      }`}>{item.sub_category}</span>
                  </div>

                  <p className="text-sm text-slate-600 mb-3 font-medium truncate">{item.description}</p>

                  <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-100">
                    <div className="flex flex-col">
                      <span className="text-[10px] text-slate-400 font-bold uppercase">순수익</span>
                      <span className="text-sm font-bold text-slate-900 font-mono">₩ {item.netProfit.toLocaleString()}</span>
                    </div>
                    <div className="flex flex-col items-end">
                      <span className="text-[10px] text-slate-400 font-bold uppercase">매출</span>
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${Number(margin) >= 50 ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-500'
                          }`}>마진 {margin}%</span>
                        <span className="text-sm font-bold text-slate-600 font-mono">₩ {item.sales.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 flex items-center gap-2">
                    <div className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                      <User size={10} />
                    </div>
                    <span className="text-xs font-bold text-slate-600">{item.customer_name || '미입력'}</span>
                    <span className="text-[10px] text-slate-400 font-mono ml-auto">
                      {item.phone ? item.phone.replace(/(\d{3})(\d{4})(\d{4})/, '$1-****-$3') : '-'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-10 text-center text-slate-400">
            <Filter size={32} className="mx-auto mb-3 opacity-20" />
            <p className="text-sm">검색 결과가 없습니다.</p>
          </div>
        )}
      </div>

      {/* Desktop Table View (Hidden < md) */}
      <div className="hidden md:block overflow-x-auto flex-1 custom-scrollbar">
        <table className="w-full text-left border-collapse min-w-[1000px]">
          <thead className="bg-slate-50/80 sticky top-0 z-10 backdrop-blur-sm shadow-sm">
            <tr className="text-slate-500 text-[11px] uppercase tracking-wider font-bold border-b border-slate-200">
              <th className="px-6 py-4 w-28">날짜</th>
              <th className="px-6 py-4">브랜드 / 내용</th>
              <th className="px-6 py-4">고객 정보</th>
              <th className="px-6 py-4 text-center">채널</th>
              <th className="px-6 py-4 text-right">매출(Sales)</th>
              <th className="px-6 py-4 text-right">비용(Cost)</th>
              <th className="px-6 py-4 text-right">순수익(Net)</th>
            </tr>
          </thead>
          <tbody className="text-sm divide-y divide-slate-100">
            {displayData.length > 0 ? (
              displayData.map((item) => {
                const margin = item.sales > 0 ? ((item.netProfit / item.sales) * 100).toFixed(0) : '0';
                return (
                  <tr key={item.id} className="hover:bg-blue-50/30 transition-colors group">
                    <td className="px-6 py-5 text-slate-500 whitespace-nowrap font-medium text-xs font-mono">{item.date}</td>
                    <td className="px-6 py-5">
                      <div className="flex flex-col gap-1.5">
                        <div className="flex items-center gap-2">
                          {getBrandBadge(item.brand)}
                          <span className="text-[10px] text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200 font-medium">{item.category}</span>
                        </div>
                        <span className="text-slate-700 font-medium text-sm truncate max-w-[240px]" title={item.description}>{item.description}</span>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 shrink-0">
                          <User size={14} />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-sm font-bold text-slate-700">{item.customer_name || '미입력'}</span>
                          <span className="text-[11px] text-slate-400 font-mono tracking-tight">
                            {item.phone ? item.phone.replace(/(\d{3})(\d{4})(\d{4})/, '$1-****-$3') : '-'}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5 text-center">
                      <span className={`px-2.5 py-1 rounded-lg text-xs font-bold ${item.sub_category === '워크인' ? 'bg-blue-50 text-blue-600' :
                        item.sub_category === '택배' ? 'bg-purple-50 text-purple-600' :
                          'bg-slate-100 text-slate-600'
                        }`}>{item.sub_category}</span>
                    </td>
                    <td className="px-6 py-5 text-slate-700 text-right font-bold font-mono tracking-tight text-base">
                      ₩ {item.sales.toLocaleString()}
                    </td>
                    <td className="px-6 py-5 text-rose-400 text-right font-mono tracking-tight text-xs font-medium">
                      {item.cost > 0 ? `- ₩ ${item.cost.toLocaleString()}` : '-'}
                    </td>
                    <td className="px-6 py-5 text-right">
                      <div className="flex flex-col items-end gap-0.5">
                        <span className="font-bold text-slate-900 font-mono text-base">₩ {item.netProfit.toLocaleString()}</span>
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${Number(margin) >= 50 ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-50 text-slate-400'
                          }`}>마진 {margin}%</span>
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={7} className="px-6 py-20 text-center">
                  <div className="flex flex-col items-center justify-center text-slate-400">
                    <Filter size={40} className="mb-4 opacity-20" />
                    <p className="text-base font-medium">검색 결과가 없습니다.</p>
                    <p className="text-sm mt-1 text-slate-400">다른 검색어로 시도해보세요.</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {filteredData.length > rowLimit && (
        <div className="p-4 border-t border-slate-100 text-center bg-slate-50/50">
          <button
            onClick={() => setRowLimit(prev => prev + 20)}
            className="px-8 py-2.5 bg-white border border-slate-200 text-slate-600 rounded-full text-sm font-bold hover:bg-slate-50 hover:border-slate-300 hover:text-slate-800 transition-all shadow-sm active:scale-95"
          >
            더 보기 ({filteredData.length - rowLimit}건)
          </button>
        </div>
      )}
    </div>
  );
};

export default SalesTable;
