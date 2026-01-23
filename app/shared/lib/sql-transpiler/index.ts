import { DIALECT_NOTES, SUPPORTED_DIALECTS } from './constants';
import { formatSqlWithOriginalStructure, processBigQueryResult } from './formatter';
import { applyDialectConversion } from './dialect-rules';
import type { TranspileResult, AnalyzeResult, DialectsResult } from './types';

/**
 * Транспиляция SQL с сохранением форматирования и диалектных особенностей
 */
export function transpileSqlForDialect(
  sql: string,
  fromDialect: string,
  toDialect: string
): TranspileResult {
  try {
    const warnings: string[] = [];
    
    // Простая конвертация с сохранением форматирования
    let result = formatSqlWithOriginalStructure(sql, toDialect);
    
    // Диалект-специфичные пост-обработки
    if (toDialect === "sqlite" && result.toUpperCase().includes("FOREIGN KEY")) {
      if (!result.includes("PRAGMA foreign_keys = ON;")) {
        const lines = result.split('\n');
        let insertIdx = 0;
        for (let idx = 0; idx < lines.length; idx++) {
          if (lines[idx].trim() && !lines[idx].trim().startsWith('--')) {
            insertIdx = idx;
            break;
          }
        }
        lines.splice(insertIdx, 0, "-- SQLite requires PRAGMA foreign_keys = ON for FK support");
        lines.splice(insertIdx + 1, 0, "PRAGMA foreign_keys = ON;");
        result = lines.join('\n');
      }
    } else if (toDialect === "bigquery") {
      result = processBigQueryResult(result);
    }
    
    return {
      success: true,
      transpiled: [result],
      from_dialect: fromDialect,
      to_dialect: toDialect,
      warnings,
      note: DIALECT_NOTES[toDialect] || "Check dialect-specific documentation"
    };
    
  } catch (error) {
    const fallbackSql = applyDialectConversion(sql, toDialect);
    
    return {
      success: false,
      error: `Transpilation failed: ${error instanceof Error ? error.message : String(error)}`,
      transpiled: [fallbackSql],
      from_dialect: fromDialect,
      to_dialect: toDialect,
      warnings: []
    };
  }
}

/**
 * Анализ SQL
 */
export function analyzeSql(sql: string): AnalyzeResult {
  try {
    const hasComplex = [
      'CREATE PROCEDURE',
      'CREATE FUNCTION',
      'CREATE TRIGGER',
      'DELIMITER'
    ].some(keyword => sql.toUpperCase().includes(keyword));
    
    return {
      success: true,
      statements: sql.split(';').filter(s => s.trim()).length,
      lines: sql.split('\n').length,
      has_complex_constructs: hasComplex,
      note: "Basic SQL analysis"
    };
  } catch (error) {
    return {
      success: false,
      error: `Analysis failed: ${error instanceof Error ? error.message : String(error)}`,
      statements: 0,
      lines: 0,
      has_complex_constructs: false,
      note: "Analysis error"
    };
  }
}

/**
 * Получение поддерживаемых диалектов
 */
export function getSupportedDialects(): DialectsResult {
  return {
    success: true,
    dialects: SUPPORTED_DIALECTS
  };
}

/**
 * Основная функция обработки запросов
 */
export function handleSqlRequest(action: string, data: any) {
  switch (action) {
    case 'transpile':
      return transpileSqlForDialect(
        data.sql || '',
        data.from_dialect || 'mysql',
        data.to_dialect || 'postgres'
      );
      
    case 'analyze':
      return analyzeSql(data.sql || '');
      
    case 'supported_dialects':
      return getSupportedDialects();
      
    default:
      return {
        success: false,
        error: `Unknown action: ${action}`
      };
  }
}
