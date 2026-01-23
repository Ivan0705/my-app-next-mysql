import { getIndent, splitColumns } from './utils';
import { applyDialectConversion } from './dialect-rules';

/**
 * Форматирует CREATE TABLE с сохранением структуры
 */
export function formatCreateTable(sql: string, indent: number): string[] {
  const lines: string[] = [];
  
  // Находим позицию открывающей скобки
  const openParen = sql.indexOf('(');
  if (openParen === -1) {
    lines.push(' '.repeat(indent) + sql);
    return lines;
  }
  
  // Первая строка: CREATE TABLE name (
  const firstPart = sql.substring(0, openParen + 1).trim();
  lines.push(' '.repeat(indent) + firstPart);
  
  // Извлекаем содержимое скобок
  const closeParen = sql.lastIndexOf(')');
  const content = sql.substring(openParen + 1, closeParen).trim();
  
  // Разбиваем на колонки
  const columns = splitColumns(content);
  
  // Форматируем каждую колонку
  columns.forEach((column, index) => {
    let columnLine = ' '.repeat(indent + 4) + column.trim();
    if (index < columns.length - 1) {
      columnLine += ',';
    }
    lines.push(columnLine);
  });
  
  // Закрывающая скобка
  lines.push(' '.repeat(indent) + ');');
  
  return lines;
}

/**
 * Пост-обработка для BigQuery
 */
export function processBigQueryResult(sql: string): string {
  const lines = sql.split('\n');
  const newLines: string[] = [];
  let inCreateTable = false;
  
  for (const line of lines) {
    if (line.toUpperCase().includes('CREATE TABLE')) {
      inCreateTable = true;
      newLines.push(line);
    } else if (line.includes(');')) {
      inCreateTable = false;
      newLines.push(line);
    } else if (inCreateTable && !line.trim()) {
      // Пропускаем пустые строки внутри CREATE TABLE
      continue;
    } else if (line.toUpperCase().includes('FOREIGN KEY')) {
      // Пропускаем строки с FOREIGN KEY
      continue;
    } else {
      newLines.push(line);
    }
  }
  
  return newLines.join('\n');
}

/**
 * Форматирует SQL, сохраняя оригинальную структуру
 */
export function formatSqlWithOriginalStructure(originalSql: string, dialect: string): string {
  const lines = originalSql.split('\n');
  const resultLines: string[] = [];
  
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    const stripped = line.trim();
    
    // Сохраняем комментарии и пустые строки
    if (!stripped || stripped.startsWith('--')) {
      resultLines.push(line);
      i++;
      continue;
    }
    
    // Если это CREATE TABLE
    if (stripped.startsWith('CREATE TABLE')) {
      const tableBlock: string[] = [line];
      
      // Собираем весь блок CREATE TABLE
      let j = i + 1;
      while (j < lines.length) {
        const nextLine = lines[j];
        tableBlock.push(nextLine);
        if (nextLine.includes(';')) break;
        j++;
      }
      
      // Объединяем блок
      const tableSql = tableBlock.map(l => l.trim()).join(' ');
      // Применяем конвертацию
      const converted = applyDialectConversion(tableSql, dialect);
      // Разбиваем обратно с форматированием
      const formatted = formatCreateTable(converted, getIndent(line));
      resultLines.push(...formatted);
      
      i = j + 1;
      continue;
    }
    
    // Если это SELECT - сохраняем оригинальное форматирование
    if (stripped.startsWith('SELECT')) {
      const selectBlock: string[] = [line];
      
      // Собираем оригинальный SELECT блок
      let j = i;
      while (j < lines.length) {
        if (j > i) selectBlock.push(lines[j]);
        if (lines[j].trim().endsWith(';')) break;
        j++;
      }
      
      // Применяем конвертацию к каждой строке отдельно
      selectBlock.forEach(selectLine => {
        if (selectLine.trim()) {
          const convertedLine = applyDialectConversion(selectLine.trim(), dialect);
          resultLines.push(' '.repeat(getIndent(selectLine)) + convertedLine);
        } else {
          resultLines.push(selectLine);
        }
      });
      
      i = j + 1;
      continue;
    }
    
    // Другие SQL-выражения
    const converted = applyDialectConversion(stripped, dialect);
    resultLines.push(' '.repeat(getIndent(line)) + converted);
    i++;
  }
  
  return resultLines.join('\n');
}
