
#!/usr/bin/env python3
"""
ГИБРИДНЫЙ SQL ТРАНСПИЛЯТОР - ДЕМОНСТРАЦИЯ ДЛЯ КОМАНДЫ
Сочетает простые замены для базовых конструкций и sqlglot для сложных
Включает встроенный сложный пример SQL
"""

import sys
import re
import time
from typing import List, Dict, Any, Optional
from pathlib import Path

# ==================== ВСТРОЕННЫЙ ПРИМЕР SQL ====================

COMPLEX_SQL_EXAMPLE = """-- Пример сложного SQL с различными конструкциями
-- Автор: Команда разработки
-- Дата: 2026

-- Создание таблиц
CREATE TABLE departments (
    dept_id INT PRIMARY KEY AUTO_INCREMENT,
    dept_name VARCHAR(100) NOT NULL,
    budget DECIMAL(15,2) DEFAULT 0.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE employees (
    emp_id INT PRIMARY KEY AUTO_INCREMENT,
    dept_id INT NOT NULL,
    emp_name VARCHAR(100) NOT NULL,
    salary DECIMAL(10,2),
    hire_date DATE,
    status ENUM('active', 'on_leave', 'terminated') DEFAULT 'active',
    FOREIGN KEY (dept_id) REFERENCES departments(dept_id) ON DELETE CASCADE
);

CREATE TABLE projects (
    project_id INT PRIMARY KEY AUTO_INCREMENT,
    project_name VARCHAR(200) NOT NULL,
    start_date DATE,
    end_date DATE,
    budget DECIMAL(15,2)
);

CREATE TABLE employee_projects (
    emp_id INT,
    project_id INT,
    role VARCHAR(50),
    hours_worked DECIMAL(5,2),
    PRIMARY KEY (emp_id, project_id),
    FOREIGN KEY (emp_id) REFERENCES employees(emp_id),
    FOREIGN KEY (project_id) REFERENCES projects(project_id)
);

-- Пример 1: Сложный запрос с оконными функциями и CTE
WITH department_stats AS (
    SELECT 
        d.dept_id,
        d.dept_name,
        COUNT(e.emp_id) as employee_count,
        AVG(e.salary) as avg_salary,
        SUM(e.salary) as total_salary
    FROM departments d
    LEFT JOIN employees e ON d.dept_id = e.dept_id
    WHERE e.status = 'active'
    GROUP BY d.dept_id, d.dept_name
),
ranked_departments AS (
    SELECT 
        *,
        RANK() OVER (ORDER BY total_salary DESC) as salary_rank,
        DENSE_RANK() OVER (ORDER BY employee_count DESC) as size_rank
    FROM department_stats
)
SELECT 
    dept_name,
    employee_count,
    ROUND(avg_salary, 2) as avg_salary,
    total_salary,
    salary_rank,
    size_rank,
    CASE 
        WHEN total_salary > 1000000 THEN 'High Budget'
        WHEN total_salary > 500000 THEN 'Medium Budget'
        ELSE 'Low Budget'
    END as budget_category
FROM ranked_departments
ORDER BY salary_rank;

-- Пример 2: PIVOT-подобный запрос (эмуляция)
SELECT 
    d.dept_name,
    SUM(CASE WHEN e.status = 'active' THEN 1 ELSE 0 END) as active_employees,
    SUM(CASE WHEN e.status = 'on_leave' THEN 1 ELSE 0 END) as on_leave_employees,
    SUM(CASE WHEN e.status = 'terminated' THEN 1 ELSE 0 END) as terminated_employees,
    COUNT(*) as total_employees
FROM departments d
LEFT JOIN employees e ON d.dept_id = e.dept_id
GROUP BY d.dept_id, d.dept_name
ORDER BY total_employees DESC;

-- Пример 3: Рекурсивный CTE (иерархия менеджеров)
-- Сначала добавим колонку manager_id
ALTER TABLE employees ADD COLUMN manager_id INT NULL;
ALTER TABLE employees ADD FOREIGN KEY (manager_id) REFERENCES employees(emp_id);

-- Рекурсивный запрос для получения иерархии
WITH RECURSIVE employee_hierarchy AS (
    -- Якорь рекурсии: сотрудники без менеджеров (верхний уровень)
    SELECT 
        emp_id,
        emp_name,
        manager_id,
        1 as level,
        CAST(emp_name AS CHAR(500)) as hierarchy_path
    FROM employees
    WHERE manager_id IS NULL
    
    UNION ALL
    
    -- Рекурсивная часть
    SELECT 
        e.emp_id,
        e.emp_name,
        e.manager_id,
        eh.level + 1,
        CONCAT(eh.hierarchy_path, ' -> ', e.emp_name)
    FROM employees e
    INNER JOIN employee_hierarchy eh ON e.manager_id = eh.emp_id
    WHERE eh.level < 10  -- защита от бесконечной рекурсии
)
SELECT 
    emp_id,
    emp_name,
    level,
    hierarchy_path
FROM employee_hierarchy
ORDER BY level, emp_name;

-- Пример 4: Сложный ROLLUP
SELECT 
    COALESCE(d.dept_name, 'All Departments') as department,
    COALESCE(YEAR(e.hire_date), 'All Years') as hire_year,
    COUNT(e.emp_id) as employees_hired,
    ROUND(AVG(e.salary), 2) as avg_salary,
    SUM(e.salary) as total_salary
FROM departments d
LEFT JOIN employees e ON d.dept_id = e.dept_id
WHERE e.status = 'active'
GROUP BY d.dept_name, YEAR(e.hire_date) WITH ROLLUP
HAVING total_salary IS NOT NULL
ORDER BY d.dept_name, hire_year;

-- Пример 5: Оконные функции с PARTITION BY
SELECT 
    e.emp_id,
    e.emp_name,
    d.dept_name,
    e.salary,
    ROUND(AVG(e.salary) OVER (PARTITION BY e.dept_id), 2) as dept_avg_salary,
    ROUND(e.salary - AVG(e.salary) OVER (PARTITION BY e.dept_id), 2) as diff_from_avg,
    RANK() OVER (PARTITION BY e.dept_id ORDER BY e.salary DESC) as salary_rank_in_dept,
    PERCENT_RANK() OVER (PARTITION BY e.dept_id ORDER BY e.salary) as salary_percentile
FROM employees e
JOIN departments d ON e.dept_id = d.dept_id
WHERE e.status = 'active'
ORDER BY d.dept_name, salary_rank_in_dept;

-- Пример 6: Подзапросы в SELECT, FROM, WHERE
SELECT 
    d.dept_name,
    (SELECT COUNT(*) FROM employees e WHERE e.dept_id = d.dept_id AND e.status = 'active') as active_count,
    (SELECT AVG(salary) FROM employees e WHERE e.dept_id = d.dept_id AND e.status = 'active') as avg_salary,
    (SELECT MAX(salary) FROM employees e WHERE e.dept_id = d.dept_id AND e.status = 'active') as max_salary,
    (SELECT emp_name FROM employees e 
     WHERE e.dept_id = d.dept_id 
     AND e.status = 'active' 
     ORDER BY salary DESC LIMIT 1) as highest_paid_employee
FROM departments d
WHERE EXISTS (
    SELECT 1 FROM employees e 
    WHERE e.dept_id = d.dept_id 
    AND e.status = 'active'
)
ORDER BY d.dept_name;"""

