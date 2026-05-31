# TheGraphT Security Release Plan (2026-05-29)

## Цель
К дате релиза 2026-05-29 обеспечить:
1. Невозможность чтения содержимого E2E-сообщений сервером и БД-админами.
2. Хранение паролей только в стойких хэшах.
3. Защиту production БД от уничтожения из app-контура.

## Что сделано (2026-05-05)

### 1) Пароли
- Пароли не хранятся в открытом виде.
- В backend внедрён версионированный формат хэша `s2$...` на `scrypt`.
- Добавлена обратная совместимость со старым форматом `<salt>:<hash>`.
- Добавлен `PASSWORD_PEPPER` в конфиг (можно включить отдельно).

Файлы:
- `apps/backend/src/services/auth.js`
- `apps/backend/src/config.js`

### 2) БД hardening
- Владелец БД `thegrapht` переведён на отдельную роль `thegrapht_db_owner`.
- Создана ограниченная app-роль `thegrapht_app` (без SUPERUSER/CREATEDB/CREATEROLE).
- Backend запущен с `POSTGRES_USER=thegrapht_app`.
- Проверено: `thegrapht_app` не может `DROP DATABASE thegrapht`.

### 3) Бэкапы
- Работает полный архивный бэкап в папку `/root/thegrapht zip archives`.
- Именование: `dd mon`, затем `(2)`, `(3)` при повторных запусках в день.
- Автозапуск через systemd timer 2 раза в сутки (mapped к Новосибирску).

### 4) UI fixed overlay (2026-05-07)
- Исправлен баг перекрытия индикатора даты сообщений при активной верхней аудио-плашке.
- Для `chat-scroll-day-indicator` добавлено плавное смещение по `top` вниз при включении плеера и обратно вверх при его закрытии.
- Реализация: CSS-переменная `--chat-day-indicator-top` на уровне `.chat-window` с переключением в состоянии `.audio-top-player-visible`.

Файл:
- `apps/frontend/src/server/page-template.js`

### 5) Context menu hardening in messenger UI (2026-05-07)
- Нативное браузерное контекстное меню отключено во всём workspace мессенджера.
- Исключение оставлено только для поля ввода сообщения `#composer-input`.
- Разрешение нативного меню в `#attachment-modal-caption` убрано.

Файл:
- `apps/frontend/src/server/client/sidebar.js`

### 6) Profile panel side transition (2026-05-07)
- Анимация `User Info` изменена с вертикальной (сверху-вниз) на боковую: панель выезжает справа налево и уезжает обратно вправо.
- При открытии профиля основной чат плавно сдвигается влево через анимированный `padding-right` контейнера `chat-window`.
- На мобильных экранах сохранён full-screen режим профиля без бокового сдвига чата.
- Дополнительно синхронизирован сдвиг правых иконок в верхнем баре (search/call): они двигаются вместе с открытием/закрытием `User Info`.
- Доп. корректировка: в topbar-режиме при `profile-panel-open` сжимается весь header (`chat-island`) по `right: var(--chat-profile-panel-width)`, чтобы иконки не перекрывались панелью и вели себя как в Telegram.

### 7) Frontend runtime stability guard (2026-05-07)
- Устранён runtime-crash `Cannot read properties of null (reading 'addEventListener')` в web-клиенте: обработчики событий в call/search/profile блоках переведены на null-safe привязку.
- Добавлен preflight-контроль в `scripts/deploy-frontend-fast.sh`: деплой теперь блокируется, если критичные frontend-файлы отсутствуют или имеют размер `0 bytes`.
- Цель: не допускать выката повреждённых/обнулённых файлов в production и предотвращать повторный `502`.
- Доп. фикс runtime: восстановлены функции multi-tab ownership (`startPrimaryTabOwnershipHeartbeat`, `refreshPrimaryTabOwnership`, `releasePrimaryTabOwnership`, notification ownership heartbeat), устраняющий `ReferenceError` в `app.js`.
- Усилен anti-corruption guard в `deploy-frontend-fast.sh`:
  - `docker cp` полностью исключён из процесса;
  - перед деплоем сканируются `*.js/*.mjs/*.css/*.html/*.json` на `0 bytes`;
  - при обнаружении `0 bytes` выполняется авто-восстановление из `backups/frontend-src-guard/full/latest`;
  - если после авто-восстановления проблема остаётся — деплой блокируется;
  - перед restart создаётся полный snapshot `apps/frontend/src` + symlink `full/latest`.

