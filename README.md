# Football Arena — Frontend

Клиентская часть футбольной игровой платформы (MVP v1.0) по техническому заданию:
React + TypeScript + Vite, тёмная игровая тема, шесть мини-игр, коллекция карточек,
конструктор состава, магазин паков, PvP-комнаты, рейтинги, задания, достижения и
административная панель.

Backend: FastAPI (`/api/v1`), JWT access token + HttpOnly refresh cookie, WebSocket
для PvP-комнат.

## Технологии

| Компонент | Технология |
|---|---|
| Framework | React 19 |
| Language | TypeScript (strict) |
| Build | Vite 7 |
| Routing | React Router 7 (lazy routes) |
| Styling | Tailwind CSS 4 + дизайн-токены |
| State | Zustand (клиентское состояние) |
| Server state | TanStack Query 5 |
| HTTP | Axios (refresh, обработка ошибок) |
| Forms | React Hook Form + Zod |
| Animation | Framer Motion |
| Icons | Lucide React |
| Unit tests | Vitest + React Testing Library |
| E2E | Playwright |

## Быстрый старт

```bash
cd front
npm ci
cp .env.example .env   # Windows: Copy-Item .env.example .env
npm run dev
```

Приложение: http://localhost:5173

### Переменные окружения

```env
# Прямой адрес backend вместе с /api/v1
VITE_API_URL=http://localhost:8000/api/v1

# Необязательно: базовый URL WebSocket
# VITE_WS_URL=ws://localhost:8000/api/v1
```

Если `VITE_API_URL` не задан, используется `/api/v1` и dev-proxy Vite на
`http://localhost:8000` (включая WebSocket). Backend должен разрешать CORS для
`http://localhost:5173` и принимать cookies (`withCredentials: true`).

### Требования к backend

- `CORS_ORIGINS=http://localhost:5173`
- `EXPOSE_AUTH_TOKENS=true` в development — упрощает восстановление пароля.
- Сиды: `python -m scripts.seed_games`, `seed_packs`, `seed_players`,
  `seed_quests`, `seed_achievements`, `seed_season`, `seed_admin`.

## Скрипты

```bash
npm run dev        # dev-сервер Vite
npm run build      # typecheck + production build
npm run preview    # просмотр production-сборки
npm run typecheck  # tsc --noEmit
npm run test       # Vitest в watch-режиме
npm run test:run   # однократный прогон unit-тестов
npm run e2e        # Playwright (нужен установленный chromium)
```

Установка браузера Playwright: `npx playwright install chromium`.

## Структура проекта

```text
front/
├── public/
│   └── favicon.svg
├── src/
│   ├── app/                 # App, providers, router
│   ├── components/
│   │   ├── cards/           # PlayerCard, нормализация карточек
│   │   ├── economy/         # CoinBalance, XPProgress, RatingBadge
│   │   ├── feedback/        # LoadingScreen, ErrorBoundary
│   │   ├── games/           # GameShell, GameTimer, ResultPanel, HintGame
│   │   ├── layout/          # Sidebar, Header, MobileNav, AuthLayout, guards
│   │   └── ui/              # Button, Input, Modal, Tabs, Toast, Pagination...
│   ├── constants/           # каталог игр, PvP-режимы, подписи
│   ├── hooks/               # useMe, useMiniGame, useCountdown, useDebouncedValue
│   ├── pages/               # публичные, игровые, клуб, магазин, PvP, профиль
│   │   └── admin/           # административные страницы
│   ├── services/            # типизированный слой API по модулям
│   ├── stores/              # auth, wallet, game, pvp, ui, notifications
│   ├── styles/              # дизайн-токены и глобальные стили
│   ├── types/               # контракты backend API
│   └── utils/               # форматирование, ошибки, редкости, cn
├── tests/
│   ├── unit/                # Vitest + RTL
│   └── e2e/                 # Playwright
├── Dockerfile
├── nginx.conf
├── playwright.config.ts
├── vite.config.ts
└── package.json
```

## Маршруты

Публичные:

- `/` — лендинг
- `/login`, `/register`, `/forgot-password`
- `*` — 404

Авторизованные (`/app`):

- `/app/dashboard`
- `/app/games`, `/app/games/draft`, `guess-player`, `penalty`, `tiki-taka`,
  `higher-lower`, `mystery-player`
- `/app/competitions`, `quick-match`, `rooms`, `rooms/:roomId`, `match/:matchId`
- `/app/club/collection`, `club/squad`, `club/cards/:userCardId`
- `/app/shop/packs`, `shop/opening/:packId`
- `/app/leaderboard`, `/app/quests`, `/app/achievements`, `/app/profile`

Административные (`/admin`, только role `admin`/`superadmin`):