# ==================== КОНСТАНТЫ ====================

DIALECT_NOTES = {
    "snowflake": "Snowflake: No FOREIGN KEY enforcement, AUTOINCREMENT for auto-increment, NUMBER for numeric types",
    "bigquery": "BigQuery: No FOREIGN KEY support, STRING instead of VARCHAR, NUMERIC for decimals",
    "oracle": "Oracle: Use SEQUENCES or GENERATED AS IDENTITY for auto-increment, VARCHAR2 instead of VARCHAR",
    "postgres": "PostgreSQL: GENERATED BY DEFAULT AS IDENTITY for auto-increment, TIMESTAMPTZ for timestamps",
    "mssql": "SQL Server: IDENTITY for auto-increment, DATETIME2 for timestamps, [] for identifiers",
    "sqlite": "SQLite: TEXT for strings and dates, REAL for decimals, AUTOINCREMENT for auto-increment",
    "redshift": "Redshift: Based on PostgreSQL, IDENTITY for auto-increment, limited FOREIGN KEY",
    "mysql": "MySQL: Standard syntax with AUTO_INCREMENT"
}

# ==================== Детектор сложных конструкций ====================

def detect_complex_features(sql: str) -> Dict[str, bool]:
    """Определяет наличие сложных SQL конструкций"""
    sql_upper = sql.upper()
    
    features = {
        "has_window_functions": any(x in sql_upper for x in [
            "OVER(", "ROW_NUMBER()", "RANK()", "DENSE_RANK()", 
            "LEAD(", "LAG(", "FIRST_VALUE(", "LAST_VALUE(",
            "PARTITION BY", "ORDER BY"
        ]),
        "has_cte": "WITH" in sql_upper and ("RECURSIVE" in sql_upper or "AS (" in sql_upper),
        "has_recursive": "WITH RECURSIVE" in sql_upper,
        "has_rollup": "WITH ROLLUP" in sql_upper or "GROUPING SETS" in sql_upper,
        "has_pivot": "PIVOT" in sql_upper or "UNPIVOT" in sql_upper,
        "has_case_when": "CASE WHEN" in sql_upper or "CASE" in sql_upper,
        "has_subqueries": any(f"({keyword}" in sql_upper for keyword in [
            "SELECT", "FROM", "WHERE", "HAVING"
        ]),
        "has_json_functions": any(x in sql_upper for x in [
            "JSON_", "->>", "->", "#>", "#>>"
        ]),
        "has_string_functions": any(x in sql_upper for x in [
            "CONCAT(", "SUBSTRING(", "REGEXP_", "LIKE"
        ]),
        "has_date_functions": any(x in sql_upper for x in [
            "DATE_ADD", "DATE_SUB", "DATEDIFF", "YEAR(", "MONTH("
        ]),
        "has_aggregate_functions": any(x in sql_upper for x in [
            "SUM(", "AVG(", "COUNT(", "MAX(", "MIN("
        ]),
    }
    
    features["is_complex"] = any(features[key] for key in [
        "has_window_functions", "has_cte", "has_recursive", 
        "has_rollup", "has_pivot"
    ])
    
    return features

