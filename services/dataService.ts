import { DataRow, ColumnStats, ColumnType, CorrelationNode } from '../types';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';

export const parseCSV = (file: File): Promise<DataRow[]> => {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      dynamicTyping: true,
      complete: (results) => {
        resolve(results.data as DataRow[]);
      },
      error: (error) => {
        reject(error);
      }
    });
  });
};

export const parseExcel = (file: File): Promise<DataRow[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const json = XLSX.utils.sheet_to_json(sheet);
        resolve(json as DataRow[]);
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = (err) => reject(err);
    reader.readAsBinaryString(file);
  });
};

const detectType = (values: any[]): ColumnType => {
  const nonNull = values.filter(v => v !== null && v !== undefined && v !== '');
  if (nonNull.length === 0) return 'unknown';

  const isNumeric = nonNull.every(v => !isNaN(Number(v)));
  if (isNumeric) return 'numeric';

  const isDate = nonNull.every(v => !isNaN(Date.parse(v)));
  if (isDate && nonNull.some(v => typeof v === 'string' && (v.includes('-') || v.includes('/')))) return 'date';

  return 'categorical';
};

export const analyzeDataset = (data: DataRow[]): ColumnStats[] => {
  if (data.length === 0) return [];
  const columns = Object.keys(data[0]);
  
  return columns.map(col => {
    const values = data.map(row => row[col]);
    const nonNullValues = values.filter(v => v !== null && v !== undefined && v !== '');
    const type = detectType(values);
    
    let stats: ColumnStats = {
      name: col,
      type,
      unique: new Set(values).size,
      missing: values.length - nonNullValues.length,
    };

    if (type === 'numeric') {
      const nums = nonNullValues.map(v => Number(v)).sort((a, b) => a - b);
      const sum = nums.reduce((a, b) => a + b, 0);
      stats.min = nums[0];
      stats.max = nums[nums.length - 1];
      stats.mean = sum / nums.length;
      stats.median = nums[Math.floor(nums.length / 2)];
    } else {
      const counts: Record<string, number> = {};
      nonNullValues.forEach(v => {
        const k = String(v);
        counts[k] = (counts[k] || 0) + 1;
      });
      const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
      if (sorted.length > 0) stats.mostFreq = sorted[0][0];
    }

    return stats;
  });
};

const calculateCorrelation = (x: number[], y: number[]): number => {
  const n = x.length;
  if (n === 0) return 0;
  const sumX = x.reduce((a, b) => a + b, 0);
  const sumY = y.reduce((a, b) => a + b, 0);
  const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0);
  const sumX2 = x.reduce((sum, xi) => sum + xi * xi, 0);
  const sumY2 = y.reduce((sum, yi) => sum + yi * yi, 0);

  const numerator = n * sumXY - sumX * sumY;
  const denominator = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));

  return denominator === 0 ? 0 : numerator / denominator;
};

export const getCorrelationMatrix = (data: DataRow[], numericColumns: string[]): CorrelationNode[] => {
  const matrix: CorrelationNode[] = [];
  
  // To avoid heavy computation on large datasets, sample if too large
  const sample = data.length > 500 ? data.slice(0, 500) : data;

  for (let i = 0; i < numericColumns.length; i++) {
    for (let j = 0; j < numericColumns.length; j++) {
      const col1 = numericColumns[i];
      const col2 = numericColumns[j];
      
      const x = sample.map(row => Number(row[col1]) || 0);
      const y = sample.map(row => Number(row[col2]) || 0);
      
      const value = calculateCorrelation(x, y);
      matrix.push({ x: col1, y: col2, value });
    }
  }
  return matrix;
};