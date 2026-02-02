
import React, { useMemo, useState } from 'react';
import { CustomerStats } from '../types';
import { batchProcessCustomers } from '../utils/dataIntelligence';
import { generateScript } from '../services/retentionEngine';
import {
    Target,
    Zap,
    MessageSquare,
    Clock,
    AlertTriangle,
    Copy,
    ChevronRight,
    Crown
} from 'lucide-react';

interface RetentionCommandCenterProps {
    data: any[]; // will be typed properly in implementation
}

const RetentionCommandCenter: React.FC<RetentionCommandCenterProps> = ({ data }) => {
    const [selectedCustomer, setSelectedCustomer] = useState<CustomerStats | null>(null);

    // 1. Processing
    const processedCustomers = useMemo(() => {
        return batchProcessCustomers(data);
    }, [data]);

    // 2. Metrics
    const retentionMetrics = useMemo(() => {
        const totalCLV = processedCustomers.reduce((acc, c) => acc + (c.clv || 0), 0);
        const avgRetentionScore = processedCustomers.reduce((acc, c) => acc + (c.retentionScore || 0), 0) / processedCustomers.length;
        const actionRequired = processedCustomers.filter(c => c.nextServiceWindow.start <= new Date().toISOString().split('T')[0]).length;

        return { totalCLV, avgRetentionScore, actionRequired };
    }, [processedCustomers]);

    // 3. Golden Window List (Upcoming Service Needs)
    const goldenWindowList = useMemo(() => {
        return processedCustomers
            .filter(c => c.segment !== 'Lost' && c.nextServiceWindow.end > new Date().toISOString().split('T')[0])
            .sort((a, b) => new Date(a.nextServiceWindow.start).getTime() - new Date(b.nextServiceWindow.start).getTime())
            .slice(0, 50);
    }, [processedCustomers]);

    return (
        <div className="space-y-6 pb-20 animate-in fade-in duration-500 font-sans text-slate-900">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row justify-between items-end gap-4 bg-slate-900 text-white p-8 rounded-3xl shadow-2xl relative overflow-hidden">
                {/* Background Effects */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500 rounded-full blur-[100px] opacity-20 animate-pulse"></div>
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-rose-500 rounded-full blur-[80px] opacity-10"></div>

                <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-white/10 rounded-lg backdrop-blur-md border border-white/20">
                            <Zap className="text-amber-300 fill-amber-300" size={20} />
                        </div>
                        <span className="text-xs font-bold tracking-widest text-indigo-200 uppercase">Retention Command Center</span>
                    </div>
                    <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-2">L'Artisan Loop™</h1>
                    <p className="text-slate-300 text-sm max-w-lg leading-relaxed">
                        Enterprise Clienteling System. 예측 기반의 고객 생애 가치(CLV) 관리 및 초개인화 리텐션 엔진.
                    </p>
                </div>

                <div className="flex gap-4 relative z-10">
                    <div className="bg-white/10 backdrop-blur-md border border-white/10 p-4 rounded-2xl min-w-[140px]">
                        <p className="text-[10px] text-slate-300 uppercase font-bold tracking-wider mb-1">평균 리텐션 점수</p>
                        <p className="text-2xl font-bold text-emerald-400">{retentionMetrics.avgRetentionScore.toFixed(1)} <span className="text-sm font-normal text-white/50">/ 100</span></p>
                    </div>
                    <div className="bg-white/10 backdrop-blur-md border border-white/10 p-4 rounded-2xl min-w-[140px]">
                        <p className="text-[10px] text-slate-300 uppercase font-bold tracking-wider mb-1">조치 필요 (Action Required)</p>
                        <p className="text-2xl font-bold text-amber-400">{retentionMetrics.actionRequired} <span className="text-sm font-normal text-white/50">건</span></p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Panel: Golden Window Timeline */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-lg font-bold flex items-center gap-2">
                                <Clock className="text-indigo-600" size={20} />
                                Golden Window (골든 윈도우)
                            </h3>
                            <span className="text-xs bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full font-bold">
                                재방문 최적기 예측
                            </span>
                        </div>

                        <div className="space-y-4">
                            {goldenWindowList.map((customer, idx) => {
                                const isUrgent = new Date(customer.nextServiceWindow.start) <= new Date();
                                return (
                                    <div
                                        key={idx}
                                        onClick={() => setSelectedCustomer(customer)}
                                        className={`group relative flex items - center gap - 4 p - 4 rounded - xl border transition - all cursor - pointer hover: shadow - md ${selectedCustomer?.phone === customer.phone
                                            ? 'bg-slate-50 border-indigo-500 ring-1 ring-indigo-500'
                                            : 'bg-white border-slate-100 hover:border-indigo-200'
                                            } `}
                                    >
                                        {/* Status Indicator */}
                                        <div className={`w - 1.5 self - stretch rounded - full ${isUrgent ? 'bg-rose-500' : 'bg-emerald-400'} `} />

                                        {/* Date Box */}
                                        <div className="flex flex-col items-center justify-center min-w-[60px] p-2 bg-slate-50 rounded-lg border border-slate-200">
                                            <span className="text-[10px] text-slate-500 font-bold uppercase">{customer.nextServiceWindow.start.split('-')[1]}월</span>
                                            <span className="text-lg font-bold text-slate-800">{customer.nextServiceWindow.start.split('-')[2]}</span>
                                        </div>

                                        {/* Content */}
                                        <div className="flex-1">
                                            <div className="flex justify-between mb-1">
                                                <h4 className="font-bold text-slate-800 group-hover:text-indigo-700 transition-colors">
                                                    {customer.name} <span className="text-slate-400 font-normal">({customer.persona})</span>
                                                </h4>
                                                {isUrgent && <span className="text-[10px] font-bold text-rose-500 flex items-center gap-1 animate-pulse"><AlertTriangle size={10} /> 케어 시급</span>}
                                            </div>
                                            <p className="text-xs text-slate-500">
                                                예상 주기: <span className="font-mono font-bold text-slate-700">{customer.avgInterPurchaseTime}일</span> ·
                                                최근 방문: {customer.lastVisit}
                                            </p>
                                        </div>

                                        {/* Action Icon */}
                                        <ChevronRight className="text-slate-300 group-hover:text-indigo-500 transition-colors opacity-0 group-hover:opacity-100" />
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Right Panel: Persona Script & Detail */}
                <div className="space-y-6">
                    {selectedCustomer ? (
                        <div className="bg-white p-6 rounded-2xl shadow-lg border border-indigo-100 h-full sticky top-6 animate-in slide-in-from-right-4 duration-500">
                            <div className="flex items-center gap-4 mb-6 pb-6 border-b border-slate-100">
                                <div className={`w - 12 h - 12 rounded - full flex items - center justify - center text - lg font - bold shadow - sm ${selectedCustomer.segment === 'VIP' ? 'bg-slate-900 text-amber-400' : 'bg-indigo-50 text-indigo-600'
                                    } `}>
                                    {selectedCustomer.segment === 'VIP' ? <Crown size={20} fill="currentColor" /> : selectedCustomer.name[0]}
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-slate-900">{selectedCustomer.name}</h3>
                                    <div className="flex items-center gap-2 mt-1">
                                        <span className="px-2 py-0.5 bg-slate-100 text-slate-600 text-[10px] font-bold rounded">
                                            {selectedCustomer.segment}
                                        </span>
                                        <span className="text-xs text-slate-400">CLV: ₩{Math.round(selectedCustomer.clv || 0).toLocaleString()}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Persona Scripting Engine */}
                            <div className="mb-6">
                                <div className="flex justify-between items-center mb-3">
                                    <h4 className="text-sm font-bold text-indigo-900 flex items-center gap-2">
                                        <MessageSquare size={16} />
                                        AI Persona Script
                                    </h4>
                                    <span className="text-[10px] font-mono bg-indigo-50 text-indigo-600 px-2 py-1 rounded border border-indigo-100">
                                        Tone: {selectedCustomer.persona}
                                    </span>
                                </div>
                                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-sm leading-relaxed text-slate-700 relative group">
                                    {generateScript(selectedCustomer)}
                                    <button
                                        onClick={() => {
                                            navigator.clipboard.writeText(generateScript(selectedCustomer));
                                            // Toast logic would go here
                                        }}
                                        className="absolute top-2 right-2 p-2 bg-white rounded-lg shadow-sm border border-slate-200 text-slate-400 hover:text-indigo-600 transition-colors opacity-0 group-hover:opacity-100"
                                    >
                                        <Copy size={14} />
                                    </button>
                                </div>
                            </div>

                            {/* Next Best Action */}
                            <div>
                                <h4 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
                                    <Target size={16} className="text-emerald-500" />
                                    Next Best Action
                                </h4>
                                <div className="space-y-2">
                                    <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-slate-100 shadow-sm">
                                        <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">1</div>
                                        <p className="text-xs font-medium text-slate-600">
                                            {selectedCustomer.nextServiceWindow.start} 경 <span className="font-bold text-slate-900">가죽 상태 점검 메시지</span> 발송
                                        </p>
                                    </div>
                                    {selectedCustomer.churnProbability > 0.5 && (
                                        <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-slate-100 shadow-sm">
                                            <div className="w-6 h-6 rounded-full bg-rose-100 flex items-center justify-center text-rose-600 shrink-0">2</div>
                                            <p className="text-xs font-medium text-slate-600">
                                                이탈 위험 높음. <span className="font-bold text-slate-900">웰컴백 쿠폰</span> 동봉 추천
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>

                        </div>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center text-slate-400 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200 min-h-[400px]">
                            <Target size={40} className="mb-4 opacity-20" />
                            <p className="text-sm font-medium">고객을 선택하여 AI 분석 결과를 확인하세요</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default RetentionCommandCenter;