# ==================== Простые замены (для базовых запросов) ====================

def simple_dialect_conversion(sql: str, dialect: str) -> str:
    """Простая конвертация для базовых запросов (CREATE TABLE, простые SELECT)"""
    result = sql
    
    # Общие исправления для всех диалектов
    result = re.sub(r'\);+', ');', result)  # Убираем двойные точки с запятой
    result = re.sub(r'\s{2,}', ' ', result)  # Убираем лишние пробелы
    
    if dialect == "postgres":
        result = re.sub(r'\bAUTO_INCREMENT\b', 'GENERATED BY DEFAULT AS IDENTITY', result, flags=re.IGNORECASE)
        result = re.sub(r'\bINT\b', 'INTEGER', result, flags=re.IGNORECASE)
        result = re.sub(r'\bTIMESTAMP\b', 'TIMESTAMPTZ', result, flags=re.IGNORECASE)
        result = re.sub(r'`([^`]+)`', r'"\1"', result)
        result = re.sub(r'\bDATETIME\b', 'TIMESTAMP', result, flags=re.IGNORECASE)
        result = re.sub(r'ON UPDATE CURRENT_TIMESTAMP', '', result, flags=re.IGNORECASE)
        
    elif dialect == "snowflake":
        result = re.sub(r'\bAUTO_INCREMENT\b', 'AUTOINCREMENT', result, flags=re.IGNORECASE)
        result = re.sub(r'\bINT\b', 'NUMBER', result, flags=re.IGNORECASE)
        result = re.sub(r'\bDECIMAL\s*\(\s*(\d+)\s*,\s*(\d+)\s*\)', r'NUMBER(\1,\2)', result, flags=re.IGNORECASE)
        result = re.sub(r'\bDATETIME\b', 'TIMESTAMP_NTZ', result, flags=re.IGNORECASE)
        result = re.sub(r'DEFAULT CURRENT_TIMESTAMP(?!\()', 'DEFAULT CURRENT_TIMESTAMP()', result, flags=re.IGNORECASE)
        result = re.sub(r'ON UPDATE CURRENT_TIMESTAMP', '', result, flags=re.IGNORECASE)
        
    elif dialect == "bigquery":
        result = re.sub(r'\bAUTO_INCREMENT\b', '', result, flags=re.IGNORECASE)
        result = re.sub(r'\bINT\b', 'INT64', result, flags=re.IGNORECASE)
        result = re.sub(r'\bVARCHAR\s*\(\s*(\d+)\s*\)', r'STRING', result, flags=re.IGNORECASE)
        result = re.sub(r'\bDECIMAL\s*\(\s*(\d+)\s*,\s*(\d+)\s*\)', r'NUMERIC(\1,\2)', result, flags=re.IGNORECASE)
        result = re.sub(r'\bDATETIME\b', 'TIMESTAMP', result, flags=re.IGNORECASE)
        result = re.sub(r'DEFAULT CURRENT_TIMESTAMP(?!\()', 'DEFAULT CURRENT_TIMESTAMP()', result, flags=re.IGNORECASE)
        
        # Убираем FOREIGN KEY для BigQuery полностью
        result = re.sub(r',?\s*FOREIGN KEY\s*\([^)]+\)\s*REFERENCES\s*\w+\s*\([^)]+\)(\s*ON DELETE\s+\w+)?', 
                       '', result, flags=re.IGNORECASE)
        
        # Убираем ALTER TABLE с FOREIGN KEY для BigQuery
        if 'ALTER TABLE' in result.upper() and 'ADD FOREIGN KEY' in result.upper():
            result = ''
            
        result = re.sub(r'\bENUM\s*\([^)]+\)', 'STRING', result, flags=re.IGNORECASE)
        
    elif dialect == "oracle":
        result = re.sub(r'\bAUTO_INCREMENT\b', '', result, flags=re.IGNORECASE)
        result = re.sub(r'\bINT\b', 'NUMBER(10)', result, flags=re.IGNORECASE)
        result = re.sub(r'\bVARCHAR\s*\(\s*', 'VARCHAR2(', result, flags=re.IGNORECASE)
        result = re.sub(r'\bDECIMAL\s*\(\s*(\d+)\s*,\s*(\d+)\s*\)', r'NUMBER(\1,\2)', result, flags=re.IGNORECASE)
        result = re.sub(r'\bTIMESTAMP\b', 'TIMESTAMP', result, flags=re.IGNORECASE)
        result = re.sub(r'\bDATETIME\b', 'DATE', result, flags=re.IGNORECASE)
        result = re.sub(r'DEFAULT CURRENT_TIMESTAMP', 'DEFAULT SYSTIMESTAMP', result, flags=re.IGNORECASE)
        result = re.sub(r'\bENUM\s*\([^)]+\)', 'VARCHAR2(20)', result, flags=re.IGNORECASE)
        
    elif dialect == "mssql":
        result = re.sub(r'\bAUTO_INCREMENT\b', 'IDENTITY(1,1)', result, flags=re.IGNORECASE)
        result = re.sub(r'\bTIMESTAMP\b', 'DATETIME2', result, flags=re.IGNORECASE)
        result = re.sub(r'\bDATETIME\b', 'DATETIME2', result, flags=re.IGNORECASE)
        result = re.sub(r'\bCURRENT_TIMESTAMP\b', 'GETDATE()', result, flags=re.IGNORECASE)
        result = re.sub(r'`([^`]+)`', r'[\1]', result)
        result = re.sub(r'\bENUM\s*\([^)]+\)', 'VARCHAR(20)', result, flags=re.IGNORECASE)
        
        # MSSQL использует INT, а не INT64
        result = re.sub(r'\bINT64\b', 'INT', result, flags=re.IGNORECASE)
        result = re.sub(r'\bNUMERIC\b', 'DECIMAL', result, flags=re.IGNORECASE)
        result = re.sub(r'\bSTRING\b', 'VARCHAR', result, flags=re.IGNORECASE)
        
    elif dialect == "sqlite":
        result = re.sub(r'\bAUTO_INCREMENT\b', 'AUTOINCREMENT', result, flags=re.IGNORECASE)
        result = re.sub(r'\bINT\b', 'INTEGER', result, flags=re.IGNORECASE)
        result = re.sub(r'\bVARCHAR\s*\(\s*(\d+)\s*\)', r'TEXT', result, flags=re.IGNORECASE)
        result = re.sub(r'\bDECIMAL\s*\(\s*(\d+)\s*,\s*(\d+)\s*\)', r'REAL', result, flags=re.IGNORECASE)
        result = re.sub(r'\bTIMESTAMP\b', 'TEXT', result, flags=re.IGNORECASE)
        result = re.sub(r'\bDATETIME\b', 'TEXT', result, flags=re.IGNORECASE)
        result = re.sub(r'\bDATE\b', 'TEXT', result, flags=re.IGNORECASE)
        result = re.sub(r'\bENUM\s*\([^)]+\)', 'TEXT', result, flags=re.IGNORECASE)
        
    elif dialect == "redshift":
        result = re.sub(r'\bAUTO_INCREMENT\b', 'IDENTITY(1,1)', result, flags=re.IGNORECASE)
        result = re.sub(r'\bINT\b', 'INTEGER', result, flags=re.IGNORECASE)
        result = re.sub(r'\bTIMESTAMP\b', 'TIMESTAMP', result, flags=re.IGNORECASE)
        result = re.sub(r'\bDATETIME\b', 'TIMESTAMP', result, flags=re.IGNORECASE)
        result = re.sub(r'\bCURRENT_TIMESTAMP\b', 'GETDATE()', result, flags=re.IGNORECASE)
        result = re.sub(r'\bENUM\s*\([^)]+\)', 'VARCHAR(20)', result, flags=re.IGNORECASE)
    
    return result