Файлы:
- `apps/frontend/src/server/client/media.js`
- `apps/frontend/src/server/client/sidebar.js`
- `scripts/deploy-frontend-fast.sh`

Файлы:
- `apps/frontend/src/server/page-template.js`
- `apps/frontend/src/server/client/media.js`

### 8) Message jump/highlight timing fix (2026-05-07)
- Исправлена логика подсветки при переходе к сообщению (reply/search) в длинных чатах.
- Теперь подсветка запускается только после фактического завершения smooth-scroll (когда позиция стабилизировалась), а не во время «полёта» по чату.
- Длительность подсветки установлена на `2 секунды` для обоих сценариев перехода.

Файлы:
- `apps/frontend/src/server/client/message-actions.js`
- `apps/frontend/src/server/client/search.js`

### 9) Highlight visual polish (2026-05-07)
- Подсветка перехода к сообщению сделана «от края до края» без скруглённых/обрезанных краёв.
- Убрана визуальная «полукруглая» форма у эффекта: полоса теперь ровная по всей ширине.
- Эффект сделан чуть длиннее по времени (`~2.6s`) для более заметного перехода.

Файлы:
- `apps/frontend/src/server/page-template.js`
- `apps/frontend/src/server/client/message-actions.js`
- `apps/frontend/src/server/client/search.js`

### 10) Boot loader UX restore + Material-style loading (2026-05-07)
- Возвращена полная блокирующая инициализация workspace перед входом (без фоновой догрузки критичных данных на старте), чтобы исключить недогруженные элементы после refresh.
- Добавлен полноэкранный preloader перед входом в мессенджер:
  - серый загрузочный экран;
  - белый круговой индикатор;
  - белый линейный индикатор;
  - минимальное время показа `5 секунд`, затем плавный переход в интерфейс.
- Цель: стабильное и визуально предсказуемое открытие web-клиента при перезагрузке страницы.

Файлы:
- `apps/frontend/src/server/page-template.js`
- `apps/frontend/src/server/client/bootstrap.js`
- `apps/frontend/src/server/client/sidebar.js`

### 11) Mobile UX fixes: sidebar/chat transitions + auth scroll + FAB (2026-05-07)
- Исправлено мобильное переключение `sidebar <-> chat`: при открытии диалога на телефоне теперь гарантированно включается `mobile-chat-open` и чат выезжает справа налево; при закрытии/отсутствии диалога возвращается sidebar (обратно слева направо).
- Исправлен mobile-scroll на экране регистрации/логина: страница авторизации на телефонах теперь нормально прокручивается вниз и не обрезается по высоте.
- Исправлен `compose FAB` (кнопка-карандаш) в сайдбаре: устранён уезд/артефакты при мобильном открытом чате; FAB/меню скрываются в состоянии `mobile-chat-open`, чтобы не торчать на слайде.

Файлы:
- `apps/frontend/src/server/client/sidebar.js`
- `apps/frontend/src/server/page-template.js`

### 12) Duplicate photo send guard in web client (2026-05-09)
- Исправлен баг, при котором одно выбранное фото могло отправляться двумя сообщениями.
- Причина: повторный вход в обработчик отправки медиа (двойной клик/повторный триггер события) до завершения первой отправки.
- Фикс: добавлен отдельный single-flight флаг `mediaMessageSendInFlight` для attachment modal отправки, с жесткой блокировкой re-entry до `finally`.
- Результат: в рамках одного действия пользователя отправка медиа теперь выполняется только один раз.

Файлы:
- `apps/frontend/src/server/client/bootstrap.js`
- `apps/frontend/src/server/client/sidebar.js`

