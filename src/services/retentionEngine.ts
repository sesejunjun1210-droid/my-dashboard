import { SaleRecord, CustomerStats } from '../types';

/**
 * 👑 Enterprise Retention Engine (Project L'Artisan_Loop)
 * 
 * Core Logic:
 * 1. Calculate Inter-Purchase Time (IPT) per customer.
 * 2. Predict "Golden Window" for next service based on category durability.
 * 3. Assign Communication Persona (Concierge / Advisor / Incentivizer).
 */

// Durability Map (Months until next service needed)
const CATEGORY_DURABILITY: Record<string, number> = {
    '가방': 18,
    '지갑': 12,
    '신발': 6,
    '벨트': 12,
    '의류': 24,
    '기타': 12
};

const ONE_DAY = 24 * 60 * 60 * 1000;

export const calculateRetentionMetrics = (
    records: SaleRecord[],
    baseStats: CustomerStats
): CustomerStats => {
    // 1. Calculate IPT (Inter-Purchase Time)
    const sorted = records.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    let totalGap = 0;
    let gaps = 0;

    for (let i = 1; i < sorted.length; i++) {
        const prev = new Date(sorted[i - 1].date);
        const curr = new Date(sorted[i].date);
        const diff = (curr.getTime() - prev.getTime()) / ONE_DAY;
        if (diff > 0) {
            totalGap += diff;
            gaps++;
        }
    }

    const avgIPT = gaps > 0 ? totalGap / gaps : 365; // Default to 1 year if single visit

    // 2. Predict Golden Window (Next Service Date)
    const lastVisit = new Date(baseStats.lastVisit);
    const mainCategory = records.sort((a, b) => b.sales - a.sales)[0].category || '기타';
    const durabilityMonths = CATEGORY_DURABILITY[mainCategory] || 12;

    // Golden Window Start: Last Visit + Durability - 1 Month
    // Golden Window End: Last Visit + Durability + 1 Month
    const nextServiceDate = new Date(lastVisit);
    nextServiceDate.setMonth(nextServiceDate.getMonth() + durabilityMonths);

    const windowStart = new Date(nextServiceDate);
    windowStart.setMonth(windowStart.getMonth() - 1);

    const windowEnd = new Date(nextServiceDate);
    windowEnd.setMonth(windowEnd.getMonth() + 1);

    // 3. Assign Persona
    let persona: CustomerStats['persona'] = 'Advisor';
    if (baseStats.segment === 'VIP') persona = 'Concierge';
    if (baseStats.segment === 'Risk' || baseStats.segment === 'Lost') persona = 'Incentivizer';

    return {
        ...baseStats,
        clv: baseStats.totalSpend * 1.2, // Simple projection for now
        avgInterPurchaseTime: Math.round(avgIPT),
        retentionScore: 100 - (baseStats.churnProbability * 100),
        persona,
        nextServiceWindow: {
            start: windowStart.toISOString().split('T')[0],
            end: windowEnd.toISOString().split('T')[0]
        }
    };
};

export const generateScript = (customer: CustomerStats): string => {
    const { name, persona, nextServiceWindow } = customer;

    if (persona === 'Concierge') {
        return `[아르티밀라노] ${name}님, 프라이빗 케어 담당자입니다. 지난번 맡겨주신 제품은 잘 사용하고 계신지요? ${nextServiceWindow.start}경 가죽 상태 점검을 위한 방문 예약을 도와드리고자 합니다. 편하신 시간에 회신 부탁드립니다.`;
    }

    if (persona === 'Incentivizer') {
        return `[아르티밀라노] ${name}님, 오랜만에 인사드립니다. 환절기 가죽 관리가 필요한 시점입니다. 이번 달 방문 시 사용 가능한 [웰컴백 10% 할인] 혜택을 준비했습니다. 소중한 제품, 다시 새것처럼 관리해 보세요.`;
    }

    // Advisor (Default)
    return `[아르티밀라노] 안녕하세요 ${name}님. 가죽 제품은 ${customer.avgInterPurchaseTime}일 주기로 영양 공급이 필요합니다. 다가오는 ${nextServiceWindow.start}부터 점검 권장 기간이오니, 매장 방문 시 무상 상태 진단을 받아보세요.`;
};