# ==================== SQLGlot транспиляция (для сложных запросов) ====================

def transpile_with_sqlglot(sql: str, from_dialect: str, to_dialect: str) -> str:
    """Использует sqlglot для транспиляции сложных запросов"""
    try:
        import sqlglot
        import sqlglot.expressions as exp
        
        # Настройки для разных диалектов
        dialect_mapping = {
            "mssql": "tsql",
            "redshift": "redshift",
            "mysql": "mysql",
            "postgres": "postgres",
            "bigquery": "bigquery",
            "snowflake": "snowflake",
            "oracle": "oracle",
            "sqlite": "sqlite"
        }
        
        read_dialect = dialect_mapping.get(from_dialect, from_dialect)
        write_dialect = dialect_mapping.get(to_dialect, to_dialect)
        
        # Парсим и трансформируем
        parsed = sqlglot.parse_one(sql, read=read_dialect)
        
        if not parsed:
            return sql
        
        # Применяем базовые трансформации для типов данных
        transformed = parsed.transform(lambda node: transform_sqlglot_node(node, to_dialect))
        
        # Генерируем SQL с форматированием
        result = transformed.sql(dialect=write_dialect, pretty=True)  # Изменено на pretty=True
        
        # Пост-обработка
        result = post_process_sqlglot_result(result, to_dialect)
        
        return result
        
    except ImportError:
        return f"-- ERROR: sqlglot not installed. Install with: pip install sqlglot\n-- Original query:\n{sql}"
    except Exception as e:
        error_msg = str(e)
        if "Parse error" in error_msg:
            return f"-- SQLGlot parse error. Using fallback conversion.\n-- Original query:\n{sql}"
        else:
            return f"-- ERROR in sqlglot transpilation: {error_msg[:200]}\n-- Original query:\n{sql}"


