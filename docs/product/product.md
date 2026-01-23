Текущее состояние (MVP)
TypeSQL Converter - это инструмент для конвертации SQL между различными диалектами баз данных с интуитивным интерфейсом сравнения изменений.

  ЦЕЛЬ: Стать универсальной платформой для работы с SQL
├── Конвертация между диалектами
├── Оптимизация запросов
├── Анализ и визуализация
├── Тестирование SQL
├── Безопасность и аудит
└── AI-ассистент для SQL

Новые разделы Navigation/Sidebar

Будущая структура навигации:

SQL CONVERTER PLATFORM
├── Converter (текущий)
│   ├── Simple converter
│   ├── File converter
│   └── Batch processing
│
├── Optimizer (НОВЫЙ)
│   ├── Query optimization
│   ├── Explain plans
│   ├── Index advisor
│   └── Performance tuning
│
├── Analyzer (НОВЫЙ)
│   ├── Code analysis
│   ├── Security audit
│   ├── Best practices
│   └── Complexity metrics
│
├── Tester (НОВЫЙ)
│   ├── Test data generator
│   ├── SQL unit tests
│   ├── Migration testing
│   └── CI/CD pipelines
│
├── Analytics (НОВЫЙ)
│   ├── Query visualization
│   ├── Usage analytics
│   ├── Performance insights
│   └── Custom reports
│
├── Teams (НОВЫЙ)
│   ├── Workspaces
│   ├── Shared projects
│   ├── Code review
│   └── Access management
│
└── Settings
    ├── Profile
    ├── Notifications
    ├── API keys
    └── Billing

app/
├── (main)/                        # Основной layout
│   ├── page.tsx                   # Главная страница
│   └── layout.tsx                 # Основной layout с провайдерами
│
├── i18n/                          # Модуль интернационализации (FSD feature-slice)
│   ├── config/
│   │   ├── i18n.config.ts         # Конфигурация i18next
│   │   ├── supported-locales.ts   # Поддерживаемые языки (en, ru, zh, etc.)
│   │   └── default-namespaces.ts  # Дефолтные неймспейсы
│   │
│   ├── locales/                   # Локализации (JSON файлы по языкам)
│   │   ├── en/                    # Английский
│   │   │   ├── common.json        # Общие фразы
│   │   │   ├── ui.json            # UI элементы
│   │   │   ├── errors.json        # Ошибки
│   │   │   ├── sql-dialects.json  # Описания диалектов SQL
│   │   │   ├── features.json      # Описания фич
│   │   │   └── navigation.json    # Навигация
│   │   │
│   │   ├── ru/                    # Русский
│   │   │   ├── common.json
│   │   │   └── ... (аналогично en)
│   │   │
│   │   ├── ch/                    # Китайский
│   │   │   └── ... (аналогично en)
│   │   │
│   │   └── index.ts               # Экспорт всех локалей
│   │
│   ├── hooks/                     # Кастомные хуки i18n
│   │   ├── useTranslation.ts      // Хук с типизацией
│   │   ├── useLanguageSwitcher.ts // Хук переключения языка
│   │   └── useCurrentLanguage.ts  // Хук текущего языка
│   │
│   ├── components/                # Компоненты i18n
│   │   ├── LanguageSwitcher/      // Компонент переключения языка
│   │   │   ├── ui/
│   │   │   │   ├── LanguageSwitcher.tsx
│   │   │   │   └── LanguageSwitcher.module.css
│   │   │   ├── model/             // Логика компонента
│   │   │   └── index.ts           // Экспорт
│   │   │
│   │   └── TranslatedText/        // Компонент для сложных переводов
│   │
│   ├── lib/                       // Утилиты и хелперы
│   │   ├── i18n-init.server.ts    // Инициализация на сервере
│   │   ├── i18n-init.client.ts    // Инициализация на клиенте
│   │   ├── language-detector.ts   // Детектор языка
│   │   └── translation-utils.ts   // Утилиты перевода
│   │
│   ├── types/                     // Типы TypeScript
│   │   ├── i18n.types.ts          // Основные типы i18n
│   │   └── namespaces.types.ts    // Типы для неймспейсов
│   │
│   └── index.ts                   // Public API модуля
│
├── providers/                     # Провайдеры приложения (FSD shared)
│   ├── i18n-provider/             // Провайдер i18n
│   │   ├── lib/
│   │   │   ├── I18nProvider.tsx   // Компонент провайдера
│   │   │   └── with-i18n.tsx      // HOC для i18n
│   │   └── index.ts
│   │
│   ├── theme-provider/            // Провайдер темы
│   │   └── ...
│   │
│   ├── query-provider/            // React Query провайдер
│   │   └── ...
│   │
│   └── index.ts                   // Объединение всех провайдеров
│
├── features/                      // Фичи приложения (FSD features)
│   ├── sql-converter/            // SQL транспилятор
│   │   ├── ...               
│   │   └── index.ts               // Public API фичи
│   │
│   ├── sql-analyzer/              // Анализатор SQL
│   │   └── ...
│   │
│   └── ...
│
├── widgets/                       // Виджеты (FSD widgets)
│   ├── header/                    // Хедер с LanguageSwitcher
│   └── sidebar/                   // Боковая панель
│   
│
└── shared/                        // Общие ресурсы (FSD shared)
    ├── ui/                        // UI компоненты
    │   ├── button/
    │   ├── input/
    │   ├── select/
    │   └── ...
    │
    ├── lib/                       // Общие утилиты
    │   ├── api/                   // API клиент
    │   ├── constants/             // Константы
    │   └── utils/                 // Утилиты
    │
    ├── types/                     // Общие типы
    │   └── global.d.ts            // Глобальные типы
    │
    └── config/                    // Общие конфиги
       └── app.config.ts          // Конфиг приложения


1. После конвертации добавляется в новом sql файле Имя файла + FromFirstDialectToSecondDialect.sql
2. После оптимизации  добавляется в новом sql файле Имя файла + Optimized.sql
3. i18next - это фреймворк интернационализации текста
