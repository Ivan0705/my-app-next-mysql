import { useEffect, useRef, useState } from "react";
import {
  FileInfo,
  SQLDifference,
  TranspilationResult,
} from "../../model/types";
import { findSQLDifferences, quickAnalyzeSQL } from "../../lib/diff";
import cls from "./SQLFileManager.module.css";
import { DIALECTS } from "../../lib/dialects";
import { DialectComparisonView } from "../dialect-comparison/DialectComparisonView.module";
import { SQLSyntaxHighlighter } from "../sql-syntax-highlighter/SqlSyntaxHighlighter";

const SQLFileManager = () => {
  const [files, setFiles] = useState<FileInfo[]>([]);
  const [selectedFile, setSelectedFile] = useState<FileInfo | null>(null);
  const [transpilationResult, setTranspilationResult] =
    useState<TranspilationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const [targetDialect, setTargetDialect] = useState("postgres");
  const [showComparison, setShowComparison] = useState(false);

  const [dialectChanges, setDialectChanges] = useState<SQLDifference[]>([]);

  const [viewMode, setViewMode] = useState<"syntax" | "text">("syntax");
  const [quickAnalysis, setQuickAnalysis] = useState<any>(null);
  const [highlightedChange, setHighlightedChange] =
    useState<SQLDifference | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Обновляем диалект-специфичные изменения при конвертации
  useEffect(() => {
    if (
      showComparison &&
      selectedFile &&
      transpilationResult?.transpiled?.[0]
    ) {
      const originalText = selectedFile.content;
      const convertedText = transpilationResult.transpiled.join("\n\n");

      const sqlDiffs = findSQLDifferences(
        originalText,
        convertedText,
        selectedFile.dialect || "mysql",
        targetDialect
      );

      // Теперь findSQLDifferences уже возвращает правильный формат
      setDialectChanges(sqlDiffs);
    }
  }, [showComparison, selectedFile, transpilationResult, targetDialect]);

  // Быстрый анализ при выборе файла
  useEffect(() => {
    if (selectedFile && selectedFile.dialect === selectedFile.originalDialect) {
      const analysis = quickAnalyzeSQL(selectedFile.content);
      setQuickAnalysis(analysis);
    } else {
      setQuickAnalysis(null);
    }
  }, [selectedFile]);

  const getConvertedContentWithSpaces = () => {
    if (!transpilationResult?.transpiled?.[0]) return "";

    return transpilationResult.transpiled
      .join("\n\n")
      .replace(/;(\s*\n)/g, "; $1")
      .replace(/;([^\s])/g, "; $1")
      .replace(/\$\/\$/g, "$$")
      .replace(/(\S)\/\//g, "$1 //") // Добавляем пробел перед // если нужно
      .replace(/\/\/\s*$/g, "//"); // Сохраняем // в конце строк
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFiles = event.target.files;
    if (!uploadedFiles) return;

    const newFiles: FileInfo[] = [];

    Array.from(uploadedFiles).forEach((file) => {
      if (file.type === "text/plain" || file.name.endsWith(".sql")) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const content = e.target?.result as string;
          const fileInfo: FileInfo = {
            name: file.name,
            size: file.size,
            content: content,
            lastModified: new Date(file.lastModified),
            dialect: "mysql",
            originalDialect: "mysql",
          };

          newFiles.push(fileInfo);

          if (newFiles.length === Array.from(uploadedFiles).length) {
            setFiles((prev) => [...prev, ...newFiles]);
            if (newFiles.length === 1) {
              setSelectedFile(newFiles[0]);
            }
          }
        };
        reader.readAsText(file);
      }
    });
  };

  const updateFileDialect = (fileName: string, newDialect: string) => {
    setFiles((prev) =>
      prev.map((file) =>
        file.name === fileName
          ? { ...file, dialect: newDialect, originalDialect: newDialect }
          : file
      )
    );

    if (selectedFile?.name === fileName) {
      setSelectedFile((prev) =>
        prev
          ? { ...prev, dialect: newDialect, originalDialect: newDialect }
          : null
      );
    }
  };

  const transpileFile = async (file: FileInfo) => {
    setLoading(true);
    setError("");
    setTranspilationResult(null);
    setShowComparison(true);
    setDialectChanges([]);
    setHighlightedChange(null);

    try {
      const response = await fetch("/api/sql/transpile", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sql: file.content,
          from_dialect: file.dialect || "mysql",
          to_dialect: targetDialect,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setTranspilationResult(data);

      if (data.success && data.transpiled && data.transpiled.length > 0) {
        const transpiledContent = data.transpiled.join("\n\n");

        const transpiledFile: FileInfo = {
          name: `${file.name.replace(".sql", "")}_${targetDialect}.sql`,
          size: transpiledContent.length,
          content: transpiledContent,
          lastModified: new Date(),
          dialect: targetDialect,
          originalDialect: file.dialect,
        };

        setFiles((prev) => [...prev, transpiledFile]);

        if (data.warnings && data.warnings.length > 0) {
          setError(
            `✅ Conversion completed with warnings: ${data.warnings.join(", ")}`
          );
        } else {
          setError("✅ Conversion completed successfully");
        }
      } else {
        setError(data.error || "Transpilation failed");
      }
    } catch (error) {
      console.error("Transpilation failed:", error);
      setError(
        `Transpilation failed: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    } finally {
      setLoading(false);
    }
  };

  const saveTranspiledFile = async () => {
    if (!transpilationResult?.transpiled?.[0] || !selectedFile) return;

    const content = transpilationResult.transpiled
      .join("\n\n")
      .replace(/;(\s*\n)/g, "; $1")
      .replace(/;([^\s])/g, "; $1");

    const fileName = `${selectedFile.name.replace(
      ".sql",
      ""
    )}_${targetDialect}.sql`;

    // Проверяем, находимся ли мы в Electron
    if (window.electronAPI) {
      try {
        // Используем Electron API для сохранения файла
        const result = await window.electronAPI.showSaveDialog({
          defaultPath: fileName,
          filters: [
            { name: "SQL Files", extensions: ["sql"] },
            { name: "All Files", extensions: ["*"] },
          ],
        });

        if (!result.canceled && result.filePath) {
          await window.electronAPI.writeFile(result.filePath, content);
          setError("✅ File saved successfully");
        }
      } catch (error) {
        setError(`❌ Failed to save file: ${error}`);
      }
    } else {
      // Старый способ для браузера
      const blob = new Blob([content], { type: "text/sql" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");

      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setError("✅ File downloaded");
    }
  };

  const removeFile = (fileName: string) => {
    setFiles((prev) => prev.filter((f) => f.name !== fileName));
    if (selectedFile?.name === fileName) {
      setSelectedFile(null);
      setTranspilationResult(null);
      setShowComparison(false);
      setDialectChanges([]);
      setHighlightedChange(null);
      setQuickAnalysis(null);
    }
  };

  const clearAllFiles = () => {
    setFiles([]);
    setSelectedFile(null);
    setTranspilationResult(null);
    setShowComparison(false);
    setDialectChanges([]);
    setHighlightedChange(null);
    setQuickAnalysis(null);
    setError("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const getDialectIcon = (dialect?: string) => {
    const found = DIALECTS.find((d) => d.value === dialect);
    return found ? found.icon : "📄";
  };

  const getCompatibilityScore = () => {
    if (!transpilationResult?.feature_compatibility?.compatibility_score)
      return null;
    return (
      transpilationResult.feature_compatibility.compatibility_score * 100
    ).toFixed(0);
  };

  const getFileItemClass = (file: FileInfo) => {
    if (selectedFile?.name === file.name) {
      return file.dialect === file.originalDialect
        ? cls.SQLFileManager__FileItem__SelectedOriginal
        : cls.SQLFileManager__FileItem__SelectedConverted;
    }
    return cls.SQLFileManager__FileItem__Default;
  };

  const getDialectBadgeClass = (file: FileInfo) => {
    return file.dialect === file.originalDialect
      ? cls.SQLFileManager__FileDialectBadge__Original
      : cls.SQLFileManager__FileDialectBadge__Converted;
  };
  return (
    <div className={cls.SQLFileManager}>
      <div className={cls.SQLFileManager__Container}>
        <div className={cls.SQLFileManager__Header}>
          <h1 className={cls.SQLFileManager__Title}>SQL File Converter</h1>
          <p className={cls.SQLFileManager__Subtitle}>
            Convert SQL files between databases with visual dialect keyword
            mapping
          </p>
        </div>

        {/* Настройки конвертации */}
        <div className={cls.SQLFileManager__Settings}>
          <div className={cls.SQLFileManager__SettingsGrid}>
            <div>
              <label className={cls.SQLFileManager__SelectLabel}>
                Target Database
              </label>
              <select
                value={targetDialect}
                onChange={(e) => setTargetDialect(e.target.value)}
                className={cls.SQLFileManager__Select}
              >
                {DIALECTS.map((dialect) => (
                  <option key={dialect.value} value={dialect.value}>
                    {dialect.icon} {dialect.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Загрузка файлов */}
        <div className={cls.SQLFileManager__UploadSection}>
          <div className={cls.SQLFileManager__UploadHeader}>
            <h2 className={cls.SQLFileManager__UploadTitle}>
              Upload SQL Files
            </h2>
            {files.length > 0 && (
              <button
                onClick={clearAllFiles}
                className={cls.SQLFileManager__ClearButton}
              >
                Clear All
              </button>
            )}
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept=".sql,.txt"
            multiple
            onChange={handleFileUpload}
            className={cls.SQLFileManager__FileInput}
          />
          <p className={cls.SQLFileManager__FileInputLabel}>
            Upload SQL files from any supported database
          </p>
        </div>

        {/* Ошибки и уведомления */}
        {error && (
          <div
            className={`${cls.SQLFileManager__Notification} ${
              error.includes("✅")
                ? cls.SQLFileManager__Notification__Success
                : cls.SQLFileManager__Notification__Error
            }`}
          >
            <div className={cls.SQLFileManager__NotificationContent}>
              <div
                className={`${cls.SQLFileManager__NotificationIcon} ${
                  error.includes("✅")
                    ? cls.SQLFileManager__NotificationIcon__Success
                    : cls.SQLFileManager__NotificationIcon__Error
                }`}
              >
                {error.includes("✅") ? "✅" : "❌"}
              </div>
              <div>
                <p className={cls.SQLFileManager__NotificationText}>{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Быстрый анализ файла */}
        {quickAnalysis && selectedFile && !showComparison && (
          <div className={cls.SQLFileManager__QuickAnalysis}>
            <h4 className={cls.SQLFileManager__AnalysisTitle}>
              📋 Quick File Analysis
            </h4>
            <div className={cls.SQLFileManager__AnalysisGrid}>
              <div className={cls.SQLFileManager__AnalysisCard}>
                <div className={cls.SQLFileManager__AnalysisValue}>
                  {quickAnalysis.lines}
                </div>
                <div className={cls.SQLFileManager__AnalysisLabel}>Lines</div>
              </div>
              <div
                className={`${cls.SQLFileManager__AnalysisCard} ${cls.SQLFileManager__AnalysisCard__Green}`}
              >
                <div
                  className={`${cls.SQLFileManager__AnalysisValue} ${cls.SQLFileManager__AnalysisValue__Green}`}
                >
                  {quickAnalysis.words}
                </div>
                <div
                  className={`${cls.SQLFileManager__AnalysisLabel} ${cls.SQLFileManager__AnalysisLabel__Green}`}
                >
                  Words
                </div>
              </div>
              <div
                className={`${cls.SQLFileManager__AnalysisCard} ${cls.SQLFileManager__AnalysisCard__Purple}`}
              >
                <div
                  className={`${cls.SQLFileManager__AnalysisValue} ${cls.SQLFileManager__AnalysisValue__Purple}`}
                >
                  {quickAnalysis.type}
                </div>
                <div
                  className={`${cls.SQLFileManager__AnalysisLabel} ${cls.SQLFileManager__AnalysisLabel__Purple}`}
                >
                  Type
                </div>
              </div>
              <div
                className={`${cls.SQLFileManager__AnalysisCard} ${cls.SQLFileManager__AnalysisCard__Orange}`}
              >
                <div
                  className={`${cls.SQLFileManager__AnalysisValue} ${cls.SQLFileManager__AnalysisValue__Orange}`}
                >
                  {quickAnalysis.estimatedComplexity}/5
                </div>
                <div
                  className={`${cls.SQLFileManager__AnalysisLabel} ${cls.SQLFileManager__AnalysisLabel__Orange}`}
                >
                  Complexity
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Список файлов */}
        <div className={cls.SQLFileManager__FilesSection}>
          <h3 className={cls.SQLFileManager__FilesTitle}>
            Files ({files.length})
          </h3>
          <div className={cls.SQLFileManager__FilesList}>
            {files.length === 0 ? (
              <p className={cls.SQLFileManager__EmptyFiles}>
                No files uploaded yet
              </p>
            ) : (
              files.map((file, index) => (
                <div
                  key={index}
                  className={`${
                    cls.SQLFileManager__FileItem
                  } ${getFileItemClass(file)}`}
                  onClick={() => {
                    setSelectedFile(file);
                    setShowComparison(false);
                    setTranspilationResult(null);
                    setDialectChanges([]);
                    setHighlightedChange(null);
                    setViewMode("syntax");
                  }}
                >
                  <div className={cls.SQLFileManager__FileContent}>
                    <div className={cls.SQLFileManager__FileInfo}>
                      <div className={cls.SQLFileManager__FileHeader}>
                        <span className={cls.SQLFileManager__FileIcon}>
                          {getDialectIcon(file.dialect)}
                        </span>
                        <h4 className={cls.SQLFileManager__FileName}>
                          {file.name}
                        </h4>
                      </div>

                      {file.dialect === file.originalDialect && (
                        <div
                          className={cls.SQLFileManager__DialectSelectWrapper}
                        >
                          <label
                            className={cls.SQLFileManager__DialectSelectLabel}
                          >
                            Source Dialect:
                          </label>
                          <select
                            value={file.dialect || "mysql"}
                            onChange={(e) =>
                              updateFileDialect(file.name, e.target.value)
                            }
                            className={cls.SQLFileManager__DialectSelect}
                            onClick={(e) => e.stopPropagation()}
                          >
                            {DIALECTS.map((dialect) => (
                              <option key={dialect.value} value={dialect.value}>
                                {dialect.label}
                              </option>
                            ))}
                          </select>
                        </div>
                      )}

                      <p className={cls.SQLFileManager__FileMeta}>
                        {(file.size / 1024).toFixed(1)} KB • {file.dialect}
                        {file.originalDialect &&
                          file.dialect !== file.originalDialect &&
                          ` (from ${file.originalDialect})`}
                      </p>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeFile(file.name);
                      }}
                      className={cls.SQLFileManager__RemoveButton}
                      title="Remove file"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Основной контент - сравнение или одиночный просмотр */}
        {selectedFile && (
          <div className={cls.SQLFileManager__FileDetails}>
            {/* Заголовок с действиями */}
            <div className={cls.SQLFileManager__FileHeader}>
              <h3 className={cls.SQLFileManager__FileTitle}>
                <div className={cls.SQLFileManager__FileTitleContent}>
                  <span className={cls.SQLFileManager__FileIcon}>
                    {getDialectIcon(selectedFile.dialect)}
                  </span>
                  {selectedFile.name}
                  <span
                    className={`${
                      cls.SQLFileManager__FileDialectBadge
                    } ${getDialectBadgeClass(selectedFile)}`}
                  >
                    {selectedFile.dialect}
                    {selectedFile.originalDialect &&
                      selectedFile.dialect !== selectedFile.originalDialect &&
                      ` (from ${selectedFile.originalDialect})`}
                  </span>
                </div>
              </h3>

              <div className={cls.SQLFileManager__ActionButtons}>
                {selectedFile.dialect === selectedFile.originalDialect && (
                  <button
                    onClick={() => transpileFile(selectedFile)}
                    disabled={loading}
                    className={`${cls.SQLFileManager__ActionButton} ${cls.SQLFileManager__ActionButton__Convert}`}
                  >
                    {loading && (
                      <span className={cls.SQLFileManager__Spinner}>🔄</span>
                    )}
                    {loading ? "Converting..." : `Convert to ${targetDialect}`}
                  </button>
                )}

                {showComparison && transpilationResult && (
                  <button
                    onClick={saveTranspiledFile}
                    className={`${cls.SQLFileManager__ActionButton} ${cls.SQLFileManager__ActionButton__Save}`}
                  >
                    💾 Save Converted File
                  </button>
                )}
              </div>
            </div>

            {/* Сравнение или одиночный просмотр */}
            {showComparison && transpilationResult ? (
              <div className={cls.SQLFileManager__ComparisonContent}>
                {/* Предупреждения и статистика конвертации */}
                {(transpilationResult.warnings?.length > 0 ||
                  transpilationResult.feature_compatibility) && (
                  <div className={cls.SQLFileManager__ConversionReport}>
                    <h4 className={cls.SQLFileManager__ReportTitle}>
                      ⚠️ Conversion Report
                    </h4>

                    {transpilationResult.warnings?.length > 0 && (
                      <div className={cls.SQLFileManager__WarningsList}>
                        <p className={cls.SQLFileManager__WarningLabel}>
                          Warnings:
                        </p>
                        <ul className={cls.SQLFileManager__WarningList}>
                          {transpilationResult.warnings.map(
                            (warning, index) => (
                              <li key={index}>{warning}</li>
                            )
                          )}
                        </ul>
                      </div>
                    )}

                    {transpilationResult.feature_compatibility && (
                      <div className={cls.SQLFileManager__CompatibilityScore}>
                        <p className={cls.SQLFileManager__CompatibilityText}>
                          Feature Compatibility: {getCompatibilityScore()}%
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* Сравнение диалект-специфичных слов с подчеркиванием */}
                <DialectComparisonView
                  dialectChanges={dialectChanges}
                  fromDialect={selectedFile.dialect || "mysql"}
                  toDialect={targetDialect}
                  highlightedChange={highlightedChange}
                  onHighlightChange={setHighlightedChange}
                />

                {/* Side-by-side сравнение с интерактивной подсветкой */}
                <div className={cls.SQLFileManager__ComparisonGrid}>
                  {/* Исходный SQL */}
                  <div className={cls.SQLFileManager__ComparisonColumn}>
                    <div className={cls.SQLFileManager__ComparisonHeader}>
                      <h4 className={cls.SQLFileManager__ComparisonTitle}>
                        Original SQL ({selectedFile.dialect})
                      </h4>
                      <span
                        className={`${cls.SQLFileManager__ComparisonBadge} ${cls.SQLFileManager__ComparisonBadge__Source}`}
                      >
                        <span>●</span> Source
                      </span>
                    </div>
                    <div
                      className={`${cls.SQLFileManager__ComparisonBox} ${cls.SQLFileManager__ComparisonBox__Source}`}
                    >
                      <SQLSyntaxHighlighter
                        content={selectedFile.content}
                        differences={dialectChanges}
                        type="original"
                        dialect={selectedFile.dialect || "mysql"}
                        onWordHover={setHighlightedChange}
                        highlightedChange={highlightedChange}
                      />
                    </div>
                  </div>

                  {/* Конвертированный SQL */}
                  <div className={cls.SQLFileManager__ComparisonColumn}>
                    <div className={cls.SQLFileManager__ComparisonHeader}>
                      <h4 className={cls.SQLFileManager__ComparisonTitle}>
                        Converted SQL ({targetDialect})
                      </h4>
                      <span
                        className={`${cls.SQLFileManager__ComparisonBadge} ${cls.SQLFileManager__ComparisonBadge__Target}`}
                      >
                        <span>●</span> Target
                      </span>
                    </div>
                    <div
                      className={`${cls.SQLFileManager__ComparisonBox} ${cls.SQLFileManager__ComparisonBox__Target}`}
                    >
                      <SQLSyntaxHighlighter
                        content={getConvertedContentWithSpaces()}
                        differences={dialectChanges}
                        type="converted"
                        dialect={targetDialect}
                        onWordHover={setHighlightedChange}
                        highlightedChange={highlightedChange}
                      />
                    </div>
                  </div>
                </div>

                {/* Визуальный индикатор связи при hover */}
                {highlightedChange && (
                  <div className={cls.SQLFileManager__VisualIndicator}>
                    <span className={cls.SQLFileManager__IndicatorIcon}>
                      🔗
                    </span>
                    <div className={cls.SQLFileManager__IndicatorContent}>
                      <span className={cls.SQLFileManager__IndicatorOriginal}>
                        {highlightedChange.originalWord}
                      </span>
                      <span className={cls.SQLFileManager__IndicatorArrow}>
                        →
                      </span>
                      <span className={cls.SQLFileManager__IndicatorConverted}>
                        {highlightedChange.convertedWord}
                      </span>
                    </div>
                    <span className={cls.SQLFileManager__IndicatorLineInfo}>
                      {highlightedChange.originalLine !== -1 &&
                        `Orig: ${highlightedChange.originalLine + 1}`}
                      {highlightedChange.originalLine !== -1 &&
                        highlightedChange.convertedLine !== -1 &&
                        " / "}
                      {highlightedChange.convertedLine !== -1 &&
                        `Conv: ${highlightedChange.convertedLine + 1}`}
                    </span>
                  </div>
                )}
              </div>
            ) : (
              /* Одиночный просмотр когда сравнение не активно */
              <div className={cls.SQLFileManager__SingleView}>
                <textarea
                  value={selectedFile.content}
                  readOnly
                  className={cls.SQLFileManager__Textarea}
                  placeholder="File content will appear here..."
                />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SQLFileManager;