def transform_sqlglot_node(node, to_dialect: str):
    """Трансформирует узлы AST для разных диалектов"""
    import sqlglot.expressions as exp
    
    if isinstance(node, exp.DataType):
        return transform_sqlglot_datatype(node, to_dialect)
    
    # Для оконных функций добавляем совместимые преобразования
    if isinstance(node, exp.Window):
        return transform_sqlglot_window(node, to_dialect)
    
    return node

def transform_sqlglot_datatype(datatype, to_dialect: str):
    """Трансформирует типы данных через sqlglot"""
    import sqlglot.expressions as exp
    
    dtype_str = str(datatype).upper()
    
    if to_dialect == "postgres":
        if "INT" in dtype_str and "INTEGER" not in dtype_str:
            return exp.DataType(this="INTEGER")
        elif "DATETIME" in dtype_str:
            return exp.DataType(this="TIMESTAMPTZ")
            
    elif to_dialect == "bigquery":
        if "INT" in dtype_str:
            return exp.DataType(this="INT64")
        elif "VARCHAR" in dtype_str or "CHAR" in dtype_str:
            return exp.DataType(this="STRING")
        elif "DECIMAL" in dtype_str or "NUMERIC" in dtype_str:
            return exp.DataType(this="NUMERIC")
            
    elif to_dialect == "oracle":
        if "INT" in dtype_str or "INTEGER" in dtype_str:
            return exp.DataType.build("NUMBER(10)")
        elif "VARCHAR" in dtype_str:
            return exp.DataType.build("VARCHAR2")
            
    elif to_dialect == "snowflake":
        if "INT" in dtype_str:
            return exp.DataType(this="NUMBER")
        elif "DATETIME" in dtype_str:
            return exp.DataType(this="TIMESTAMP_NTZ")
            
    return datatype

def transform_sqlglot_window(window_node, to_dialect: str):
    """Трансформирует оконные функции для разных диалектов"""
    import sqlglot.expressions as exp
    
    # Для некоторых диалектов нужны специальные настройки оконных функций
    if to_dialect == "bigquery":
        # BigQuery требует явного указания WINDOW в некоторых случаях
        pass
    elif to_dialect == "oracle":
        # Oracle имеет некоторые особенности в синтаксисе оконных функций
        pass
    
    return window_node

def post_process_sqlglot_result(sql: str, dialect: str) -> str:
    """Пост-обработка результата sqlglot"""
    # Исправляем форматирование
    sql = re.sub(r'\s{2,}', ' ', sql)
    sql = re.sub(r'\s+,', ',', sql)
    sql = re.sub(r',\s*', ', ', sql)
    
    # Убираем двойные точки с запятой
    sql = re.sub(r'\);+', ');', sql)
    
    # Диалект-специфичные исправления кавычек
    if dialect == "bigquery":
        sql = re.sub(r'"([^"]+)"', r'`\1`', sql)
        # Убираем FOREIGN KEY комментарии для BigQuery
        lines = sql.split('\n')
        cleaned_lines = []
        for line in lines:
            if 'FOREIGN KEY' in line.upper() and not line.strip().startswith('--'):
                continue  # Пропускаем FOREIGN KEY для BigQuery
            cleaned_lines.append(line)
        sql = '\n'.join(cleaned_lines)
        
    elif dialect in ["postgres", "oracle", "redshift"]:
        sql = re.sub(r'`([^`]+)`', r'"\1"', sql)
    elif dialect == "mssql":
        sql = re.sub(r'`([^`]+)`', r'[\1]', sql)
        sql = re.sub(r'"([^"]+)"', r'[\1]', sql)
        # Исправляем типы для MSSQL
        sql = re.sub(r'\bINT64\b', 'INT', sql, flags=re.IGNORECASE)
        sql = re.sub(r'\bNUMERIC\b', 'DECIMAL', sql, flags=re.IGNORECASE)
        sql = re.sub(r'\bSTRING\b', 'VARCHAR', sql, flags=re.IGNORECASE)
    
    # Исправляем форматирование числовых типов
    sql = re.sub(r'NUMBER\s*\(\s*(\d+)\s*,\s*(\d+)\s*\)', r'NUMBER(\1,\2)', sql, flags=re.IGNORECASE)
    sql = re.sub(r'DECIMAL\s*\(\s*(\d+)\s*,\s*(\d+)\s*\)', r'DECIMAL(\1,\2)', sql, flags=re.IGNORECASE)
    sql = re.sub(r'NUMERIC\s*\(\s*(\d+)\s*,\s*(\d+)\s*\)', r'NUMERIC(\1,\2)', sql, flags=re.IGNORECASE)
    
    return sql.strip()

