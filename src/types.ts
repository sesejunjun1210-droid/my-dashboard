export interface SaleRecord {
  id: string;
  date: string; // YYYY-MM-DD
  year: number;
  month: number;
  day: number;
  category: string;
  brand: string;
  description: string;
  sub_category: string; // Channel (Walk-in, Delivery, etc.)
  customer_name: string;
  phone: string;
  sales: number;
  cost: number;
  netProfit: number;
}

export interface CustomerStats {
  phone: string;
  name: string;
  visitCount: number;
  totalSpend: number;
  lastVisit: string;
  // Enterprise AI Fields
  vipScore: number; // 0-100 Confidence Score
  segment: 'VIP' | 'High Potential' | 'Regular' | 'New' | 'Risk' | 'Lost';
  churnProbability: number; // 0.0 - 1.0
  nextPurchasePrediction?: string;
  reasons: string[]; // Explainability ("Why?")
}

export interface AggregatedMetric {
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