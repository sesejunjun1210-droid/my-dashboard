/**
 * Data Integrity Layer (Enterprise Level)
 * Handles normalization, validation, and deterministic ID generation.
 * This ensures "Garbage In, Clean Out".
 */

// 1. Phone Normalization (RFC3966 style but for KR)
export const normalizePhone = (phone: string): string => {
  if (!phone) return '';
  // Remove all non-digits
  const digits = phone.replace(/\D/g, '');
  
  // Handle KR Mobile Case (01012345678 -> 010-1234-5678)
  if (digits.startsWith('010') && digits.length === 11) {
    return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`;
  }
  // Standard format fallback
  return phone; 
};

// 2. Brand Normalization (MDM - Master Data Management)
export const normalizeBrand = (text: string = ''): string => {
  const t = text.toLowerCase().trim();
  if (!t) return 'Others';

  // Dictionary Mapping
  const brandMap: Record<string, string> = {
    'chanel': 'Chanel', '샤넬': 'Chanel',
    'hermes': 'Hermes', '에르메스': 'Hermes',
    'louis': 'Louis Vuitton', '루이비통': 'Louis Vuitton', 'lv': 'Louis Vuitton',
    'gucci': 'Gucci', '구찌': 'Gucci',
    'dior': 'Dior', '디올': 'Dior',
    'prada': 'Prada', '프라다': 'Prada',
    'goyard': 'Goyard', '고야드': 'Goyard',
    'bottega': 'Bottega Veneta', '보테가': 'Bottega Veneta',
    'balenciaga': 'Balenciaga', '발렌시아가': 'Balenciaga',
    'miumiu': 'Miu Miu', '미우미우': 'Miu Miu',
    'saint': 'Saint Laurent', '생로랑': 'Saint Laurent', 'ysl': 'Saint Laurent',
    'fendi': 'Fendi', '펜디': 'Fendi',
    'burberry': 'Burberry', '버버리': 'Burberry'
  };

  for (const key in brandMap) {
    if (t.includes(key)) return brandMap[key];
  }
  
  return 'Others'; // Fallback for analyzing "Long Tail" later
};

// 3. Deterministic ID Generation
// Generates a hash-like ID based on content to track the same transaction across reloads.
// Note: In a real DB, use UUID. Here we simulate it.
export const generateDeterministicId = (date: string, phone: string, price: number): string => {
  const seed = `${date}-${phone}-${price}`;
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    const char = seed.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return `tx-${Math.abs(hash).toString(16)}`;
};

// 4. Money Integrity
// Protect against "Floating Point Math" errors.
export const parseCurrency = (val: any): number => {
  if (typeof val === 'number') return val;
  if (!val) return 0;
  const cleanStr = String(val).replace(/[^\d.-]/g, '');
  // Return Integer (Won)
  return parseInt(cleanStr, 10) || 0;
};
