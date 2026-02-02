import { SaleRecord } from '../types';
import {
  normalizeBrand,
  normalizePhone,
  parseCurrency,
  generateDeterministicId
} from '../utils/dataIntegrity';

// Google Sheet CSV URL
const SHEET_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSJIxq1RhvmU98aYusFWpwKcxuPu5c9wyJD2gVEQkx97CO0mThZTWgVi3dcOAiGSr2bupsuA_SqJFzI/pub?output=csv';

// CSV Parsing Logic (Enterprise Grade with Integrity Checks)
export const processCSVData = (csvText: string): SaleRecord[] => {
  const lines = csvText.trim().split(/\r?\n/);
  if (lines.length < 2) return [];

  const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, '').toLowerCase());
  const records: SaleRecord[] = [];

  for (let i = 1; i < lines.length; i++) {
    const currentLine = lines[i].trim();
    if (!currentLine) continue;


    const values = currentLine.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/).map(v => v.trim().replace(/^"|"$/g, ''));

    if (!values) continue;

    const row: any = {};

    headers.forEach((h, index) => {
      let value = values[index] || '';

      if (h.includes('날짜') || h.includes('date') || h.includes('접수일')) {
        row.date = value;
      }
      else if (h.includes('카테고리') || h.includes('category') || h.includes('분류')) {
        row.category = value;
      }
      else if (h.includes('브랜드') || h.includes('brand')) {
        // Enforce Master Data Management
        row.brand = normalizeBrand(value);
      }
      else if (h.includes('내용') || h.includes('description')) {
        row.description = value;
      }
      else if (h.includes('sub_category') || h.includes('채널') || h.includes('구분')) {
        row.sub_category = value;
      }
      else if (h.includes('고객') || h.includes('customer') || h.includes('성함')) {
        row.customer_name = value;
      }
      else if (h.includes('전화') || h.includes('phone') || h.includes('연락처')) {
        // Enforce Phone Format
        row.phone = normalizePhone(value);
      }
      else if (h.includes('매출') || h.includes('sales') || h.includes('금액')) {
        row.sales = parseCurrency(value);
      }
      else if (h.includes('비용') || h.includes('cost') || h.includes('지출')) {
        row.cost = Math.abs(parseCurrency(value));
      }
    });

    // Integrity: Calculate Net Profit safely
    row.netProfit = (row.sales || 0) - (row.cost || 0);

    // Date Parsing
    if (row.date) {
      const dateObj = new Date(row.date);
      if (!isNaN(dateObj.getTime())) {
        row.year = dateObj.getFullYear();
        row.month = dateObj.getMonth() + 1;
        row.day = dateObj.getDate();
      }
    }

    // Integrity: Deterministic ID Generation
    // This ensures that even if the sheet order changes, the ID for "Phone X on Date Y with Price Z" stays the same.
    if (row.date && row.phone) {
      row.id = generateDeterministicId(row.date, row.phone, row.sales);
      records.push(row as SaleRecord);
    }
  }

  return records;
};

export const fetchSheetData = async (): Promise<SaleRecord[]> => {
  try {
    // Note: In production, consider removing timestamp to leverage CDN caching,
    // or use a dedicated API with Stale-While-Revalidate.
    const urlWithTimestamp = `${SHEET_URL}&t=${Date.now()}`;
    const response = await fetch(urlWithTimestamp);
    if (!response.ok) throw new Error('Google Sheets Response Error');

    const text = await response.text();
    return processCSVData(text);
  } catch (error) {
    console.error("Data Fetch Failed:", error);
    return [];
  }
};