# ==================== Гибридный транспилятор ====================

def hybrid_transpile(sql: str, from_dialect: str, to_dialect: str) -> Dict[str, Any]:
    """Гибридная транспиляция: использует правильный подход для каждого типа запроса"""
    
    # Анализируем SQL
    features = detect_complex_features(sql)
    warnings = []
    method_used = {"simple": 0, "sqlglot": 0}
    
    # Разбиваем на отдельные выражения
    statements = split_sql_statements(sql)
    transpiled_statements = []
    
    for stmt in statements:
        if not stmt.strip():
            transpiled_statements.append("")
            continue
        
        # Пропускаем пустые ALTER TABLE для BigQuery
        if to_dialect == "bigquery" and "ALTER TABLE" in stmt.upper() and "ADD FOREIGN KEY" in stmt.upper():
            continue
            
        # Определяем, сложный ли это запрос
        stmt_features = detect_complex_features(stmt)
        
        if stmt_features["is_complex"]:
            # Используем sqlglot для сложных запросов
            method_used["sqlglot"] += 1
            transpiled = transpile_with_sqlglot(stmt, from_dialect, to_dialect)
            
            # Добавляем комментарий о методе (только для демонстрации)
            if not transpiled.strip().startswith("--"):
                transpiled = f"-- [Using sqlglot for complex features]\n{transpiled}"
                
        else:
            # Используем простые замены для базовых запросов
            method_used["simple"] += 1
            transpiled = simple_dialect_conversion(stmt, to_dialect)
        
        # Диалект-специфичная пост-обработка
        transpiled = apply_dialect_specific_processing(transpiled, to_dialect)
        
        # Убираем двойные точки с запятой
        transpiled = re.sub(r'\);+', ');', transpiled)
        
        transpiled_statements.append(transpiled)
    
    # Определяем основной использованный метод
    if method_used["sqlglot"] > method_used["simple"]:
        primary_method = "sqlglot"
    else:
        primary_method = "simple"
    
    # Собираем результат
    result_sql = "\n\n".join([s for s in transpiled_statements if s.strip()])
    
    # Добавляем финальную точку с запятой если нужно
    if result_sql.strip() and not result_sql.rstrip().endswith(';'):
        result_sql = result_sql.rstrip() + ';'
    
    return {
        "success": True,
        "transpiled": [result_sql],
        "from_dialect": from_dialect,
        "to_dialect": to_dialect,
        "features_detected": features,
        "methods_used": method_used,
        "primary_method": primary_method,
        "total_statements": len(statements),
        "warnings": warnings,
        "note": DIALECT_NOTES.get(to_dialect, "Check dialect-specific documentation")
    }


def split_sql_statements(sql: str) -> List[str]:
    """Разбивает SQL на отдельные выражения"""
    statements = []
    current = ""
    depth = 0
    in_quote = False
    quote_char = None
    
    for char in sql + ';':
        if char in ("'", '"', '`'):
            if not in_quote:
                in_quote = True
                quote_char = char
            elif quote_char == char:
                # Проверяем экранированные кавычки
                if len(current) > 0 and current[-1] == '\\':
                    pass  # Это экранированная кавычка
                else:
                    in_quote = False
                    quote_char = None
        
        if not in_quote:
            if char == '(':
                depth += 1
            elif char == ')':
                depth -= 1
        
        current += char
        
        if char == ';' and not in_quote and depth == 0:
            stmt = current.strip()
            if stmt and stmt != ';':
                statements.append(stmt)
            current = ""
    
    if current.strip():
        statements.append(current.strip())
    
    return statements

def apply_dialect_specific_processing(sql: str, dialect: str) -> str:
    """Применяет диалект-специфичную пост-обработку"""
    result = sql
    
    if dialect == "snowflake" and "FOREIGN KEY" in result.upper():
        if not result.strip().startswith('--'):
            result = "-- Snowflake doesn't enforce FOREIGN KEY constraints:\n" + result
    
    elif dialect == "bigquery" and "FOREIGN KEY" in result.upper():
        lines = result.split('\n')
        new_lines = []
        for line in lines:
            if 'FOREIGN KEY' in line.upper() and not line.strip().startswith('--'):
                new_lines.append(f"-- BigQuery doesn't support: {line.strip()}")
            else:
                new_lines.append(line)
        result = '\n'.join(new_lines)
    
    elif dialect == "sqlite" and "FOREIGN KEY" in result.upper():
        if "PRAGMA foreign_keys" not in result.upper():
            lines = result.split('\n')
            # Добавляем PRAGMA только в начале файла
            if not any("PRAGMA foreign_keys" in line.upper() for line in lines[:10]):
                result = "-- SQLite requires PRAGMA foreign_keys = ON for FK support\n" + \
                        "PRAGMA foreign_keys = ON;\n\n" + result
    
    return result

