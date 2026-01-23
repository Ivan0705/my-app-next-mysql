export interface DialectInfo {
  name: string;
  display_name: string;
  icon: string;
  description?: string;
}

export interface TranspileResult {
  success: boolean;
  transpiled: string[];
  from_dialect: string;
  to_dialect: string;
  warnings: string[];
  note?: string;
  error?: string;
}

export interface AnalyzeResult {
  success: boolean;
  statements: number;
  lines: number;
  has_complex_constructs: boolean;
  note: string;
  error?: string;
}

export interface DialectsResult {
  success: boolean;
  dialects: DialectInfo[];
}

export type SqlAction = 'transpile' | 'analyze' | 'supported_dialects';
