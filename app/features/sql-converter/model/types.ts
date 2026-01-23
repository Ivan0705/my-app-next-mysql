export interface DialectKeywordInfo {
  description: string;
  equivalents: {
    [key: string]: string;
  };
}

export interface DialectChange {
  originalWord: string;
  convertedWord: string;
  description: string;
  originalLine: number;
  originalPosition: number;
  convertedLine: number;
  convertedPosition: number;
  equivalent: string;
}

export interface DialectKeywordsMap {
  [key: string]: {
    [keyword: string]: DialectKeywordInfo;
  };
}

export interface FileInfo {
  name: string;
  size: number;
  content: string;
  lastModified: Date;
  dialect?: string;
  originalDialect?: string;
}

export interface TranspilationResult {
  success: boolean;
  transpiled: string[];
  warnings: string[];
  from_dialect: string;
  to_dialect: string;
  feature_compatibility?: any;
}

export interface DialectOption {
  value: string;
  label: string;
  icon: string;
}

export interface DialectConfig {
  originalWord: string;
  convertedWord: string;
  description: string;
  originalLine: number;
  originalPosition: number;
  convertedLine: number;
  convertedPosition: number;
  equivalent: string;
}

// diff.ts - Автоматическое сравнение SQL
export interface SQLDifference {
  type: "keyword" | "datatype" | "function" | "syntax" | "added" | "removed" | "converted";
  originalWord: string;
  convertedWord: string;
  description: string;
  originalLine: number;
  originalPosition: number;
  convertedLine: number;
  convertedPosition: number;
  equivalent: string;
  status?: "added" | "removed" | "converted" | "comment";
}

export interface LineMapping {
  originalLine: number;
  convertedLine: number;
  similarity: number;
}