# ==================== Демонстрационные функции ====================

def show_original_example():
    """Показывает оригинальный пример SQL"""
    print("📄 ОРИГИНАЛЬНЫЙ ПРИМЕР SQL (MySQL):")
    print("=" * 80)
    print(COMPLEX_SQL_EXAMPLE)
    print("=" * 80)
    
    # Анализируем пример
    features = detect_complex_features(COMPLEX_SQL_EXAMPLE)
    
    print("\n📊 АНАЛИЗ ПРИМЕРА:")
    print("-" * 40)
    print(f"Количество выражений: {len(split_sql_statements(COMPLEX_SQL_EXAMPLE))}")
    print("\nОбнаруженные сложные конструкции:")
    for feature, has_it in features.items():
        if has_it and feature.startswith("has_"):
            print(f"  ✅ {feature.replace('has_', '').replace('_', ' ').title()}")
    
    print(f"\nОбщая сложность: {'ВЫСОКАЯ' if features['is_complex'] else 'НИЗКАЯ'}")

def show_transformation_comparison(dialect: str = "postgres"):
    """Показывает сравнение оригинального и транспилированного кода"""
    print(f"\n🔄 ТРАНСФОРМАЦИЯ В {dialect.upper()}:")
    print("=" * 80)
    
    # Транспилируем
    start_time = time.time()
    result = hybrid_transpile(COMPLEX_SQL_EXAMPLE, "mysql", dialect)
    elapsed = time.time() - start_time
    
    print(f"⏱️  Время преобразования: {elapsed:.3f} сек")
    print(f"🛠️  Методы использованы: {result['methods_used']}")
    print(f"🎯 Основной метод: {result['primary_method']}")
    
    # Показываем фрагменты сравнения
    print(f"\n📊 СРАВНЕНИЕ ФРАГМЕНТОВ:")
    print("-" * 40)
    
    original_statements = split_sql_statements(COMPLEX_SQL_EXAMPLE)
    converted_statements = split_sql_statements(result["transpiled"][0])
    
    # Показываем несколько примеров
    examples_to_show = min(5, len(original_statements))
    
    for i in range(examples_to_show):
        if i < len(original_statements) and i < len(converted_statements):
            orig = original_statements[i]
            conv = converted_statements[i]
            
            if orig.strip() and conv.strip():
                print(f"\nПример {i+1}:")
                print(f"ОРИГИНАЛ (MySQL):")
                print("-" * 40)
                print(orig[:200] + "..." if len(orig) > 200 else orig)
                print(f"\nКОНВЕРТИРОВАННО ({dialect}):")
                print("-" * 40)
                print(conv[:200] + "..." if len(conv) > 200 else conv)
                print()

def show_full_transformation(dialect: str = "postgres"):
    """Показывает полную трансформацию"""
    print(f"\n📋 ПОЛНАЯ ТРАНСФОРМАЦИЯ В {dialect.upper()}:")
    print("=" * 80)
    
    result = hybrid_transpile(COMPLEX_SQL_EXAMPLE, "mysql", dialect)
    
    # Сохраняем в файл
    output_file = f"converted_to_{dialect}.sql"
    with open(output_file, 'w', encoding='utf-8') as f:
        f.write(result["transpiled"][0])
    
    print(f"💾 Результат сохранен в: {output_file}")
    print("\n📄 РЕЗУЛЬТАТ (первые 30 строк):")
    print("-" * 80)
    
    lines = result["transpiled"][0].split('\n')[:30]
    for i, line in enumerate(lines, 1):
        print(f"{i:3}: {line}")
    
    if len(result["transpiled"][0].split('\n')) > 30:
        print("... (полный результат в файле)")
    
    print(f"\n📈 СТАТИСТИКА:")
    print(f"  • Всего выражений: {result['total_statements']}")
    print(f"  • Простые замены: {result['methods_used']['simple']}")
    print(f"  • SQLGlot преобразования: {result['methods_used']['sqlglot']}")
    print(f"  • Основной метод: {result['primary_method']}")

def run_all_dialects_demo():
    """Запускает демонстрацию для всех диалектов"""
    print("🚀 ДЕМОНСТРАЦИЯ ДЛЯ ВСЕХ ДИАЛЕКТОВ")
    print("=" * 80)
    
    dialects = ["postgres", "bigquery", "snowflake", "oracle", "mssql", "sqlite", "redshift"]
    
    for dialect in dialects:
        print(f"\n🎯 КОНВЕРТАЦИЯ В {dialect.upper()}:")
        print("-" * 40)
        
        start_time = time.time()
        result = hybrid_transpile(COMPLEX_SQL_EXAMPLE, "mysql", dialect)
        elapsed = time.time() - start_time
        
        print(f"  Время: {elapsed:.3f} сек")
        print(f"  Методы: {result['methods_used']}")
        print(f"  Основной метод: {result['primary_method']}")
        
        # Сохраняем результат
        output_file = f"converted_to_{dialect}.sql"
        with open(output_file, 'w', encoding='utf-8') as f:
            f.write(result["transpiled"][0])
        
        print(f"  Сохранено в: {output_file}")

