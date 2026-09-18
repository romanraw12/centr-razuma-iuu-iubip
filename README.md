# Центр разума ЮУ ИУБиП

Электронная библиотека образовательной литературы ЮУ ИУБиП: учебные пособия и
конспекты по четырём направлениям подготовки плюс герои-ассистенты, которые
объясняют раздел по шагам и проводят тест с разбором ошибок.

## Разделы

- Туризм и гостеприимство
- Юриспруденция
- Экономика и управление
- Фармация и сестринское дело

## Герои-ассистенты

| Герой | Раздел | Фигура |
|---|---|---|
| Адам | Юриспруденция | рыцарь (`adam-knight`) |
| Николь | Туризм и гостеприимство | ковёр-самолёт (`chr-carpet`) |
| Кейн | Фармация и сестринское дело | чародей с колпаком и флаконом (`chr-hat`, `chr-flask`) |
| Бани | Экономика и управление | эльф (`chr-ear`) |

Панель героев открывается плавающей кнопкой «Спросить Адама»: вкладка
«Объяснение» (пошаговый разбор с озвучкой) и «Тест» (вопросы с разбором и итогом).

## Страницы

| Маршрут | Назначение | Раскладка |
|---|---|---|
| `/` | каталог: поиск и фильтры по разделам | default |
| `/book/:id` | карточка издания | default |
| `/read/:id` | режим чтения (шрифт, скорость речи, громкость) | bare |
| `/editor`, `/editor/:id` | добавление и правка издания (нужен вход) | default |
| `/login`, `/signup` | вход и регистрация | bare |
| `*` | страница 404 | default |

## Стек

- React 18 + TypeScript 5, сборка Vite 6
- Tailwind CSS **v4** через `@tailwindcss/vite` (`@config` читает `tailwind.config.ts`)
- shadcn/ui на Radix (`src/components/ui`)
- `react-router-dom` 6, `lucide-react`, `sonner`, `react-hook-form` + `zod`
- `@supabase/supabase-js` — авторизация и данные

## Запуск

```bash
npm install
npm run dev      # http://localhost:5173/preview/
npm run build    # tsc && vite build
npm run preview
```

> **Почему `/preview/`.** `src/main.tsx` берёт basename из тега `<base>` (его
> инжектит билдер Wuna), а без тега использует запасной `/preview`. Чтобы
> открыть приложение с корня, добавьте в `index.html` в `<head>` строку
> `<base href="/preview/">` — либо откройте адрес `/preview/` как есть.

## Конфигурация рантайма

Настройки приходят не из `import.meta.env`, а из `window.__APP_CONFIG__`
(`apiUrl`, `projectId`, `apiToken`, `siteName`, `supabase.url/publishableKey/schema`).

Для локальной работы:

1. `copy public/config.example.js public/config.js`
2. заполните значения (ключи — в кабинете Wuna и в собранном `index.html`)
3. добавьте в `index.html` перед `</body>`: `<script src="/config.js"></script>`

`public/config.js` и папка `_build/` указаны в `.gitignore` — токены в репозиторий
не попадают. Без конфига сайт работает как каталог: авторизация и хранилище
отключаются с понятным сообщением.

## Структура

```
src/
├── main.tsx            точка входа: initSupabase() → BrowserRouter → App
├── App.tsx             ThemeProvider + маршруты из routes.tsx + Toaster + герои
├── routes.tsx          конфиг маршрутов (label, showInNav, layout)
├── types.ts            SystemConfig, AuthUser, SupabaseClientConfig
├── index.css           тема Tailwind v4 и токены
├── custom.css          чёрно-золотая .dark, утилиты анимаций, фигуры героев
├── fonts.css           переменные гарнитур (Geist + Literata)
├── components/         Layout, Navigation, Footer, ErrorBoundary, AdamAssistant…
│   └── ui/             shadcn-примитивы
├── hooks/              useAuth, useTheme, useData, usePageMeta, useSupabaseTable…
├── lib/                supabase, characters, libraryData, adamKnowledge, heroSounds
└── pages/              Home, Book, Reader, PostEditor, Login, Signup, NotFound
```

## Индексация и AI-системы

`public/robots.txt` разрешает обход и явно перечисляет AI-краулеры,
`public/llms.txt` описывает разделы, героев и маршруты для AI-поиска.

## Статус проекта

Проект собран из выгрузки платформы Wuna. Часть файлов восстановлена по
контрактам из рабочей сборки и помечена в коде комментарием
`ВОССТАНОВЛЕНО`/`ЧЕРНОВИК` — их стоит заменить оригиналами из вкладки «Код»:
`src/index.css`, `src/custom.css`, `src/App.tsx`, `src/lib/adamKnowledge.ts`,
фигуры героев `chr-*`, а также страницы и `ui/*`, не попавшие в выгрузку.
