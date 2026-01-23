FSD (Feature-Sliced Design) - Краткие правила

1. 7 слоев (от низкого к высокому уровню)
   1. shared/      ← Базовые переиспользуемые элементы
   2. providers/   ← Используется для контекстов, провайдеров состояния, DI контейнеров
   3. entities/    ← Бизнес-сущности (данные)
   4. features/    ← Бизнес-фичи (UI + логика)
   5. widgets/     ← Независимые составные компоненты
   6. pages/       ← Страницы (в Next.js → app/)
   7. processes/   ← Сложные кросс-фичевые процессы
   8. app/ 
 
    
2. Ключевые принципы
   A. Однонаправленные зависимости:
     Можно импортировать только из нижележащих слоев →
     shared → entities → features → widgets → pages → processes → app
     НИКОГДА НЕ 
     
   Б. Изоляция:
    Каждый слой не знает о существовании вышележащих
    Каждый модуль самодостаточен
    Минимум общих зависимостей

3. providers/ - "Провайдеры и контексты" (опциональный слой)
   МОЖНО:
   React Context провайдеры
   - DI контейнеры
   - Провайдеры состояния (Redux, Zustand, Mobx)
   - Theme, Auth, i18n провайдеры
   - Глобальные конфигурации

   НЕЛЬЗЯ:
   - Бизнес-логику (только предоставление зависимостей)
   - UI компоненты (только обертки-провайдеры)
   - для фич логику
   Пример структуры:
   providers/
   ├── theme/
   │   ├── ThemeProvider.tsx
   │   └── useTheme.ts
   ├── auth/
   │   ├── AuthProvider.tsx
   │   └── useAuth.ts
   └── store/
       ├── StoreProvider.tsx
       └── store.ts
   
4. Что в каком слое
   shared/ - "Фундамент"
   МОЖНО:
   - UI компоненты (Button, Input, Modal)
   - Утилиты (formatDate, debounce)
   - Хуки (useLocalStorage, useMediaQuery)
   - Константы, конфиги
   - Типы, не привязанные к бизнесу

    НЕЛЬЗЯ:
   - Бизнес-логику
   - Состояние приложения
   - API вызовы

    entities/ - "Данные"
    МОЖНО:
    - Модели данных (User, Product)
    - API для работы с сущностями
    - Store/состояние сущности
    - Валидаторы, мапперы

    НЕЛЬЗЯ:
    - UI компоненты
    - Бизнес-процессы
    - Навигацию

    features/ - "Бизнес-фичи"
    МОЖНО:
    - Полные бизнес-модули с UI
    - Состояние фичи
    - API вызовы для фичи
    - Логику работы фичи

    НЕЛЬЗЯ:
    - Импортировать другие фичи напрямую
    - Зависеть от конкретной страницы

    widgets/ - "Переиспользуемые блоки"
    МОЖНО:
    - Составные UI компоненты
    - Минимальную логику отображения
    - Пропсы для кастомизации

    НЕЛЬЗЯ:
    - Бизнес-логику (только UI логику)
    - Состояние приложения
    - Зависимости от фич

    pages/ (в Next.js app/) - "Страницы"
    МОЖНО:
    - Композицию фич и виджетов
    - Маршрутизацию (Next.js)
    - Layout страницы
    - Получение данных для страницы

    НЕЛЬЗЯ:
    - Бизнес-логику (делегировать фичам)
    - Сложную UI логику

    processes/ - "Сложные процессы"
    МОЖНО:
    - Координацию нескольких фич
    - Сложные workflow
    - Управление состоянием процессов

    НЕЛЬЗЯ:
    - UI компоненты (только логика)
    - Заменять фичи

5. Правила импортов

   ПРАВИЛЬНО (снизу вверх):
   import { Button } from 'shared/ui';          // shared → feature
   import { User } from 'entities/user';        // entities → feature
   import { formatDate } from 'shared/lib';     // shared → page

   НЕПРАВИЛЬНО (обратные импорты):
   import { SomeFeature } from 'features/...';  // ← feature → shared (НЕТ!)
   import { PageComponent } from 'pages/...';   // ← page → feature (НЕТ!)

6. Примеры для вашего проекта
    Ваш SQLFileManager - feature (правильно!):
    typescript
    // features/SQLFileManager/
    import { Button } from 'shared/ui';                    //  shared → feature
    import { DIALECTS } from 'shared/lib/dialects';        //  shared → feature
    import { DialectComparisonView } from 'widgets/...';   //  widget → feature
    // import { SomePage } from 'app/...';                 //  page → feature (НЕТ!)
    DialectComparisonView - widget (правильно!):
    typescript
    // widgets/dialect-comparison/
    import { Card } from 'shared/ui';                      //  shared → widget
    // import { SQLFileManager } from 'features/...';      //  feature → widget (НЕТ!)
    Shared элементы:
    typescript
    // shared/lib/analysis.ts - чистые функции
    export function findDialectSpecificChanges() { /* ... */ }

   // shared/ui/Button.tsx - UI компонент
   export const Button = ({ children, onClick }) => { /* ... */ }

7. Чек-лист для проверки
   Это Feature если:
   Реализует конкретную бизнес-функцию

   Имеет собственный UI

   Содержит бизнес-логику

   Может быть переиспользован

   Пример: SQLFileManager

   Это Widget если:
   Переиспользуемый UI компонент

   Независим от бизнес-логики

   Принимает пропсы для кастомизации

   Пример: Header, Footer, Navbar, SideBar, ProductCard, Modal

   Это Entity если:
   Описывает бизнес-сущность

   Чистые данные (модели)

   Используется разными фичами

   Пример: User, Product

   Это Shared если:
   Переиспользуется везде

   Не содержит бизнес-логику

   Максимально абстрактный

   Пример: Button, Input, formatDate, API клиент

8. Золотые правила FSD
   Однонаправленность зависимостей - только снизу вверх

   Изоляция модулей - каждый самодостаточен

   Бизнес-логика только в features/entities

   UI логика только в widgets/shared

   Страницы только собирают фичи и виджеты

   Shared - максимально переиспользуемый

   Не создавать циклических зависимостей

9. Как определить куда поместить?
   javascript
   // ВОПРОС 1: Есть ли бизнес-логика?
   // ДА → ВОПРОС 2: НЕТ → ВОПРОС 3

   // ВОПРОС 2: Это фундаментальная сущность?
   // ДА → entities/ : НЕТ → features/

   // ВОПРОС 3: Переиспользуется в разных местах?
   // ДА → widgets/ : НЕТ → Оставить в текущем слое

   // ВОПРОС 4: Абстрактный/базовый элемент?
   // ДА → shared/ : НЕТ → Текущий слой

10. Преимущества для стартапа
   Быстрый старт: Начать с features + widgets + shared

   Легкое масштабирование: Добавлять слои по мере роста

   Четкое разделение: Разные разработчики = разные слои

   Тестируемость: Каждый слой тестируется независимо

   Рефакторинг: Легко перекладывать между слоями
