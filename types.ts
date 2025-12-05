export enum Status {
  RELEASED = '출고',
  IN_PROGRESS = '작업중',
  BEFORE_WORK = '작업전',
  UNKNOWN = '미정'
}

// Google Sheet Columns Structure:
// date | category | sub_category | brand | description | sales | cost | customer_name | phone

export interface SaleRecord {
  id: string;
  date: string; // YYYY-MM-DD
  category: string; // 수선, 염색, 리폼
  sub_category: string; // 워크인, 택배 등 (Channel)
  brand: string;
  description: string; // 비고
  sales: number; // 매출 (Gross)
  cost: number; // 지출/외주비
  netProfit: number; // sales - cost (Calculated)
  customer_name: string;
  phone: string;
  
  // Backward compatibility / UI helpers
  day: number;
  month: number;
  year: number;
}

export interface CustomerStats {
  phone: string;
  name: string;
  visitCount: number;
  totalSpend: number;
  lastVisit: string;
}