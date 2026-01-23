import React from "react";
import cls from "./SQLSyntaxHighlighter.module.css";
import { SQLDifference } from "../../model/types";
import { isSQLKeyword } from "../../lib/sql-keywords";
import { isDataTypeToken } from "./consts";

interface SQLSyntaxHighlighterProps {
  content: string;
  type: "original" | "converted";
  dialect: string;
  differences?: SQLDifference[];
  highlightedChange?: SQLDifference | null;
  onWordHover?: (change: SQLDifference | null) => void;
}

export const SQLSyntaxHighlighter: React.FC<SQLSyntaxHighlighterProps> = ({
  content,
  type,
  dialect,
  differences = [],
  onWordHover,
  highlightedChange,
}) => {
  const lines = content.split("\n");

  // Фильтруем различия для текущего типа
  const relevantDifferences = differences.filter((diff) => {
    if (type === "original") {
      return diff.originalLine !== -1 && diff.originalWord.trim() !== "";
    } else {
      return diff.convertedLine !== -1 && diff.convertedWord.trim() !== "";
    }
  });

  // SQLSyntaxHighlighter.tsx - исправленная функция highlightLine
  // SQLSyntaxHighlighter.tsx - улучшаем highlightLine
  const highlightLine = (line: string, lineIndex: number) => {
    // Ищем различия для этой строки
    const lineDiffs = relevantDifferences.filter((diff) => {
      const diffLine =
        type === "original" ? diff.originalLine : diff.convertedLine;
      const diffPosition =
        type === "original" ? diff.originalPosition : diff.convertedPosition;

      if (diffLine !== lineIndex) return false;
      if (diffPosition < 0) return false;

      // Проверяем, что позиция в пределах строки
      return diffPosition < line.length;
    });

    // Создаем массивы для стилей
    const charStyles = new Array(line.length).fill("");
    const charTooltips = new Array(line.length).fill("");
    const charDiffMap = new Array<SQLDifference | null>(line.length).fill(null);

    // Применяем стили для различий
    lineDiffs.forEach((diff) => {
      const diffWord =
        type === "original" ? diff.originalWord : diff.convertedWord;
      const position =
        type === "original" ? diff.originalPosition : diff.convertedPosition;

      if (position !== -1 && diffWord && position < line.length) {
        const start = position;
        const end = Math.min(start + diffWord.length, line.length);

        // Проверяем, что в этой позиции действительно нужное слово
        for (let i = start; i < end && i < line.length; i++) {
          charStyles[i] = getHighlightClassByType(diff.type);
          charTooltips[i] = diff.description;
          charDiffMap[i] = diff;
        }
      }
    });

    // Разбиваем строку на токены с сохранением позиций
    const tokens: Array<{ text: string; start: number; end: number }> = [];
    const tokenRegex = /(\s+|[^\s,;()=<>!\[\]{}]+|[,\;\(\)=<>!\[\]{}])/g;
    let match: RegExpExecArray | null;

    while ((match = tokenRegex.exec(line)) !== null) {
      const text = match[0];
      const start = match.index;
      const end = start + text.length;
      tokens.push({ text, start, end });
    }

    return tokens.map((token, tokenIndex) => {
      const { text, start, end } = token;
      const upperToken = text.toUpperCase().trim();
      let className = cls.SQLSyntaxHighlighter__Token;
      let tooltip = "";
      let currentDiff: SQLDifference | null = null;

      // Проверяем, есть ли выделение для этого токена
      for (let i = start; i < end && i < charStyles.length; i++) {
        if (charStyles[i]) {
          className = `${cls.SQLSyntaxHighlighter__Token} ${charStyles[i]}`;
          currentDiff = charDiffMap[i];
          tooltip = charTooltips[i];
          break;
        }
      }

      // Если нет выделения, проверяем другие типы токенов
      if (className === cls.SQLSyntaxHighlighter__Token) {
        if (isSQLKeyword(upperToken, dialect)) {
          className = `${cls.SQLSyntaxHighlighter__Token} ${cls.SQLSyntaxHighlighter__Keyword}`;
          tooltip = `${dialect} SQL keyword`;
        } else if (isDataTypeToken(upperToken)) {
          className = `${cls.SQLSyntaxHighlighter__Token} ${cls.SQLSyntaxHighlighter__DataType}`;
          tooltip = "Data type";
        } else if (/^\d+(\.\d+)?$/.test(text)) {
          className = `${cls.SQLSyntaxHighlighter__Token} ${cls.SQLSyntaxHighlighter__Number}`;
          tooltip = "Number";
        } else if (
          (text.startsWith("'") && text.endsWith("'")) ||
          (text.startsWith('"') && text.endsWith('"'))
        ) {
          className = `${cls.SQLSyntaxHighlighter__Token} ${cls.SQLSyntaxHighlighter__String}`;
          tooltip = "String literal";
        } else if (
          text.startsWith("--") ||
          text.startsWith("/*") ||
          text.startsWith("//") ||
          text.endsWith("*/")
        ) {
          className = `${cls.SQLSyntaxHighlighter__Token} ${cls.SQLSyntaxHighlighter__Comment}`;
          tooltip = "Comment";
        } else if (/^[=<>!+\-*/%&|^~]+$/.test(text)) {
          className = `${cls.SQLSyntaxHighlighter__Token} ${cls.SQLSyntaxHighlighter__Operator}`;
          tooltip = "Operator";
        }
      }

      // Если токен выделен при наведении
      const isHighlighted =
        highlightedChange && currentDiff === highlightedChange;
      if (isHighlighted) {
        className += ` ${cls.SQLSyntaxHighlighter__Active}`;
      }

      // Если токен - пробел
      if (!text.trim()) {
        className = cls.SQLSyntaxHighlighter__Whitespace;
      }

      return (
        <span
          key={tokenIndex}
          className={className}
          onMouseEnter={() => onWordHover?.(currentDiff || null)}
          onMouseLeave={() => onWordHover?.(null)}
          title={tooltip}
        >
          {text}
        </span>
      );
    });
  };
  // Вспомогательная функция для получения CSS класса по типу изменения
  const getHighlightClassByType = (type: string): string => {
    switch (type) {
      case "removed":
        return cls.SQLSyntaxHighlighter__Removed;
      case "added":
        return cls.SQLSyntaxHighlighter__Added;
      case "keyword":
      case "datatype":
      case "function":
      case "syntax":
      case "converted":
      default:
        return cls.SQLSyntaxHighlighter__Highlighted;
    }
  };

  return (
    <div className={cls.SQLSyntaxHighlighter__Container}>
      <div className={cls.SQLSyntaxHighlighter__ContentWrapper}>
        {lines.map((line, lineIndex) => (
          <div key={lineIndex} className={cls.SQLSyntaxHighlighter__Line}>
            <span className={cls.SQLSyntaxHighlighter__LineNumber}>
              {lineIndex + 1}
            </span>
            <div className={cls.SQLSyntaxHighlighter__Content}>
              {highlightLine(line, lineIndex)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