### 13) Photo placeholder/broken bubble after send (2026-05-09)
- Исправлен артефакт, когда сразу после отправки фото в чате временно показывался некорректный маленький/битый пузырь.
- Причина: локальный `blob:` URL удалялся раньше, чем происходила визуальная замена local-draft на подтвержденное сервером сообщение.
- Фикс: удаление local-draft (с revoke `blob`) перенесено на этап после append/replace confirmed сообщения.
- Область действия: все чаты, включая `Saved Messages`, direct/private/secret.

Файлы:
- `apps/frontend/src/server/client/media.js`

### 14) Tiny photo squares after Ctrl+Shift+R (2026-05-09)
- Исправлен сценарий, когда после жесткого обновления страницы (`Ctrl+Shift+R`) фотографии сначала отображались маленькими квадратами и только потом принимали нормальный размер.
- Причина: предзагрузка размеров фото запускалась в фоне (`void preload...`) и не завершалась до первого рендера сообщений.
- Фикс: в `loadWorkspace` и `loadDialog` предзагрузка размеров фото переведена в обязательный `await preloadDialogMediaDimensions(...)` перед `renderMessages(...)`.
- Результат: для уже загружаемых сообщений в открываемом чате размер фото стабилен сразу при первой отрисовке.

Файлы:
- `apps/frontend/src/server/client/sidebar.js`

### 15) Targeted backup cut for photo bubble geometry (2026-05-09)
- По запросу без отката всего проекта выполнен точечный перенос рабочего куска из backup `thegrapht_full_backup_20260508_120012.zip`.
- Возвращена логика constrained-размера фото-пузыря: явные `width/height` через `getConstrainedImageSize(...)` для non-album изображений.
- Дополнительно возвращена синхронизация shell-габаритов при `image.onload`, чтобы избежать визуального “схлопывания” до маленького квадрата.
- Область действия: все чаты (`Saved Messages`, direct/private/secret), только web frontend.

Файлы:
- `apps/frontend/src/server/client/media.js`

### 16) Nginx Routing Hardening & Domain Separation (2026-05-18)
- Изолирована маршрутизация на уровне Nginx:
  - Основной домен `thegrapht.su` используется строго для лендинга/ознакомительных страниц.
  - Попытки прямого внешнего обращения к `/api/`, `/ws` и `/mtproto/` на основном домене принудительно возвращают `404 Not Found`.
  - Вся messenger-среда полностью вынесена на выделенный домен `web.thegrapht.su`.
- Для долгоживущих веб-сокетов во время аудио/видео-вызовов выставлены защищенные таймауты: `proxy_read_timeout 3600s` и `proxy_send_timeout 3600s`.

Файлы:
- `infra/nginx/thegrapht.conf`

### 17) Electron Desktop App Preload Security Bridge (2026-05-18)
- При разработке нативного клиента под Electron (`apps/desktop`) полностью соблюдены правила безопасной изоляции контекста:
  - Включен флаг `contextIsolation: true`.
  - Выключен флаг `nodeIntegration: false`.
  - Все операции с нативным окружением (minimize, maximize, close) осуществляются строго через безопасный мост `contextBridge` в `preload.js`.
  - Предотвращены потенциальные риски удаленного выполнения кода (RCE) в десктопном клиенте при рендеринге пользовательских сообщений.

Файлы:
- `apps/desktop/preload.js`
- `apps/desktop/main.js`

## Критичные задачи до 2026-05-29

### A. E2E: довести до модели zero-knowledge
1. Убрать долговременное хранение `privateJwk` в `localStorage`.
2. Перейти на WebCrypto non-extractable private key + защищённое хранилище ключей (IndexedDB + user passphrase wrapping).
3. Сделать forced key rotation + device binding.
4. Добавить protocol versioning для envelopes и migration path.
5. Добавить recovery-процедуру без доступа сервера к plaintext.

### B. MTProto / transport hardening
1. Ввести обязательный protocol envelope для secure-сообщений (version + aad + key id).
2. Подписывать метаданные пакета и проверять replay protection.
3. Жёстко валидировать frame/body limits на gateway.

### C. Production DB safety
1. Полный уход приложения от bootstrap-superuser (`thegrapht`) во всех сервисах/скриптах.
2. Разделить роли:
   - `*_app` (runtime CRUD)
   - `*_migrator` (DDL только при релизе)
   - `*_owner` (NOLOGIN owner)
