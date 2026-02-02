import React, { useMemo } from 'react';
import { SaleRecord } from '../types';
import { AlertTriangle, MessageCircle, ArrowRight } from 'lucide-react';

interface ChurnAlertProps {
    data: SaleRecord[];
}

const ChurnAlert: React.FC<ChurnAlertProps> = ({ data }) => {
    const atRiskVIPs = useMemo(() => {
        if (!data.length) return [];

        // Group by Customer
        const customerMap: Record<string, {
            name: string;
            phone: string;
            totalSales: number;
            lastVisit: Date;
            visitCount: number;
        }> = {};

        data.forEach(record => {
            if (!record.customer_name || record.customer_name === '미입력') return;

            const key = `${record.customer_name}-${record.phone || ''}`;
            if (!customerMap[key]) {
                customerMap[key] = {
                    name: record.customer_name,
                    phone: record.phone || '-',
                    totalSales: 0,
                    lastVisit: new Date(0), // Epoch
                    visitCount: 0
                };
            }

            const entry = customerMap[key];
            entry.totalSales += record.sales;
            entry.visitCount += 1;

            const recordDate = new Date(record.date);
            if (recordDate > entry.lastVisit) {
                entry.lastVisit = recordDate;
            }
        });

        const now = new Date();
        const VIP_THRESHOLD = 500000; // 50만원 이상 (VIP 기준)
        const CHURN_DAYS = 90; // 3개월 미방문 (이탈 기준)

        return Object.values(customerMap)
            .filter(c => {
                const daysSinceLast = (now.getTime() - c.lastVisit.getTime()) / (1000 * 60 * 60 * 24);
                return c.totalSales >= VIP_THRESHOLD && daysSinceLast >= CHURN_DAYS;
            })
            .sort((a, b) => b.totalSales - a.totalSales) // 매출 높은 순
            .slice(0, 5); // Top 5
    }, [data]);

    if (atRiskVIPs.length === 0) return null;

    return (
        <div className="bg-white p-5 rounded-xl border border-rose-100 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 p-3 opacity-5">
                <AlertTriangle size={80} className="text-rose-500" />
            </div>

            <div className="flex items-center gap-2 mb-4 relative z-10">
                <div className="p-2 bg-rose-50 rounded-lg text-rose-500">
                    <AlertTriangle size={18} />
                </div>
                <div>
                    <h3 className="text-base font-bold text-slate-800">이탈 위험 VIP 감지</h3>
                    <p className="text-xs text-slate-500">최근 3개월간 방문이 없는 고액 결제 고객입니다.</p>
                </div>
            </div>

            <div className="space-y-3 relative z-10">
                {atRiskVIPs.map((vip, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-100 group hover:border-rose-200 transition-colors">
                        <div className="flex flex-col">
                            <div className="flex items-center gap-2">
                                <span className="text-sm font-bold text-slate-800">{vip.name}</span>
                                <span className="text-[10px] px-1.5 py-0.5 bg-rose-100 text-rose-600 rounded font-bold">VIP</span>
                            </div>
                            <span className="text-[11px] text-slate-400">
                                총 구매액: ₩ {(vip.totalSales / 10000).toLocaleString()}만
                            </span>
                        </div>

                        <button className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 text-slate-600 rounded-lg hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 transition-all shadow-sm active:scale-95">
                            <MessageCircle size={14} />
                            <span className="text-xs font-bold">연락하기</span>
                        </button>
                    </div>
                ))}
            </div>

            <button className="w-full mt-4 py-2 flex items-center justify-center gap-1 text-xs font-bold text-slate-400 hover:text-rose-600 transition-colors">
                전체 리스트 보기 <ArrowRight size={12} />
            </button>
        </div>
    );
};

export default ChurnAlert;
