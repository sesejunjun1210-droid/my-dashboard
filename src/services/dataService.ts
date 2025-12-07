import { SaleRecord } from '../types';

// 1. [기존 기능] 초기 대시보드용 샘플 데이터 가져오기
export const fetchSheetData = async (): Promise<SaleRecord[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([
        {
          id: '1',
          date: '2024-03-01',
          customer: 'Sample Client',
          product: 'Artimilano Sofa',
          amount: 2500000,
          status: 'Completed',
          region: 'Seoul',
          paymentMethod: 'Card',
          manager: 'Kim'
        } as any
      ]);
    }, 500);
  });
};

// 2. [추가된 기능] CSV 파일을 업로드했을 때 JSON으로 변환하는 함수 (이게 없어서 에러 남)
export const processCSVData = (csvText: string): SaleRecord[] => {
  const lines = csvText.trim().split('\n');
  if (lines.length < 2) return [];

  // 헤더 처리 (첫 번째 줄)
  const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
  
  const records: SaleRecord[] = [];

  // 데이터 처리 (두 번째 줄부터)
  for (let i = 1; i < lines.length; i++) {
    const currentLine = lines[i].trim();
    if (!currentLine) continue;

    // CSV의 콤마 분리 (따옴표 내 콤마 무시 로직은 간단하게 처리)
    const values = currentLine.split(',').map(v => v.trim().replace(/"/g, ''));
    
    // 빈 객체 생성
    const record: any = {};
    
    // 헤더와 매핑
    headers.forEach((header, index) => {
      // 한글 헤더를 영문 키로 변환 (필요시 수정 가능)
      let key = header;
      if (header.includes('날짜') || header.includes('Date')) key = 'date';
      else if (header.includes('고객') || header.includes('Customer')) key = 'customer';
      else if (header.includes('제품') || header.includes('Product')) key = 'product';
      else if (header.includes('금액') || header.includes('Amount')) key = 'amount';
      else if (header.includes('상태') || header.includes('Status')) key = 'status';
      else if (header.includes('지역') || header.includes('Region')) key = 'region';
      else if (header.includes('담당') || header.includes('Manager')) key = 'manager';
      
      // 금액은 숫자로 변환
      if (key === 'amount') {
        record[key] = parseFloat(values[index]) || 0;
      } else {
        record[key] = values[index] || '';
      }
    });

    // 필수 ID 생성 (없으면 랜덤)
    if (!record.id) record.id = Math.random().toString(36).substr(2, 9);
    
    records.push(record as SaleRecord);
  }

  return records;
};
