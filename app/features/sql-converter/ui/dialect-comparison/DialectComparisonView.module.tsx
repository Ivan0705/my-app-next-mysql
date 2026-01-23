import { SQLDifference } from "../../model/types";
import cls from "./DialectComparisonView.module.css";

export const DialectComparisonView = ({
  dialectChanges,
  fromDialect,
  toDialect,
  highlightedChange,
  onHighlightChange,
}: {
  dialectChanges: SQLDifference[];
  fromDialect: string;
  toDialect: string;
  highlightedChange?: SQLDifference | null;
  onHighlightChange?: (change: SQLDifference | null) => void;
}) => {
  const connectedChanges = dialectChanges.filter(
    (change) =>
      (change.originalWord && change.originalWord.trim() !== "") ||
      (change.convertedWord && change.convertedWord.trim() !== "")
  );

  if (connectedChanges.length === 0) return null;

  return (
    <div className={cls.DialectComparisonView}>
      <h4 className={cls.DialectComparisonView__Header}>
        <span className={cls.DialectComparisonView__Icon}>🔗</span>
        Keyword Connections ({fromDialect} → {toDialect})
        <span className={cls.DialectComparisonView__Count}>
          {connectedChanges.length} connections
        </span>
      </h4>

      <div className={cls.DialectComparisonView__List}>
        {connectedChanges.map((change, index) => (
          <div
            key={index}
            className={`${cls.DialectComparisonView__Card} ${
              highlightedChange === change
                ? cls.DialectComparisonView__Card__Highlighted
                : ""
            }`}
            onMouseEnter={() => onHighlightChange?.(change)}
            onMouseLeave={() => onHighlightChange?.(null)}
          >
            <div className={cls.DialectComparisonView__CardContent}>
              <div className={cls.DialectComparisonView__CardInner}>
                <div className={cls.DialectComparisonView__Connection}>
                  <div className={cls.DialectComparisonView__ConnectionVisual}>
                    <div className={cls.DialectComparisonView__ConnectionDot}>
                      <span
                        className={cls.DialectComparisonView__ConnectionSymbol}
                      >
                        ⇄
                      </span>
                    </div>
                    <div
                      className={cls.DialectComparisonView__ConnectionLine}
                    ></div>
                  </div>

                  <div className={cls.DialectComparisonView__Keywords}>
                    <div
                      className={`${cls.DialectComparisonView__KeywordBox} ${
                        cls.DialectComparisonView__KeywordBox__Original
                      } ${
                        highlightedChange === change
                          ? cls.DialectComparisonView__KeywordBox__OriginalHighlighted
                          : ""
                      }`}
                    >
                      <div className={cls.DialectComparisonView__Keyword}>
                        {change.originalWord || "N/A"}
                      </div>
                      <div className={cls.DialectComparisonView__DialectLabel}>
                        {fromDialect}
                      </div>
                    </div>

                    <div
                      className={`${cls.DialectComparisonView__KeywordBox} ${
                        cls.DialectComparisonView__KeywordBox__Converted
                      } ${
                        highlightedChange === change
                          ? cls.DialectComparisonView__KeywordBox__ConvertedHighlighted
                          : ""
                      }`}
                    >
                      <div className={cls.DialectComparisonView__Keyword}>
                        {change.convertedWord || "N/A"}
                      </div>
                      <div className={cls.DialectComparisonView__DialectLabel}>
                        {toDialect}
                      </div>
                    </div>
                  </div>
                </div>

                <span className={cls.DialectComparisonView__LineInfo}>
                  {change.originalLine !== -1
                    ? `Orig: ${change.originalLine + 1}`
                    : ""}
                  {change.originalLine !== -1 && change.convertedLine !== -1
                    ? " / "
                    : ""}
                  {change.convertedLine !== -1
                    ? `Conv: ${change.convertedLine + 1}`
                    : ""}
                  {change.originalLine === -1 && change.convertedLine === -1
                    ? "Line not found"
                    : ""}
                </span>
              </div>
            </div>

            <p className={cls.DialectComparisonView__Description}>
              <span className={cls.DialectComparisonView__DescriptionIcon}>
                ↳
              </span>
              {change.description}
            </p>

            {(change.originalWord || change.convertedWord) && (
              <div className={cls.DialectComparisonView__Mapping}>
                <div className={cls.DialectComparisonView__MappingLabel}>
                  <span className={cls.DialectComparisonView__MappingText}>
                    Direct mapping:
                  </span>
                  <span className={cls.DialectComparisonView__OriginalWord}>
                    {change.originalWord || "N/A"}
                  </span>
                  <span className={cls.DialectComparisonView__Arrow}>→</span>
                  <span className={cls.DialectComparisonView__ConvertedWord}>
                    {change.convertedWord || "N/A"}
                  </span>
                </div>
                <div className={cls.DialectComparisonView__MappingHint}>
                  Hover over the highlighted words to see the visual connection
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className={cls.DialectComparisonView__Legend}>
        <div className={cls.DialectComparisonView__LegendGrid}>
          <div className={cls.DialectComparisonView__LegendGroup}>
            <div className={cls.DialectComparisonView__LegendItem}>
              <div
                className={`${cls.DialectComparisonView__LegendIndicator} ${cls.DialectComparisonView__LegendIndicator__Original}`}
              ></div>
              <span>Original keyword</span>
            </div>
            <div className={cls.DialectComparisonView__LegendItem}>
              <div
                className={`${cls.DialectComparisonView__LegendIndicator} ${cls.DialectComparisonView__LegendIndicator__Converted}`}
              ></div>
              <span>Converted keyword</span>
            </div>
          </div>
          <div className={cls.DialectComparisonView__LegendGroup}>
            <div className={cls.DialectComparisonView__LegendItem}>
              <div
                className={`${cls.DialectComparisonView__LegendIndicator} ${cls.DialectComparisonView__LegendIndicator__Dot}`}
              ></div>
              <span>Dot = Has connection</span>
            </div>
            <div className={cls.DialectComparisonView__LegendItem}>
              <div
                className={`${cls.DialectComparisonView__LegendIndicator} ${cls.DialectComparisonView__LegendIndicator__Line}`}
              ></div>
              <span>Line = Visual link</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