3. Включить PITR/WAL архивирование на отдельный сторедж.
4. Сделать immutable offsite snapshots.

## Проверки перед релизом
1. `npm run check`
2. `npm run check:docker`
3. frontend smoke
4. auth/login/logout regression
5. e2e send/receive regression
6. backup + restore drill (тестовое восстановление)

## Важный принцип
- Ни команда разработки, ни админы не должны иметь технической возможности читать E2E plaintext из БД.
- Пароли пользователей никогда не должны быть доступны в открытом виде, только сравнение по хэшу.

## Release-Day Lock (важно)
- Старую тестовую БД **НЕ удалять сейчас**.
- Удаление (`drop`) делать только в дату релиза: **2026-05-29**.
- До этой даты держать обе БД:
  - `thegrapht` (текущая тестовая/рабочая)
  - `thegrapht_release_20260529` (новая подготовленная)
- Команда на release day:
  - `bash /root/thegrapht/scripts/release-db-cutover.sh --drop-old --confirm-drop DROP_THEGRAPHT_DB_2026_05_29`

## Текущий статус и план работ (обновлено: 2026-05-06)

### Что делаем сейчас
1. Закрываем E2E-риски на клиенте:
   - выносим приватные ключи из `localStorage`;
   - переходим на non-extractable ключи и безопасное хранение.
2. Доводим DB role-separation до конца:
   - убираем дефолтный runtime-пользователь `thegrapht` из compose/скриптов;
   - фиксируем `*_app` для runtime и `*_migrator` для релизных DDL.
3. Готовим релизный cutover без преждевременного удаления старой БД.

### Что уже подтверждено
- Пароли в plaintext не хранятся, используется `scrypt`-хэширование.
- Выполняется регулярное резервное копирование проекта.
- Команда `DROP DATABASE` разрешена только в окно release day.

## Статус бэкапов проекта

### Активные бэкапы
- Полный архивный бэкап: `/root/thegrapht zip archives`.
- Postgres-бэкапы через `scripts/backup-postgres.sh`.
- Полные backup-процедуры через:
  - `scripts/full-backup-archive.sh`
  - `scripts/full-messenger-backup.sh`

### Операционные правила до релиза 2026-05-29
1. Бэкапы не отключать и не редактировать расписание без отдельного решения.
2. Перед любым рискованным изменением (миграции, cutover, role changes) запускать внеплановый backup.
3. Минимум один тестовый restore drill до release day.
4. Хранить старую и новую БД параллельно до даты cutover.

## Домены и маршрутизация (зафиксировано: 2026-05-06)

- Публичный мессенджер: `https://web.thegrapht.su`
- Публичный сайт/лендинг: `https://thegrapht.su`
- `127.0.0.1:5175`, `127.0.0.1:3001`, `127.0.0.1:3100` — только внутренние bind-адреса контейнеров на сервере.
- Публичный доступ идёт через nginx reverse proxy и TLS.

### Обязательное правило релиза
1. Все продуктовые проверки UI/API/WS выполнять через `https://web.thegrapht.su`, а не через localhost/127.0.0.1.
2. На `thegrapht.su` не открывать runtime-эндпоинты мессенджера (`/api`, `/ws`, `/mtproto`).
3. Перед Go/No-Go дополнительно проверить:
   - `https://web.thegrapht.su/health`
   - login/register/logout на `web.thegrapht.su`
   - отправку сообщений и фото в web-домене

## Оперативный фикс БД (2026-05-06)

1. Миграция `008_add_audio_message_duration.sql` сохранена в репозитории и не удаляется.
2. В PostgreSQL вручную выполнено:
   - `ALTER TABLE messages ADD COLUMN IF NOT EXISTS attachment_duration_seconds INTEGER;`
3. Исправлены права runtime-пользователя:
   - владелец таблицы `messages` переведен на `thegrapht_app`;
   - подтверждено, что `thegrapht_app` может выполнять `ALTER TABLE`.
4. Backend успешно стартует и применяет миграцию `008` без ошибки `42501`.
