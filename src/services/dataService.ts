import { SaleRecord } from '../types';

//  고객님이 제공하신 구글 시트 URL (환경변수 무시하고 강제 적용)
const SHEET_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSJIxq1RhvmU98aYusFWpwKcxuPu5c9wyJD2gVEQkx97CO0mThZTWgVi3dcOAiGSr2bupsuA_SqJFzI/pub?output=csv';

// 브랜드명 통일 (한글/영어 섞여 있어도 OK)
const normalizeBrand = (text: string = ''): string => {
  const t = text.toLowerCase();
  if (t.includes('chanel') || t.includes('샤넬')) return 'Chanel';
  if (t.includes('hermes') || t.includes('에르메스')) return 'Hermes';
  if (t.includes('louis') || t.includes('루이비통') || t.includes('lv')) return 'Louis Vuitton';
  if (t.includes('gucci') || t.includes('구찌')) return 'Gucci';
  if (t.includes('dior') || t.includes('디올')) return 'Dior';
  if (t.includes('prada') || t.includes('프라다')) return 'Prada';
  if (t.includes('goyard') || t.includes('고야드')) return 'Goyard';
  if (t.includes('bottega') || t.includes('보테가')) return 'Bottega Veneta';
  if (t.includes('balenciaga') || t.includes('발렌시아가')) return 'Balenciaga';
  return 'Others';
};

// 금액 변환 (문자열 "2,500,000" -> 숫자 2500000)
const parseCurrency = (val: any): number => {
  if (typeof val === 'number') return val;
  if (!val) return 0;
  // 쉼표, 원화표시, 공백 모두 제거 후 숫자 변환
  const cleanStr = String(val).replace(/[^\d.-]/g, '');
  return parseInt(cleanStr, 10) || 0;
};

// CSV 파싱 로직 (라이브러리 없이 자체 구현 - 속도 빠름)
export const processCSVData = (csvText: string): SaleRecord[] => {
  const lines = csvText.trim().split(/\r?\n/); // 윈도우, 맥 줄바꿈 모두 대응
  if (lines.length < 2) return [];

  // 헤더 처리 (따옴표 제거)
  const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, '').toLowerCase());
  console.log(" 감지된 헤더:", headers);

  const records: SaleRecord[] = [];

  for (let i = 1; i < lines.length; i++) {
    const currentLine = lines[i].trim();
    if (!currentLine) continue;

    // CSV 정규식: 쉼표로 나누되, 따옴표("") 안의 쉼표는 무시함
    const matches = currentLine.match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g);
    // 빈 값이 있어도 매칭되도록 처리
    const values = currentLine.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/).map(v => v.trim().replace(/^"|"$/g, ''));
    
    if (!values) continue;

    const row: any = {};

    // 헤더 매핑 (스마트 매칭)
    headers.forEach((h, index) => {
      let value = values[index] || '';

      // 날짜
      if (h.includes('날짜') || h.includes('date') || h.includes('접수일')) {
        row.date = value;
      }
      // 카테고리
      else if (h.includes('카테고리') || h.includes('category') || h.includes('분류')) {
        row.category = value;
      }
      // 브랜드
      else if (h.includes('브랜드') || h.includes('brand')) {
        row.brand = normalizeBrand(value);
      }
      // 내용/품명
      else if (h.includes('내용') || h.includes('description') || h.includes('품명')) {
        row.description = value;
      }
      // 세부 분류 (채널/구분)
      else if (h.includes('sub_category') || h.includes('채널') || h.includes('channel') || h.includes('구분')) {
        row.sub_category = value;
      }
      // 고객명
      else if (h.includes('고객') || h.includes('customer') || h.includes('성함')) {
        row.customer_name = value;
      }
      // 연락처
      else if (h.includes('전화') || h.includes('phone') || h.includes('연락처')) {
        row.phone = value;
      }
      // 매출 (Revenue)
      else if (h.includes('매출') || h.includes('sales') || h.includes('금액')) {
        row.sales = parseCurrency(value);
      }
      // 비용 (Cost)
      else if (h.includes('비용') || h.includes('cost') || h.includes('지출')) {
        row.cost = Math.abs(parseCurrency(value));
      }
    });

    // 순수익 계산
    row.netProfit = (row.sales || 0) - (row.cost || 0);

    // 날짜 파싱 (년/월/일 추출)
    if (row.date) {
      const dateObj = new Date(row.date);
      if (!isNaN(dateObj.getTime())) {
        row.year = dateObj.getFullYear();
        row.month = dateObj.getMonth() + 1;
        row.day = dateObj.getDate();
      }
    }

    // ID 생성
    row.id = `row-${i}-${Math.random().toString(36).substr(2, 5)}`;

    // 필수 데이터(날짜 등)가 있는 경우만 추가
    if (row.date) {
      records.push(row as SaleRecord);
    }
  }

  console.log(` 데이터 파싱 완료: ${records.length}건`);
  return records;
};

// 데이터 가져오기 (캐시 방지 적용)
export const fetchSheetData = async (): Promise<SaleRecord[]> => {
  try {
    const urlWithTimestamp = `${SHEET_URL}&t=${Date.now()}`;
    console.log(" 데이터 요청 중:", urlWithTimestamp);
    
    const response = await fetch(urlWithTimestamp);
    if (!response.ok) throw new Error('Google Sheets 응답 실패');
    
    const text = await response.text();
    return processCSVData(text);
  } catch (error) {
    console.error(" 데이터 가져오기 실패:", error);
    return [];
  }
};
