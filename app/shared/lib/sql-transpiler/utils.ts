/**
 * Получает размер отступа строки
 */
export function getIndent(line: string): number {
  return line.length - line.trimStart().length;
}

/**
 * Разбивает часть SQL с колонками на отдельные колонки
 */
export function splitColumns(sqlPart: string): string[] {
  const columns: string[] = [];
  let current: string[] = [];
  let depth = 0;
  
  for (const char of sqlPart) {
    if (char === '(') {
      depth += 1;
    } else if (char === ')') {
      depth -= 1;
    }
    
    if (char === ',' && depth === 0) {
      columns.push(current.join('').trim());
      current = [];
    } else {
      current.push(char);
    }
  }
  
  if (current.length > 0) {
    columns.push(current.join('').trim());
  }
  
  return columns;
}

/**
 * Очищает SQL от лишних пробелов и форматирует
 */
export function cleanSql(sql: string): string {
  return sql
    .replace(/\(\s+/g, '(')
    .replace(/\s+\)/g, ')')
    .replace(/,\s+/g, ', ')
    .replace(/\s+/g, ' ');
}
