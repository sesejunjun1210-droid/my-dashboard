import React, { useMemo, useState } from 'react';
import { SaleRecord, CustomerStats } from '../types';
import { batchProcessCustomers } from '../utils/dataIntelligence';
import {
  Clock,
  Search,
  Users,
  Activity,
  Crown,
  Sparkles,
  Phone,
  ChevronRight,
  AlertTriangle,
  Coins,
  Copy,
  CheckCircle2
} from 'lucide-react';

interface CrmMarketingProps {
  data: SaleRecord[];
}

const CrmMarketing: React.FC<CrmMarketingProps> = ({ data }) => {
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerStats | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // 1. Enterprise Intelligence Engine Processing
  const processedCustomers = useMemo(() => {
    return batchProcessCustomers(data);
  }, [data]);

  // 2. Metrics & Segments
  const metrics = useMemo(() => {
    const total = processedCustomers.length;
    const returning = processedCustomers.filter(c => c.visitCount > 1).length;
    const returnRate = total > 0 ? ((returning / total) * 100).toFixed(1) : '0.0';

    // VIP Threshold (Top 1% or > 2M)
    const vvipCount = processedCustomers.filter(c => c.segment === 'VIP').length;

    return { total, returning, returnRate, vvipCount };
  }, [processedCustomers]);

  // 3. Actionable Lists
  const churnRiskList = useMemo(() =>
    processedCustomers
      .filter(c => (c.churnProbability > 0.6 && c.visitCount > 1) || c.segment === 'Risk')
      .sort((a, b) => b.totalSpend - a.totalSpend)
      .slice(0, 20),
    [processedCustomers]);

  const retentionList = useMemo(() =>
    processedCustomers
      .filter(c => c.segment === 'Regular' && c.nextPurchasePrediction?.includes('예상'))
      .slice(0, 20),
    [processedCustomers]);

  const valueAtRisk = churnRiskList.reduce((acc, c) => acc + c.totalSpend, 0);

  // Customer History for Modal
  const customerHistory = useMemo(() => {
    if (!selectedCustomer) return [];
    const cleanPhone = selectedCustomer.phone.replace(/[^0-9]/g, '');
    return data
      .filter((d) => d.phone && d.phone.replace(/[^0-9]/g, '') === cleanPhone)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [selectedCustomer, data]);

  // Handle Smart Script Copy
  const handleCopyScript = (e: React.MouseEvent, type: 'retention' | 'churn', name: string) => {
    e.stopPropagation();
    let text = "";
    if (type === 'retention') {
      text = `[아르티밀라노] 안녕하세요 ${name}님!\n작년에 맡겨주신 소중한 제품은 잘 사용하고 계신가요?\n\n수선 후 1년이 지나 가죽 상태 점검 및 케어가 필요한 시기입니다. 매장 방문해주시면 무상으로 상태 점검 도와드리겠습니다.\n\n편하게 문의주세요! 감사합니다.`;
    } else {
      text = `[아르티밀라노] 안녕하세요 ${name}님, 잘 지내시죠?\n\n요즘 뵙지 못해 안부차 연락드렸습니다. 환절기 가죽 관리 관련하여 궁금하신 점 있으시면 언제든 편하게 연락주세요!\n\n${name}님만을 위한 특별 케어 서비스도 준비되어 있습니다. 감사합니다.`;
    }

    navigator.clipboard.writeText(text).then(() => {
      setToastMessage(`'${name}'님을 위한 ${type === 'retention' ? '점검' : '안부'} 문자가 복사되었습니다!`);
      setTimeout(() => setToastMessage(null), 3000);
    });
  };

  return (
    <div className="space-y-6 pb-20 animate-in fade-in duration-500 relative">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] bg-slate-900 text-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-3 animate-in slide-in-from-bottom-5 fade-in duration-300 w-max max-w-[90%]">
          <CheckCircle2 size={18} className="text-emerald-400 shrink-0" />
          <span className="text-sm font-medium truncate">{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <Users className="text-blue-600" />
            CRM & Intelligence (AI)
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            고객의 이탈 확률과 재방문 주기를 AI가 분석하여 제공합니다.
          </p>
        </div>
      </div>

      {/* KPI Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3.5 bg-blue-50 rounded-2xl text-blue-600 ring-1 ring-blue-100"><Users size={24} /></div>
            <div>
              <p className="text-sm font-medium text-slate-500">총 식별 고객</p>
              <p className="text-3xl font-bold text-slate-900 tracking-tight">{metrics.total}<span className="text-lg font-normal text-slate-400 ml-1">명</span></p>
            </div>
          </div>
          <p className="text-xs text-slate-400 border-t border-slate-50 pt-3">전화번호 기준 유니크 고객</p>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3.5 bg-emerald-50 rounded-2xl text-emerald-600 ring-1 ring-emerald-100"><Activity size={24} /></div>
            <div>
              <p className="text-sm font-medium text-slate-500">재방문 고객</p>
              <p className="text-3xl font-bold text-slate-900 tracking-tight">{metrics.returning}<span className="text-lg font-normal text-slate-400 ml-1">명</span></p>
            </div>
          </div>
          <p className="text-xs text-slate-400 border-t border-slate-50 pt-3">2회 이상 이용한 충성 고객</p>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3.5 bg-amber-50 rounded-2xl text-amber-600 ring-1 ring-amber-100"><Crown size={24} /></div>
            <div>
              <p className="text-sm font-medium text-slate-500">재방문율</p>
              <p className="text-3xl font-bold text-slate-900 tracking-tight">{metrics.returnRate}<span className="text-lg font-normal text-slate-400 ml-1">%</span></p>
            </div>
          </div>
          <p className="text-xs text-slate-400 border-t border-slate-50 pt-3">전체 고객 대비 재방문 비율</p>
        </div>
      </div>

      {/* Actionable Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 1. Retention/Repurchase Opportunity */}
        <div className="bg-gradient-to-br from-indigo-50/50 to-blue-50/50 p-6 rounded-2xl border border-indigo-100 flex flex-col h-full shadow-sm">
          <div className="flex justify-between items-start mb-5">
            <div>
              <h3 className="text-lg font-bold text-indigo-900 flex items-center gap-2">
                <Sparkles size={20} className="text-indigo-600" />
                🔮 AI 재방문 예측
              </h3>
              <p className="text-sm text-indigo-700/70 mt-1">
                고객별 방문 주기를 분석하여 재방문 시기를 예측합니다.
              </p>
            </div>
            <span className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-xs font-bold shrink-0">
              {retentionList.length}명
            </span>
          </div>

          <div className="space-y-3 flex-1 overflow-y-auto max-h-[300px] custom-scrollbar pr-1 -mr-2">
            {retentionList.map((customer, idx) => (
              <div key={idx} className="bg-white p-4 rounded-xl shadow-sm border border-indigo-50/50 flex justify-between items-center group hover:border-indigo-200 transition-all cursor-pointer" onClick={() => setSelectedCustomer(customer)}>
                <div className="overflow-hidden mr-3">
                  <p className="font-bold text-slate-800 text-sm truncate">{customer.name}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded font-mono">{customer.nextPurchasePrediction}</span>
                  </div>
                </div>
                <button
                  onClick={(e) => handleCopyScript(e, 'retention', customer.name)}
                  className="p-3 bg-indigo-50 text-indigo-600 rounded-xl hover:bg-indigo-600 hover:text-white transition-all active:scale-95 shrink-0 shadow-sm border border-indigo-100 hover:border-transparent"
                  title="안부 문자 복사"
                >
                  <Copy size={18} strokeWidth={2.5} />
                </button>
              </div>
            ))}
            {retentionList.length === 0 && (
              <div className="text-center py-10 flex flex-col items-center text-indigo-300">
                <CheckCircle2 size={40} className="mb-2 opacity-50" />
                <p className="text-sm font-medium">예측된 재방문 고객이 없습니다.</p>
              </div>
            )}
          </div>
        </div>

        {/* 2. Churn Risk Radar & Money on Table */}
        <div className="bg-gradient-to-br from-rose-50/50 to-orange-50/50 p-6 rounded-2xl border border-rose-100 flex flex-col h-full shadow-sm">
          <div className="flex flex-col mb-5 gap-4">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-bold text-rose-900 flex items-center gap-2">
                  <AlertTriangle size={20} className="text-rose-600" />
                  🚨 이탈 위험 감지 (AI)
                </h3>
                <p className="text-sm text-rose-700/70 mt-1">
                  평소 주기 대비 이탈 확률이 높은 고객을 식별했습니다.
                </p>
              </div>
              <span className="bg-rose-100 text-rose-700 px-3 py-1 rounded-full text-xs font-bold shrink-0">
                {churnRiskList.length}명
              </span>
            </div>

            {/* Money on the Table Card */}
            {valueAtRisk > 0 && (
              <div className="bg-white border border-rose-100 rounded-xl p-4 flex items-center gap-4 shadow-sm relative overflow-hidden">
                <div className="absolute left-0 top-0 w-1 h-full bg-rose-500"></div>
                <div className="p-2.5 bg-rose-50 rounded-full text-rose-600 shrink-0">
                  <Coins size={20} />
                </div>
                <div className="overflow-hidden">
                  <p className="text-[10px] font-bold text-rose-500 uppercase tracking-wide truncate mb-0.5">Value at Risk</p>
                  <p className="text-sm font-medium text-slate-600 truncate leading-snug">
                    총 <span className="text-rose-600 text-lg font-bold">₩ {valueAtRisk.toLocaleString()}</span> 가치가 이탈 중입니다.
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="space-y-3 flex-1 overflow-y-auto max-h-[240px] custom-scrollbar pr-1 -mr-2">
            {churnRiskList.map((customer, idx) => (
              <div key={idx} className="bg-white p-4 rounded-xl shadow-sm border border-rose-50/50 flex justify-between items-center group hover:border-rose-200 transition-all cursor-pointer" onClick={() => setSelectedCustomer(customer)}>
                <div className="overflow-hidden mr-3">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-bold text-slate-800 text-sm truncate">{customer.name}</p>
                    <span className="text-[10px] bg-rose-100 text-rose-600 px-1.5 py-0.5 rounded font-bold whitespace-nowrap">
                      {(customer.churnProbability * 100).toFixed(0)}% 위험
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 truncate">
                    {customer.reasons[0] || '주기적 방문 패턴 이탈'}
                  </p>
                </div>
                <button
                  onClick={(e) => handleCopyScript(e, 'churn', customer.name)}
                  className="p-3 bg-rose-50 text-rose-600 rounded-xl hover:bg-rose-600 hover:text-white transition-all active:scale-95 shrink-0 shadow-sm border border-rose-100 hover:border-transparent"
                  title="안부 문자 복사"
                >
                  <Copy size={18} strokeWidth={2.5} />
                </button>
              </div>
            ))}
            {churnRiskList.length === 0 && (
              <div className="text-center py-10 flex flex-col items-center text-rose-300">
                <CheckCircle2 size={40} className="mb-2 opacity-50" />
                <p className="text-sm font-medium">위험군 고객이 없습니다.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Top Loyal Customers Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden flex flex-col">
        <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h3 className="text-lg font-bold text-slate-800">
              🎖️ VIP 고객 리스트 (TOP 50)
            </h3>
            <p className="text-sm text-slate-500 mt-1">
              매출 기여도가 가장 높은 최상위 고객 목록입니다.
            </p>
          </div>
          <div className="relative w-full sm:w-auto">
            <input
              type="text"
              placeholder="이름 또는 전화번호 검색"
              className="w-full sm:w-64 pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all placeholder:text-slate-400"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          </div>
        </div>
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left min-w-[700px]">
            <thead className="bg-slate-50/50 text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-100">
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
              {processedCustomers
                .filter(c => c.name.includes(searchTerm) || c.phone.includes(searchTerm))
                .slice(0, 50) // Top 50 directly
                .map((c, i) => {
                  const isVVIP = c.segment === 'VIP';
                  const isRisk = c.segment === 'Risk';

                  return (
                    <tr
                      key={`${c.phone}-${i}`}
                      className="hover:bg-blue-50/30 cursor-pointer transition-colors group"
                      onClick={() => setSelectedCustomer(c)}
                    >
                      <td className="px-6 py-4 font-mono text-slate-400 font-medium">
                        {i < 3 ? <span className="text-base">🥇</span> : i + 1}
                      </td>
                      <td className="px-6 py-4 font-bold text-slate-800">
                        <div className="flex items-center gap-2">
                          <span>{c.name}</span>
                          {isVVIP && (
                            <span className="px-2 py-0.5 bg-slate-900 text-amber-400 text-[10px] rounded-full font-bold shadow-sm flex items-center gap-1 border border-slate-800">
                              <Crown size={10} fill="currentColor" />
                              VIP ({c.vipScore}점)
                            </span>
                          )}
                          {isRisk && (
                            <span className="px-2 py-0.5 bg-rose-100 text-rose-700 text-[10px] rounded-full font-bold border border-rose-200">
                              이탈위험
                            </span>
                          )}
                          {!isVVIP && !isRisk && c.segment === 'Regular' && (
                            <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-[10px] rounded-full font-bold border border-blue-200">
                              단골
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-slate-500 font-mono tracking-tight">
                        {c.phone.replace(/(\d{3})(\d{4})(\d{4})/, '$1-****-$3')}
                      </td>
                      <td className="px-6 py-4 text-right text-slate-700 font-bold group-hover:text-blue-600 transition-colors">
                        {c.visitCount}회
                      </td>
                      <td className="px-6 py-4 text-right font-bold text-blue-600 font-mono">
                        ₩ {c.totalSpend.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-right text-slate-500 font-mono text-xs">{c.lastVisit}</td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
      </div>

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
                <div className="flex items-center gap-4 mb-1">
                  <div
                    className={`w-14 h-14 rounded-full flex items-center justify-center shadow-sm border-2 ${selectedCustomer.segment === 'VIP'
                      ? 'bg-slate-900 border-amber-400 text-amber-400'
                      : 'bg-white border-blue-100 text-blue-600'
                      }`}
                  >
                    {selectedCustomer.segment === 'VIP' ? (
                      <Crown size={28} fill="currentColor" />
                    ) : (
                      <Users size={28} />
                    )}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                      {selectedCustomer.name}
                      {selectedCustomer.segment === 'VIP' && (
                        <span className="px-2.5 py-0.5 bg-slate-900 text-amber-400 text-xs rounded-full font-bold shadow-sm flex items-center gap-1 border border-amber-500/30">
                          <Sparkles size={10} fill="currentColor" />
                          BLACK VVIP
                        </span>
                      )}
                    </h3>
                    <div className="flex flex-wrap items-center gap-2 mt-2 text-slate-500 text-sm">
                      <span className="flex items-center gap-1.5 bg-white px-2 py-1 rounded-md border border-slate-200 text-xs font-mono">
                        <Phone size={12} className="text-slate-400" />
                        {selectedCustomer.phone}
                      </span>
                      {/* Reason Tags */}
                      {selectedCustomer.reasons.map((r, i) => (
                        <span key={i} className="flex items-center gap-1.5 bg-slate-100 px-2 py-1 rounded-md border border-slate-200 text-xs text-slate-600">
                          {r}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setSelectedCustomer(null)}
                className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-400 hover:text-slate-600"
              >
                <Clock size={20} />
              </button>
            </div>

            {/* Timeline (History) */}
            <div className="flex-1 overflow-y-auto p-6 bg-slate-50 custom-scrollbar">
              <div className="flex justify-between items-end mb-6">
                <h4 className="text-sm font-bold text-slate-700 flex items-center gap-2">
                  <Activity size={16} className="text-blue-500" />
                  상세 방문 타임라인 (History)
                </h4>
              </div>

              <div className="relative pl-4 space-y-8 before:absolute before:left-[19px] before:top-2 before:bottom-4 before:w-0.5 before:bg-slate-200 before:border-l before:border-dashed before:border-slate-300">
                {customerHistory.map((record, idx) => (
                  <div key={record.id} className="relative pl-10 group">
                    <div className="absolute left-0 top-1.5 w-10 h-10 flex items-center justify-center z-10 transition-transform duration-300 group-hover:scale-110">
                      <div
                        className={`w-3 h-3 rounded-full shadow-sm ring-4 ring-white ${idx === 0 ? 'bg-blue-600' : 'bg-slate-300'
                          }`}
                      />
                    </div>
                    <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 group-hover:shadow-md group-hover:border-blue-200 transition-all">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex flex-col">
                          <span className="text-xs font-bold bg-slate-100 text-slate-600 px-2 py-1 rounded mb-1 w-fit border border-slate-200 font-mono">
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
                      <div className="bg-slate-50/50 p-3 rounded-xl border border-slate-100/50">
                        <p className="text-sm text-slate-600 leading-relaxed break-keep">
                          {record.description || '비고 내용이 없습니다.'}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CrmMarketing;
