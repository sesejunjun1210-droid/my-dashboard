import { SaleRecord, CustomerStats } from '../types';
import { calculateRetentionMetrics } from '../services/retentionEngine';

/**
 * Enterprise AI Intelligence Layer
 * - RFM Analysis (Recency, Frequency, Monetary)
 * - Churn Prediction (Retention Curve approximation)
 * - Explainability Engine (Natural Language Generation)
 */

const ONE_DAY = 24 * 60 * 60 * 1000;

export const analyzeCustomer = (
    records: SaleRecord[],
    lastGlobalDateStr: string
): CustomerStats | null => {
    if (!records.length) return null;

    // 1. Basic Aggregation
    const sorted = records.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    const lastVisitDate = new Date(sorted[0].date);
    const globalDate = new Date(lastGlobalDateStr);
    const firstVisitDate = new Date(sorted[sorted.length - 1].date);

    const totalSpend = records.reduce((sum, r) => sum + r.sales, 0);
    const visitCount = records.length; // Actually transaction count. Ideally dedupe by day.
    const uniqueDays = new Set(records.map(r => r.date)).size;

    // 2. RFM Calculation
    // Recency: Days since last visit
    const recencyDays = Math.max(0, Math.floor((globalDate.getTime() - lastVisitDate.getTime()) / ONE_DAY));

    // Frequency: Average days between visits
    const accountAgeDays = Math.max(1, Math.floor((globalDate.getTime() - firstVisitDate.getTime()) / ONE_DAY));
    const avgInterVisitTime = visitCount > 1 ? accountAgeDays / (uniqueDays - 1) : accountAgeDays;

    // Monetary: Average Order Value


    // 3. Scoring Logic (Simple Heuristic for now, can be ML later)
    let score = 0;
    const reasons: string[] = [];

    // Recency Score (Higher is bad, so penalty)
    if (recencyDays < 30) { score += 40; reasons.push("최근 방문 고객"); }
    else if (recencyDays < 90) { score += 20; }
    else { score -= 20; reasons.push("장기 미방문"); }

    // Frequency Score
    if (visitCount >= 5) { score += 30; reasons.push("단골 (5회 이상)"); }
    else if (visitCount >= 2) { score += 10; }

    // Monetary Score
    if (totalSpend > 3000000) { score += 30; reasons.push("VIP (300만원↑)"); }
    else if (totalSpend > 1000000) { score += 10; reasons.push("우수 고객 (100만원↑)"); }

    // Data Integrity Bonus
    if (records[0].phone.length >= 10) score += 5; // Valid contact info bonus

    // Cap Score 0-100
    score = Math.min(100, Math.max(0, score));

    // 4. Segmentation
    let segment: CustomerStats['segment'] = 'Regular';
    if (score >= 80) segment = 'VIP';
    else if (score >= 60) segment = 'High Potential';
    else if (recencyDays > 120 && visitCount > 1) segment = 'Risk'; // Was regular but stopped coming
    else if (recencyDays > 365) segment = 'Lost';
    else if (visitCount === 1 && recencyDays < 60) segment = 'New';

    // 5. Churn Probability (Logistic Function approximation based on Recency vs Frequency)
    // If Recency > 3x Average Inter-Visit Time, Churn Risk scales up high.
    const riskFactor = recencyDays / (avgInterVisitTime * 2.5);
    const churnProb = 1 / (1 + Math.exp(-1 * (riskFactor - 2))); // Sigmoid centered at 2x interval
    // Normalize meaningful range:
    // If result is 0.5, it means risk is high. Let's simplify:
    let finalChurn = Math.min(0.99, Math.max(0.01, churnProb));

    if (segment === 'Lost') finalChurn = 0.99;
    if (segment === 'New' && recencyDays < 30) finalChurn = 0.2; // New customers are volatile but not "churned" yet

    // 6. Next Purchase Prediction
    let nextPurchase = "";
    if (segment !== 'Lost' && segment !== 'Risk') {
        const predictedDays = Math.round(avgInterVisitTime);
        const daysUntilNext = predictedDays - recencyDays;
        if (daysUntilNext > 0) {
            nextPurchase = `${daysUntilNext}일 내 예상`;
            reasons.push("주기적 방문 패턴 감지");
        } else {
            nextPurchase = "방문 예정 시기 도래";
            reasons.push("평균 주기 초과 - 연락 권장");
        }
    }

    // 7. Enterprise Retention Engine Integration
    // Temporarily create base object
    const baseStats: CustomerStats = {
        phone: records[0].phone,
        name: records[0].customer_name,
        visitCount,
        totalSpend,
        lastVisit: lastVisitDate.toISOString().split('T')[0],
        vipScore: score,
        segment,
        churnProbability: finalChurn,
        nextPurchasePrediction: nextPurchase,
        reasons: [...new Set(reasons)], // Dedup reasons
        // Placeholders (Will be overwritten by calculateRetentionMetrics)
        clv: 0,
        avgInterPurchaseTime: 0,
        retentionScore: 0,
        persona: 'Advisor',
        nextServiceWindow: { start: '', end: '' }
    };

    return calculateRetentionMetrics(records, baseStats);
};

export const batchProcessCustomers = (allRecords: SaleRecord[]): CustomerStats[] => {
    // Group by Phone (Primary Key for Customer)
    const groups: Record<string, SaleRecord[]> = {};

    // Find global max date (Simulation of "Today")
    let maxDate = '2000-01-01';

    allRecords.forEach(r => {
        if (!r.phone || r.phone.length < 8) return; // Skip anonymous
        if (!groups[r.phone]) groups[r.phone] = [];
        groups[r.phone].push(r);
        if (r.date > maxDate) maxDate = r.date;
    });

    const processed = Object.values(groups)
        .map(records => analyzeCustomer(records, maxDate))
        .filter((c): c is CustomerStats => c !== null);

    // Sort by VIP Score descending
    return processed.sort((a, b) => b.vipScore - a.vipScore);
};
