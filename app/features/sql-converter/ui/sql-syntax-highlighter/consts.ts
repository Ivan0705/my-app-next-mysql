// consts.ts - улучшенная функция isDataTypeToken
export const isDataTypeToken = (token: string): boolean => {
  const dataTypePatterns = [
    /^INT(EGER)?$/i,
    /^BIGINT$/i,
    /^SMALLINT$/i,
    /^TINYINT$/i,
    /^FLOAT$/i,
    /^DOUBLE$/i,
    /^DECIMAL$/i,
    /^NUMERIC$/i,
    /^VARCHAR$/i,
    /^CHAR$/i,
    /^TEXT$/i,
    /^BLOB$/i,
    /^DATE$/i,
    /^DATETIME$/i,
    /^TIMESTAMP$/i,
    /^TIME$/i,
    /^YEAR$/i,
    /^BOOLEAN$/i,
    /^JSON$/i,
    /^UUID$/i,
    /^SERIAL$/i,
    /^BIGSERIAL$/i,
    /^NUMBER$/i,
    /^CLOB$/i,
    /^RAW$/i,
    /^BINARY$/i,
    /^VARBINARY$/i,
    /^MONEY$/i,
    /^TIMESTAMPTZ$/i, // Добавляем PostgreSQL типы
    /^BYTEA$/i,
    /^JSONB$/i,
    /^STRING$/i, // Добавляем BigQuery/Snowflake типы
    /^INT64$/i,
    /^FLOAT64$/i,
    /^BYTES$/i,
    /^VARCHAR2$/i, // Oracle
    /^NVARCHAR2$/i,
    /^NCLOB$/i,
    /^BINARY_FLOAT$/i,
    /^BINARY_DOUBLE$/i,
    /^TIMESTAMP_NTZ$/i, // Snowflake
    /^TIMESTAMP_LTZ$/i,
    /^TIMESTAMP_TZ$/i,
    /^VARIANT$/i,
    /^ARRAY$/i,
    /^OBJECT$/i,
    /^SUPER$/i, // Redshift
    /^VARBYTE$/i,
  ];

  return dataTypePatterns.some((pattern) => pattern.test(token));
};