def run_performance_demo():
    """Запускает демонстрацию производительности"""
    print("⚡ ДЕМОНСТРАЦИЯ ПРОИЗВОДИТЕЛЬНОСТИ")
    print("=" * 80)
    
    # Простые и сложные тестовые запросы
    simple_query = "CREATE TABLE test (id INT PRIMARY KEY AUTO_INCREMENT, name VARCHAR(100));"
    complex_query = """
WITH cte AS (
    SELECT 1 as n UNION ALL SELECT n + 1 FROM cte WHERE n < 10
)
SELECT n, RANK() OVER (ORDER BY n) as rank FROM cte;
    """
    
    print("\n📊 СРАВНЕНИЕ СКОРОСТИ:")
    print("-" * 40)
    
    # Проверяем наличие sqlglot
    try:
        import sqlglot
        sqlglot_available = True
    except ImportError:
        sqlglot_available = False
        print("⚠️  SQLGlot не установлен")
    
    if sqlglot_available:
        # Тест простого запроса
        print("\n1. ПРОСТОЙ ЗАПРОС (CREATE TABLE):")
        start_time = time.time()
        for _ in range(100):
            simple_dialect_conversion(simple_query, "postgres")
        simple_time = time.time() - start_time
        print(f"   Простые замены (100 итераций): {simple_time:.3f} сек")
        print(f"   Скорость: {100/simple_time:.1f} запросов/сек")
        
        # Тест сложного запроса через простые замены (некорректно, но для сравнения)
        start_time = time.time()
        for _ in range(100):
            simple_dialect_conversion(complex_query, "postgres")
        complex_simple_time = time.time() - start_time
        
        # Тест сложного запроса через sqlglot
        start_time = time.time()
        for _ in range(100):
            transpile_with_sqlglot(complex_query, "mysql", "postgres")
        complex_sqlglot_time = time.time() - start_time
        
        print(f"\n2. СЛОЖНЫЙ ЗАПРОС (CTE + оконные функции):")
        print(f"   Простые замены (100 итераций): {complex_simple_time:.3f} сек")
        print(f"   SQLGlot (100 итераций): {complex_sqlglot_time:.3f} сек")
        print(f"\n📈 ВЫВОДЫ:")
        print(f"   • Простые запросы: простые замены в {complex_sqlglot_time/simple_time:.1f}× быстрее")
        print(f"   • Сложные запросы: SQLGlot дает корректный результат")
        print(f"   • Гибридный подход оптимален для смешанных нагрузок")

# ==================== Основная функция ====================

def main():
    """Основная функция демонстрации"""
    print("🚀 ГИБРИДНЫЙ SQL ТРАНСПИЛЯТОР - ДЕМОНСТРАЦИЯ")
    print("=" * 60)
    print("Используйте:")
    print("  1. python hybrid_transpiler_demo.py show           # Показать оригинальный пример")
    print("  2. python hybrid_transpiler_demo.py compare        # Сравнить фрагменты преобразования")
    print("  3. python hybrid_transpiler_demo.py full <диалект> # Полная трансформация")
    print("  4. python hybrid_transpiler_demo.py all            # Трансформация во все диалекты")
    print("  5. python hybrid_transpiler_demo.py perf           # Демонстрация производительности")
    print("  6. python hybrid_transpiler_demo.py convert <диалект> # Конвертация и сохранение")
    print("\nДоступные диалекты: postgres, bigquery, snowflake, oracle, mssql, sqlite, redshift")
    
    if len(sys.argv) > 1:
        command = sys.argv[1].lower()
        
        if command == "show":
            show_original_example()
        
        elif command == "compare":
            dialect = sys.argv[2] if len(sys.argv) > 2 else "postgres"
            show_original_example()
            show_transformation_comparison(dialect)
        
        elif command == "full":
            dialect = sys.argv[2] if len(sys.argv) > 2 else "postgres"
            show_full_transformation(dialect)
        
        elif command == "all":
            show_original_example()
            run_all_dialects_demo()
        
        elif command == "perf":
            run_performance_demo()
        
        elif command == "convert":
            if len(sys.argv) > 2:
                dialect = sys.argv[2]
                show_full_transformation(dialect)
            else:
                print("❌ Укажите диалект: python hybrid_transpiler_demo.py convert <диалект>")
        
        else:
            print(f"❌ Неизвестная команда: {command}")
    else:
        print("\n⚠️  Укажите команду. Для справки используйте без аргументов.")

if __name__ == "__main__":
    main()



