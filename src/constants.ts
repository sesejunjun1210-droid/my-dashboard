import { SaleRecord } from './types';

// Constants for the application

// Fallback Mock URL if env variable is missing 
// (Uses a demo sheet for structure validation if VITE_GOOGLE_SHEET_URL is not set)
export const GOOGLE_SHEET_FALLBACK_URL =
  'https://docs.google.com/spreadsheets/d/e/2PACX-1vSJIxq1RhvmU98aYusFWpwKcxuPu5c9wyJD2gVEQkx97CO0mThZTWgVi3dcOAiGSr2bupsuA_SqJFzI/pub?output=csv';

// Market Intelligence Database
export const MARKET_INSIGHTS: Record<number, { title: string; events: string[]; tips: string }> = {
  1: { title: '새해 맞이 및 겨울 시즌', events: ['설날', '코트 수선'], tips: '겨울 아우터 수선과 신년 맞이 클리닝 프로모션 준비' },
  2: { title: '졸업/입학 시즌', events: ['졸업/입학', '발렌타인'], tips: '오래된 가방 리폼 및 선물 수요 공략' },
  3: { title: 'S/S 시즌 시작', events: ['봄맞이', '화이트데이'], tips: '겨울 묵은 때 제거 프리미엄 클리닝 패키지' },
  4: { title: '나들이 시즌', events: ['웨딩', '야외활동'], tips: '밝은색상 가방 이염 복원 및 코팅 서비스 강조' },
  5: { title: '가정의 달 & 웨딩', events: ['어버이날', '결혼식'], tips: '부모님 명품 복원 "효도 수선" 마케팅' },
  6: { title: '초여름 대비', events: ['샌들 수선', '장마대비'], tips: '장마철 가죽 손상 방지 발수 코팅 제안' },
  7: { title: '장마철 집중', events: ['습기', '곰팡이'], tips: '곰팡이 제거 및 빗물 얼룩 복원 접수 급증' },
  8: { title: '한여름 휴가', events: ['휴가 손상', '오염'], tips: '휴가지 스크래치/오염 제거 "애프터 바캉스 케어"' },
  9: { title: 'F/W 시즌 개막', events: ['추석', '가죽자켓'], tips: '가을/겨울 대비 가죽 자켓 염색 및 부츠 보강' },
  10: { title: '가을 성수기', events: ['단풍놀이', '결혼식'], tips: '연중 객단가 최고 시기, 전체 복원 작업 집중' },
  11: { title: '겨울 준비', events: ['부츠', '블프'], tips: '겨울 부츠 수선 및 연말 모임 대비 급행 서비스' },
  12: { title: '연말 홀리데이', events: ['크리스마스', '선물'], tips: '연말 선물용 리폼 및 새해 맞이 정비 수요' },
  13: { title: '연간 분석', events: [], tips: '전체적인 흐름 파악' }
};

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
