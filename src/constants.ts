import { SaleRecord } from './types';

// Constants for the application

// Fallback Mock URL if env variable is missing 
// (Uses a demo sheet for structure validation if VITE_GOOGLE_SHEET_URL is not set)
export const GOOGLE_SHEET_FALLBACK_URL =
  'https://docs.google.com/spreadsheets/d/e/2PACX-1vSJIxq1RhvmU98aYusFWpwKcxuPu5c9wyJD2gVEQkx97CO0mThZTWgVi3dcOAiGSr2bupsuA_SqJFzI/pub?output=csv';

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
  // ⬇️ 이하 기존 코드 그대로 유지
  const lines = text.split('\n').filter(line => line.trim() !== '');
  if (lines.length < 2) return [];


  const records: SaleRecord[] = [];

  for (let i = 1; i < lines.length; i++) {
    // ... 나머지 기존 내용 그대로 ...
  }

  return records;
};
