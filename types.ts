export interface User {
  id: string;
  name: string;
  email: string;
  plan: 'free' | 'pro' | 'pro_plus';
}

export interface DataRow {
  [key: string]: any;
}

export type ColumnType = 'numeric' | 'categorical' | 'date' | 'unknown';

export interface ColumnStats {
  name: string;
  type: ColumnType;
  unique: number;
  missing: number;
  min?: number;
  max?: number;
  mean?: number;
  median?: number;
  mostFreq?: string;
}

export interface Dataset {
  name: string;
  rows: DataRow[];
  columns: string[];
  stats: ColumnStats[];
  uploadDate: string;
}

export interface AnalysisResult {
  executiveSummary: string;
  keyFindings: string[];
  suggestedActions: string[];
  generatedAt: string;
}

export interface ChartConfig {
  id: string;
  type: ChartType;
  xColumn: string;
  yColumn: string;
  color: string;
  title: string;
}

export interface SavedReport {
  id: string;
  name: string;
  date: string;
  datasetName: string;
  insights: AnalysisResult;
  chartConfigs: ChartConfig[];
}

export interface CorrelationNode {
  x: string;
  y: string;
  value: number;
}

export enum ChartType {
  BAR = 'bar',
  LINE = 'line',
  SCATTER = 'scatter',
  PIE = 'pie',
  AREA = 'area'
}