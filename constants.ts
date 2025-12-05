import { SaleRecord } from './types';

// Constants for the application

// Fallback Mock URL if env variable is missing 
// (Uses a demo sheet for structure validation if VITE_GOOGLE_SHEET_URL is not set)
export const GOOGLE_SHEET_FALLBACK_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vR6yBw9s-Ff6-7b5k6e8y9-f0h1i2j3k4l5m6n7o8p9q0r1s2t3u4v5w6x7y8z9/pub?output=csv"; 

// Helper to extract brand (Legacy helper)
export const detectBrand = (item: string = ''): string => {
  const normalized = item.toLowerCase();
  if (normalized.includes('샤넬') || normalized.includes('chanel')) return 'Chanel';
  if (normalized.includes('구찌') || normalized.includes('gucci')) return 'Gucci';
  if (normalized.includes('루이비통') || normalized.includes('louis') || normalized.includes('lv')) return 'Louis Vuitton';
  if (normalized.includes('디올') || normalized.includes('dior')) return 'Dior';
  if (normalized.includes('프라다') || normalized.includes('prada')) return 'Prada';
  if (normalized.includes('에르메스') || normalized.includes('hermes')) return 'Hermes';
  return 'Others';
};

// Helper to parse CSV manually (Fallback / Legacy)
export const parseCustomCSV = (text: string): SaleRecord[] => {
  const lines = text.split('\n').filter(line => line.trim() !== '');
  if (lines.length < 2) return [];

  const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, '').toLowerCase());
  const records: SaleRecord[] = [];

  for (let i = 1; i < lines.length; i++) {
    // Simple parser handling quoted fields
    const row: string[] = [];
    let current = '';
    let inQuote = false;
    for (let j = 0; j < lines[i].length; j++) {
      const char = lines[i][j];
      if (char === '"') {
        inQuote = !inQuote;
      } else if (char === ',' && !inQuote) {
        row.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    row.push(current.trim());

    if (row.length < headers.length) continue; 

    const getVal = (keys: string[]) => {
      for (const key of keys) {
        const idx = headers.findIndex(h => h.includes(key));
        if (idx !== -1 && row[idx]) return row[idx].replace(/^"|"$/g, '');
      }
      return '';
    };

    const dateStr = getVal(['date', '날짜']) || row[0]?.replace(/^"|"$/g, '');
    if (!dateStr || dateStr.length < 5) continue;

    const salesStr = getVal(['sales', '매출']).replace(/[^0-9.-]+/g, "");
    const costStr = getVal(['cost', '지출', '비용']).replace(/[^0-9.-]+/g, "");
    const sales = parseInt(salesStr) || 0;
    const cost = parseInt(costStr) || 0;
    const dateObj = new Date(dateStr);
    
    if (isNaN(dateObj.getTime())) continue;

    const description = getVal(['description', '내용', '비고']);
    
    records.push({
      id: `local-${i}`,
      date: dateStr,
      year: dateObj.getFullYear(),
      month: dateObj.getMonth() + 1,
      day: dateObj.getDate(),
      category: getVal(['category', '카테고리']) || '기타',
      sub_category: getVal(['sub_category', '채널', '구분']) || '기타',
      brand: getVal(['brand', '브랜드']) || detectBrand(description),
      description: description,
      sales: sales,
      cost: cost,
      netProfit: sales - cost,
      customer_name: getVal(['customer', 'name', '고객', '이름']),
      phone: getVal(['phone', 'mobile', '전화', '연락처'])
    });
  }

  return records;
};