import React, { useState, useMemo } from 'react';
import { SaleRecord } from '../types';
import {
    TrendingUp,
    DollarSign,
    Calculator,
    RefreshCcw,
    Zap
} from 'lucide-react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Cell
} from 'recharts';
import CampaignIntelligence, { CampaignIdea } from './CampaignIntelligence';

interface SimulatorProps {
    data: SaleRecord[];
}

const Simulator: React.FC<SimulatorProps> = ({ data }) => {
    // Simulation Parameters (State)
    const [priceIncrease, setPriceIncrease] = useState<number>(0); // %
    const [churnReduction, setChurnReduction] = useState<number>(0); // %
    const [newCustomerGrowth, setNewCustomerGrowth] = useState<number>(0); // %
    const [costReduction, setCostReduction] = useState<number>(0); // %

    const handleApplyCampaign = (campaign: CampaignIdea) => {
        setPriceIncrease(campaign.impact.revenue > 0 && campaign.id === 'c2' ? 5 : 0); // Example logic, refined below
        // Actually, let's map impact directly to sliders where possible
        // Revenue impact is a result, not an input. 
        // Growth -> newCustomerGrowth
        // Cost -> costReduction (or negative cost)

        // Let's use the campaign tags/logic to map to inputs more intelligently
        // impact.growth -> Set newCustomerGrowth
        // impact.cost -> If cost is reduced, set costReduction. If cost INCREASES (marketing spend), we might need to reflect that.
        // For simplicity in this v1:

        if (campaign.id === 'c1') { // Spring Promo
            setNewCustomerGrowth(25);
            setPriceIncrease(0);
            setChurnReduction(5);
        } else if (campaign.id === 'c2') { // Valentine Bundle
            setPriceIncrease(10); // Bundle raises AOV
            setNewCustomerGrowth(10);
            setChurnReduction(0);
        } else if (campaign.id === 'c3') { // Rainy Season
            setChurnReduction(15); // Retention focus
            setNewCustomerGrowth(5);
            setPriceIncrease(0);
        }
    };

    // 1. Calculate Baseline Metrics (Current Reality)
    const baseline = useMemo(() => {
        const totalRevenue = data.reduce((acc, r) => acc + r.sales, 0);
        const totalCost = data.reduce((acc, r) => acc + (r.cost || 0), 0);
        const netProfit = data.reduce((acc, r) => acc + r.netProfit, 0);
        const customers = new Set(data.map(r => r.phone)).size;
        const avgTicket = totalRevenue / (data.length || 1);

        return { totalRevenue, totalCost, netProfit, customers, avgTicket };
    }, [data]);

    // 2. Calculate Projected Metrics (Simulation)
    const projection = useMemo(() => {
        // A. Price Effect: Revenue increases by X%, but might lose Y% customers (Elasticity assumption: -0.5)
        // For simplicity, we assume strictly linear growth for now unless price > 20%
        const elasticityPenalty = priceIncrease > 15 ? (priceIncrease - 15) * 0.5 : 0;
        const adjustedGrowth = newCustomerGrowth - elasticityPenalty;

        // B. Revenue Calculation
        // New Revenue = (Baseline Rev * (1 + Price%)) * (1 + Growth% + ChurnWait%) 
        // *Churn Reduction effectively acts as retention growth

        const revenueMultiplier = (1 + priceIncrease / 100);
        const volumeMultiplier = (1 + (adjustedGrowth + churnReduction) / 100);

        const projectedRevenue = baseline.totalRevenue * revenueMultiplier * volumeMultiplier;

        // C. Cost Calculation
        // Costs increase with volume, but decrease with CostReduction%
        // Unit Cost stays same unless CostReduction
        const projectedCost = (baseline.totalCost * volumeMultiplier) * (1 - costReduction / 100);

        const projectedNetProfit = projectedRevenue - projectedCost;

        return {
            revenue: projectedRevenue,
            cost: projectedCost,
            netProfit: projectedNetProfit,
            revenueDiff: projectedRevenue - baseline.totalRevenue,
            profitDiff: projectedNetProfit - baseline.netProfit
        };
    }, [baseline, priceIncrease, churnReduction, newCustomerGrowth, costReduction]);

    // Chart Data
    const profitChartData = [
        { name: '현재 순이익', value: baseline.netProfit, type: 'current' },
        { name: '예상 순이익', value: projection.netProfit, type: 'projected' },
    ];

    const formatMoney = (n: number) => `₩ ${Math.round(n / 10000).toLocaleString()}만`;

    // Scenario Saving Logic
    type SavedScenario = {
        id: string;
        name: string;
        date: string;
        params: {
            priceIncrease: number;
            churnReduction: number;
            newCustomerGrowth: number;
            costReduction: number;
        };
        result: {
            revenueDiff: number;
            profitDiff: number;
        };
    };

    const [savedScenarios, setSavedScenarios] = useState<SavedScenario[]>([]);
    const [scenarioName, setScenarioName] = useState('');

    // Load from LocalStorage on Mount
    React.useEffect(() => {
        const saved = localStorage.getItem('artimilano_scenarios');
        if (saved) {
            setSavedScenarios(JSON.parse(saved));
        }
    }, []);

    const saveScenario = () => {
        if (!scenarioName.trim()) {
            alert('시나리오 이름을 입력해주세요.');
            return;
        }
        const newScenario: SavedScenario = {
            id: Date.now().toString(),
            name: scenarioName,
            date: new Date().toLocaleDateString(),
            params: { priceIncrease, churnReduction, newCustomerGrowth, costReduction },
            result: {
                revenueDiff: projection.revenueDiff,
                profitDiff: projection.profitDiff
            }
        };
        const updated = [newScenario, ...savedScenarios];
        setSavedScenarios(updated);
        localStorage.setItem('artimilano_scenarios', JSON.stringify(updated));
        setScenarioName('');
        alert('시나리오가 저장되었습니다.');
    };

    const loadScenario = (s: SavedScenario) => {
        setPriceIncrease(s.params.priceIncrease);
        setChurnReduction(s.params.churnReduction);
        setNewCustomerGrowth(s.params.newCustomerGrowth);
        setCostReduction(s.params.costReduction);
    };

    const deleteScenario = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        const updated = savedScenarios.filter(s => s.id !== id);
        setSavedScenarios(updated);
        localStorage.setItem('artimilano_scenarios', JSON.stringify(updated));
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-20">
            {/* Header */}
            <div className="bg-slate-900 text-white p-8 rounded-3xl shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-10">
                    <Calculator size={120} />
                </div>
                <div className="relative z-10">
                    <h2 className="text-2xl font-bold flex items-center gap-3">
                        <Zap className="text-amber-400" fill="currentColor" />
                        Business Simulator
                    </h2>
                    <p className="text-slate-300 mt-2 max-w-xl leading-relaxed">
                        "What-If" 시나리오 분석기입니다.<br />
                        가격 인상, 이탈 방지, 비용 절감이 <strong>실제 순이익</strong>에 미치는 영향을 미리 확인해보세요.
                        원본 데이터(스프레드시트)는 변경되지 않습니다.
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Left Column: Controls & Intelligence */}
                <div className="lg:col-span-4 space-y-6">
                    {/* 1. Variable Controls */}
                    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                        <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                            🎛️ 변수 설정 (Variables)
                        </h3>

                        <div className="space-y-8">
                            {/* Price Increase */}
                            <div>
                                <div className="flex justify-between mb-2">
                                    <label className="text-sm font-bold text-slate-700">단가 인상률 (Price)</label>
                                    <span className="text-sm font-mono font-bold text-blue-600">+{priceIncrease}%</span>
                                </div>
                                <input
                                    type="range" min="0" max="30" step="1"
                                    value={priceIncrease}
                                    onChange={(e) => setPriceIncrease(Number(e.target.value))}
                                    className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-blue-600"
                                />
                                <p className="text-xs text-slate-400 mt-1">평균 객단가 상승 효과</p>
                            </div>

                            {/* Churn Reduction */}
                            <div>
                                <div className="flex justify-between mb-2">
                                    <label className="text-sm font-bold text-slate-700">단골 유지율 개선 (Retention)</label>
                                    <span className="text-sm font-mono font-bold text-emerald-600">+{churnReduction}%</span>
                                </div>
                                <input
                                    type="range" min="0" max="20" step="1"
                                    value={churnReduction}
                                    onChange={(e) => setChurnReduction(Number(e.target.value))}
                                    className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                                />
                                <p className="text-xs text-slate-400 mt-1">이탈 고객 재방문 유도</p>
                            </div>

                            {/* New Customer Growth */}
                            <div>
                                <div className="flex justify-between mb-2">
                                    <label className="text-sm font-bold text-slate-700">신규 유입 증가 (Growth)</label>
                                    <span className="text-sm font-mono font-bold text-indigo-600">+{newCustomerGrowth}%</span>
                                </div>
                                <input
                                    type="range" min="0" max="50" step="5"
                                    value={newCustomerGrowth}
                                    onChange={(e) => setNewCustomerGrowth(Number(e.target.value))}
                                    className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                                />
                                <p className="text-xs text-slate-400 mt-1">마케팅을 통한 신규 고객</p>
                            </div>

                            {/* Cost Reduction */}
                            <div>
                                <div className="flex justify-between mb-2">
                                    <label className="text-sm font-bold text-slate-700">비용 절감 (Efficiency)</label>
                                    <span className="text-sm font-mono font-bold text-rose-600">-{costReduction}%</span>
                                </div>
                                <input
                                    type="range" min="0" max="30" step="1"
                                    value={costReduction}
                                    onChange={(e) => setCostReduction(Number(e.target.value))}
                                    className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-rose-600"
                                />
                                <p className="text-xs text-slate-400 mt-1">자재비 및 운영비 절감</p>
                            </div>
                        </div>

                        <div className="flex gap-2 mt-8">
                            <button
                                onClick={() => {
                                    setPriceIncrease(0);
                                    setChurnReduction(0);
                                    setNewCustomerGrowth(0);
                                    setCostReduction(0);
                                }}
                                className="flex-1 py-3 bg-slate-100 text-slate-600 font-bold rounded-xl hover:bg-slate-200 transition-colors flex items-center justify-center gap-2 text-sm"
                            >
                                <RefreshCcw size={16} />초기화
                            </button>
                        </div>
                    </div>

                    {/* Scenario Library */}
                    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                        <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                            💾 시나리오 보관함
                        </h3>

                        <div className="flex gap-2 mb-4">
                            <input
                                type="text"
                                placeholder="예: 2024 봄 시즌 전략"
                                className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-bold focus:outline-none focus:ring-2 focus:ring-slate-200"
                                value={scenarioName}
                                onChange={(e) => setScenarioName(e.target.value)}
                            />
                            <button
                                onClick={saveScenario}
                                className="px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-bold hover:bg-slate-800 transition-colors"
                            >
                                저장
                            </button>
                        </div>

                        <div className="space-y-2 max-h-[300px] overflow-y-auto custom-scrollbar">
                            {savedScenarios.length > 0 ? (
                                savedScenarios.map(s => (
                                    <div
                                        key={s.id}
                                        onClick={() => loadScenario(s)}
                                        className="group p-3 rounded-xl border border-slate-100 bg-slate-50 hover:bg-white hover:border-slate-300 hover:shadow-md transition-all cursor-pointer relative"
                                    >
                                        <div className="flex justify-between items-start mb-1">
                                            <span className="text-sm font-bold text-slate-800 group-hover:text-blue-600">{s.name}</span>
                                            <span className="text-[10px] text-slate-400">{s.date}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-xs">
                                            <span className="text-slate-500">순익 Effect:</span>
                                            <span className={`font-bold ${s.result.profitDiff >= 0 ? 'text-emerald-600' : 'text-rose-500'}`}>
                                                {s.result.profitDiff > 0 ? '+' : ''}{formatMoney(s.result.profitDiff)}
                                            </span>
                                        </div>
                                        <button
                                            onClick={(e) => deleteScenario(s.id, e)}
                                            className="absolute top-2 right-2 p-1 text-slate-300 hover:text-rose-500 rounded-full hover:bg-rose-50 transition-colors opacity-0 group-hover:opacity-100"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" /><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" /></svg>
                                        </button>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-8 text-slate-400 text-xs">
                                    저장된 시나리오가 없습니다.
                                </div>
                            )}
                        </div>
                    </div>

                    {/* 2. Marketing Intelligence (Existing) */}
                    <CampaignIntelligence onApplyCampaign={handleApplyCampaign} baseline={baseline} />
                </div>

                {/* Results Panel */}
                <div className="lg:col-span-8 flex flex-col gap-6">
                    {/* Impact Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div className={`p-6 rounded-2xl border shadow-sm transition-all duration-500 ${projection.revenueDiff > 0 ? 'bg-blue-50/50 border-blue-100' : 'bg-white border-slate-100'}`}>
                            <div className="flex items-center gap-3 mb-2">
                                <div className="p-2 bg-white rounded-lg shadow-sm text-blue-600"><DollarSign size={20} /></div>
                                <span className="text-sm font-bold text-slate-600">예상 추가 매출</span>
                            </div>
                            <p className={`text-3xl font-[900] tracking-tight ${projection.revenueDiff >= 0 ? 'text-blue-600' : 'text-slate-400'}`}>
                                {projection.revenueDiff > 0 ? '+' : ''} {formatMoney(projection.revenueDiff)}
                            </p>
                            <p className="text-sm text-slate-500 mt-1">
                                기존 {formatMoney(baseline.totalRevenue)} 대비
                            </p>
                        </div>

                        <div className={`p-6 rounded-2xl border shadow-sm transition-all duration-500 ${projection.profitDiff > 0 ? 'bg-emerald-50/50 border-emerald-100' : 'bg-white border-slate-100'}`}>
                            <div className="flex items-center gap-3 mb-2">
                                <div className="p-2 bg-white rounded-lg shadow-sm text-emerald-600"><TrendingUp size={20} /></div>
                                <span className="text-sm font-bold text-slate-600">예상 추가 순이익</span>
                            </div>
                            <p className={`text-3xl font-[900] tracking-tight ${projection.profitDiff >= 0 ? 'text-emerald-600' : 'text-slate-400'}`}>
                                {projection.profitDiff > 0 ? '+' : ''} {formatMoney(projection.profitDiff)}
                            </p>
                            <p className="text-sm text-slate-500 mt-1">
                                기존 {formatMoney(baseline.netProfit)} 대비
                            </p>
                        </div>
                    </div>

                    {/* Visual Charts */}
                    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex-1">
                        <h3 className="text-lg font-bold text-slate-800 mb-6">시뮬레이션 결과 비교</h3>
                        <div className="h-[300px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={profitChartData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                                    <XAxis type="number" hide />
                                    <YAxis dataKey="name" type="category" width={100} tick={{ fontSize: 12, fontWeight: 700, fill: '#64748b' }} axisLine={false} tickLine={false} />
                                    <Tooltip
                                        cursor={{ fill: '#f8fafc' }}
                                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                        formatter={(val: number) => [formatMoney(val), '금액']}
                                    />
                                    <Bar dataKey="value" barSize={40} radius={[0, 8, 8, 0]}>
                                        {profitChartData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.type === 'current' ? '#cbd5e1' : '#10b981'} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="mt-4 bg-slate-50 p-4 rounded-xl text-center">
                            <p className="text-sm font-medium text-slate-600">
                                이 시나리오대로라면, 연간 순이익이 <span className="text-emerald-600 font-bold">{Math.round(((projection.profitDiff || 0) / (baseline.netProfit || 1)) * 100)}%</span> 증가합니다.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Simulator;
