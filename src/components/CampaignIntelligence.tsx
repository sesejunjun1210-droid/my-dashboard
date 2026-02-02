import React from 'react';
import { Sparkles, Calendar, ArrowRight, TrendingUp, Search } from 'lucide-react';

export interface CampaignIdea {
    id: string;
    title: string;
    description: string;
    season: string;
    impact: {
        revenue: number; // Projected revenue boost %
        growth: number; // New customer growth %
        cost: number; // Marketing cost or margin reduction %
    };
    tags: string[];
}

const SAMPLE_CAMPAIGNS: CampaignIdea[] = [
    {
        id: 'c1',
        title: '🌸 봄맞이 리프레시 프로모션',
        description: '겨울철 묵은 수요를 깨우는 얼리버드 할인. 신규 고객 유입에 효과적입니다.',
        season: 'Spring',
        impact: { revenue: 15, growth: 25, cost: 5 },
        tags: ['신규유입', '계절특수']
    },
    {
        id: 'c2',
        title: '💝 발렌타인 커플 세트',
        description: '객단가를 높이는 번들 상품 구성. 기존 고객의 선물 수요를 공략하세요.',
        season: 'Feb',
        impact: { revenue: 20, growth: 10, cost: 2 },
        tags: ['객단가상승', '이벤트']
    },
    {
        id: 'c3',
        title: '☔ 장마철 홈케어 패키지',
        description: '비수기를 극복하는 방문 서비스. 이탈 방지 및 가동률 확보에 집중.',
        season: 'Summer',
        impact: { revenue: 8, growth: 5, cost: 10 },
        tags: ['비수기방어', '가동률']
    }
];

interface CampaignIntelligenceProps {
    onApplyCampaign: (campaign: CampaignIdea) => void;
    baseline: {
        avgTicket: number;
        customers: number;
        netProfit: number;
    };
}