- `/admin` — dashboard и аналитика
- `/admin/users`, `players`, `cards`, `packs`, `games`, `questions`
- `/admin/economy`, `ratings`, `matches`, `logs`

## Интеграция с API

- Единый Axios-клиент (`src/services/api.ts`):
  - `Authorization: Bearer <access_token>`;
  - refresh через HttpOnly cookie и очередь одного refresh-запроса;
  - автоматический retry исходного запроса после refresh;
  - нормализация ошибок backend `{ success: false, error: { code, message } }`;
  - таймаут 15 секунд.
- Access token хранится в Zustand + localStorage; refresh token — только в
  HttpOnly cookie. «Запомнить вход» выключено — сессия живёт до закрытия вкладки.
- TanStack Query используется для серверных данных; после игровых действий,
  паков и заданий инвалидируются `me`, `leaderboard`, `quests`, `achievements`,
  `economy`.
- WebSocket PvP: `/api/v1/ws/pvp/{room_id}?token=<access_token>`; клиент
  отправляет `{ type: "submit", payload }`, обрабатывает `match_start`,
  `state`, `round_result`, `match_finished`, отключения соперника и делает
  автоматический reconnect.

## Игровая логика

Все результаты, награды, баланс, рейтинг, редкости паков и проверка ответов
выполняются на сервере. Клиент только отображает состояние сессии и отправляет
пользовательские действия:

| Игра | Код | Действия |
|---|---|---|
| Draft Challenge | `draft` | `pick` |
| Guess the Player | `guess_player` | `reveal_hint`, `answer` |
| Penalty Shootout | `penalty` | `shoot` |
| Tiki-Taka-Toe | `tiki_taka_toe` | `place` |
| Higher or Lower | `higher_lower` | `guess` |
| Mystery Player | `mystery_player` | `reveal_hint`, `answer` |

Активная игровая сессия сохраняется в `sessionStorage` (`gameStore`) и
восстанавливается после перезагрузки. Backend не отдаёт отдельный GET сессии,
поэтому состояние восстанавливается из последнего ответа сервера; при истечении
сессии показывается стартовый экран.

## Безопасность и UX

- Защищённые маршруты и ролевые guard-компоненты (`RequireAuth`, `RequireAdmin`).
- Loading / Empty / Error / Disabled состояния на всех страницах.
- Глобальные toast-уведомления, подтверждения удаления состава.
- Адаптивность: sidebar на desktop, нижняя навигация и drawer на mobile.
- `prefers-reduced-motion` отключает анимации.
- Lazy loading страниц, code splitting vendor-чанков, кэширование статики
  nginx.

## Тестирование

Unit:

```bash
npm run test:run
```

Покрыты форматирование, редкости, кнопка, карточка игрока и построение query.

E2E:

```bash
npx playwright install chromium
npm run e2e
```

- `public.spec.ts` проверяет лендинг, валидацию входа и 404 без backend.
- `authenticated.spec.ts` регистрирует тестового пользователя, проходит Dashboard,
  запускает Penalty, открывает пак, открывает коллекцию, рейтинг, задания и
  выполняет выход.
- `games.spec.ts` проходит Draft (5 выборов), Guess the Player, Mystery Player,
  Higher or Lower, Tiki-Taka-Toe, создаёт состав и PvP-комнату.
- `squad.spec.ts` создаёт состав и добавляет карточку на позицию.
- `pvp.spec.ts` играет полный PvP-матч Penalty между двумя браузерными
  контекстами через WebSocket.

Интеграционные E2E используют реальный backend на `http://localhost:8000` и
создают тестовые аккаунты, паки, составы и комнаты в dev-базе. Если backend
недоступен, они автоматически помечаются как skipped.

## Docker

```bash
docker build -t football-front \
  --build-arg VITE_API_URL=http://localhost:8000/api/v1 .
docker run --rm -p 8080:80 football-front
```

Или через общий `docker-compose` backend-проекта, добавив сервис `frontend` на
базе этого Dockerfile. Nginx раздаёт SPA с fallback на `index.html`,
gzip и immutable-кэшированием `/assets/`.

## Ограничения текущего backend API

- Нет административного эндпоинта списка матчей — страница `/admin/matches`
  показывает сводную статистику и ссылки на журналы.
- Нет GET игровой сессии — восстановление после перезагрузки возможно только
  из сохранённого состояния (sessionStorage).
- История профиля использует `/economy/transactions`, так как отдельного
  эндпоинта истории игр нет.
- Загрузка изображений реализована через URL; файлового upload-эндпоинта в API
  нет.
- Отдельная страница чужого профиля не добавлена: публичный эндпоинт принимает
  UUID пользователя, а таблицы лидеров возвращают только username.