const CampaignIntelligence: React.FC<CampaignIntelligenceProps> = ({ onApplyCampaign, baseline }) => {
    // 1. Sophisticated Logic to find "Best Fit" & Generate Reasoning
    const recommendation = React.useMemo(() => {
        // Condition A: Low Customer Base -> Need Growth (Spring Promo)
        if (baseline.customers < 100) {
            return {
                id: 'c1',
                reason: '신규 고객 확보 시급',
                evidence: `현재 단골 고객이 ${baseline.customers}명으로, 안정적인 매출 기반을 위해 신규 유입이 가장 필요한 시점입니다. 겨울철 잠재 수요를 깨우는 '봄맞이 프로모션'이 가장 효과적입니다.`
            };
        }
        // Condition B: Low Avg Ticket -> Need Bundling (Valentine)
        if (baseline.avgTicket < 50000) {
            return {
                id: 'c2',
                reason: '객단가(AOV) 상승 기회',
                evidence: `평균 객단가가 ${Math.round(baseline.avgTicket / 1000).toLocaleString()}천원으로, 업계 평균 대비 낮습니다. '커플 세트'와 같은 번들 구성을 통해 1인당 결제 금액을 높이는 전략이 즉각적인 이익 개선에 도움이 됩니다.`
            };
        }
        // Condition C: Default -> Retention (Summer)
        return {
            id: 'c3',
            reason: '비수기 방어 및 재구매 유도',
            evidence: `안정적인 매출 유지를 위해 기존 고객의 이탈을 막아야 할 때입니다. 방문형 홈케어 서비스나 멤버십 혜택을 강화해 '비수기 매출 공백'을 메우는 것을 추천합니다.`
        };
    }, [baseline]);

    return (
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm h-full flex flex-col">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    <Sparkles className="text-purple-500" size={20} />
                    마케팅 인텔리전스
                </h3>
                <span className="text-xs font-medium px-2 py-1 bg-purple-50 text-purple-600 rounded-full border border-purple-100">
                    AI 분석 완료
                </span>
            </div>

            <div className="flex-1 overflow-y-auto pr-2 space-y-6">
                {/* 1. Top Recommendation Card */}
                <div className="bg-gradient-to-br from-purple-50 to-white p-5 rounded-2xl border border-purple-100 shadow-sm ring-1 ring-purple-100 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-purple-100 rounded-full blur-2xl -mr-10 -mt-10 opacity-50"></div>

                    <div className="relative z-10">
                        <div className="flex items-center gap-2 mb-3">
                            <span className="bg-purple-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                                <Sparkles size={10} fill="currentColor" />
                                최우선 추천 전략
                            </span>
                            <span className="text-xs font-bold text-purple-700">
                                {recommendation.reason}
                            </span>
                        </div>

                        {SAMPLE_CAMPAIGNS.filter(c => c.id === recommendation.id).map(campaign => (
                            <div key={campaign.id}>
                                <h4 className="text-lg font-bold text-slate-800 mb-1">{campaign.title}</h4>
                                <p className="text-xs text-slate-600 mb-4 leading-relaxed font-medium">
                                    {recommendation.evidence}
                                </p>

                                <button
                                    onClick={() => onApplyCampaign(campaign)}
                                    className="w-full py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-sm font-bold shadow-sm shadow-purple-200 transition-all flex items-center justify-center gap-2 mb-4"
                                >
                                    <TrendingUp size={16} />
                                    이 전략 시뮬레이션 적용하기
                                </button>

                                <div className="grid grid-cols-3 gap-2 text-center bg-white/60 p-2 rounded-lg backdrop-blur-sm">
                                    <div>
                                        <div className="text-[10px] text-slate-400">예상매출</div>
                                        <div className="text-xs font-bold text-emerald-600">+{campaign.impact.revenue}%</div>
                                    </div>
                                    <div>
                                        <div className="text-[10px] text-slate-400">신규유입</div>
                                        <div className="text-xs font-bold text-blue-600">+{campaign.impact.growth}%</div>
                                    </div>
                                    <div>
                                        <div className="text-[10px] text-slate-400">비용</div>
                                        <div className="text-xs font-bold text-rose-500">+{campaign.impact.cost}%</div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* 2. Other Candidates List */}
                <div>
                    <h5 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 px-1">
                        다른 추천 캠페인 ({SAMPLE_CAMPAIGNS.length - 1})
                    </h5>
                    <div className="space-y-3">
                        {SAMPLE_CAMPAIGNS.filter(c => c.id !== recommendation.id).map((campaign) => (
                            <div
                                key={campaign.id}
                                className="group p-4 rounded-xl border border-slate-100 bg-white hover:border-purple-200 hover:shadow-md transition-all duration-200 cursor-pointer flex justify-between items-center"
                                onClick={() => onApplyCampaign(campaign)}
                            >
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="text-[10px] font-bold text-slate-400 bg-slate-50 px-1.5 py-0.5 rounded border border-slate-100">
                                            {campaign.season}
                                        </span>
                                        <h4 className="text-sm font-bold text-slate-700 group-hover:text-purple-700 transition-colors">
                                            {campaign.title}
                                        </h4>
                                    </div>
                                    <div className="flex items-center gap-2 text-[10px] font-medium text-slate-400">
                                        <span>매출 +{campaign.impact.revenue}%</span>
                                        <span>•</span>
                                        <span>{campaign.tags[0]}</span>
                                    </div>
                                </div>
                                <ArrowRight className="text-slate-200 group-hover:text-purple-400" size={16} />
                            </div>
                        ))}
                    </div>
                </div>

                <button className="w-full py-3 mt-4 border-2 border-dashed border-slate-200 rounded-xl text-slate-400 text-sm font-bold hover:border-slate-300 hover:text-slate-500 transition-colors flex items-center justify-center gap-2">
                    <Search size={16} />
                    전체 라이브러리 보기
                </button>
            </div>
        </div>
    );
};

export default CampaignIntelligence;
