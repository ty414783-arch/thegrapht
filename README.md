# TheGraphT

TheGraphT is the foundation of a serious Telegram-style messenger platform.

Current repository layout:

- `apps/backend`: modular monolith application core for auth, dialogs, messages, realtime, and health checks
- `apps/frontend`: UI/static web client service
- `apps/mtproto`: MTProto transport service foundation
- `infra/gateway`: reserved reverse proxy config for future domain routing
- `docker-compose.yml`: local orchestration for frontend, backend, and MTProto services

## Planned product areas

- user accounts and sessions
- private chats
- groups and channels
- secret chats
- MTProto transport
- media pipeline
- notifications
- moderation and administration

## Quick start

1. Generate a local `.env` once with `./scripts/generate-env.sh`, or fill `.env` manually from `.env.example`.
2. Run `docker compose up --build`
3. Open `http://localhost:5175`

The backend now keeps app startup separate from DB lifecycle:

- `npm --workspace apps/backend run migrate`
- `npm --workspace apps/backend run seed`

For local Docker, `docker-compose.yml` is self-contained: it brings up PostgreSQL, runs backend migrations/seeding on boot, and exposes the frontend at `http://localhost:5175`, backend API at `http://localhost:3001`, and MTProto transport at `http://localhost:3100`.

## Checks

- Canonical local check: `npm run check`
- Backend test Docker target: `npm run check:docker`
- Frontend generated-client syntax only: `npm --workspace apps/frontend run check:generated-client`
- Frontend template/unit checks: `npm --workspace apps/frontend run test:unit`
- Frontend smoke tests: `npm --workspace apps/frontend run test:smoke` after starting the frontend and installing Playwright browsers.
- MTProto end-to-end transport checks: `npm --workspace apps/mtproto test`

## Security baseline

- `JWT_SECRET` and `POSTGRES_PASSWORD` are required from `.env`; there are no baked-in fallback secrets in runtime config.
- Backend uses `pg` parameterized queries, `HttpOnly` session cookies, strict CORS allowlist, origin checks for mutating requests, request validation via `zod`, rate limiting for auth/search/messages, and typed realtime event contracts.
- System/demo data is seeded through a non-loginable system account, not through a public founder password.
- PostgreSQL stays internal to Docker and is not exposed on the host network.

## Operations

- Daily backup entrypoint: `./scripts/backup-postgres.sh`
- CI build-check: `.github/workflows/docker-build.yml`
- HTTPS reverse proxy config for `thegrapht.su`: `infra/nginx/thegrapht.conf`

## Repository analysis (2026-05-09)

- Runtime is Docker-based and centered on `docker-compose.yml`.
- Active services in compose: `postgres`, `frontend`, `backend`, `mtproto`, `turn`.
- Public web messenger target is `https://web.thegrapht.su` (same-origin API/WS routing through nginx).
- Core app code is split into:
  - `apps/backend` (API/auth/dialogs/messages/realtime)
  - `apps/frontend` (web UI + server-rendered assets/routes)
  - `apps/mtproto` (transport foundation/status service)
- Operations and recovery assets exist in:
  - `scripts/` (deploy/backup automation)
  - `backups/` and `/root/thegrapht zip archives` (project and DB backup snapshots)
  - `security-audit/local` (local white-hat harness + report)

## Markdown map

- `README.md`: architecture, day-0 runbook, and GitHub repository workflow.
- `RELEASE_2026-05-29.md`: release gates and deployment checklist.
- `SECURITY_RELEASE_PLAN_2026-05-29.md`: security hardening scope and release-day DB cutover rules.
- `HANDOVER_2026-05-04.md`: operational handover details and incident context.
- `SECURITY_AUDIT.md`: baseline threat model and remediation summary.

## Notes

This is the first serious foundation, not the full Telegram clone yet. The stack now runs as a modular monolith around the backend app core. MTProto is explicitly a foundation/status service today, not a production MTProto-compatible transport.

## Product roadmap

The most pragmatic next steps for TheGraphT are:

- stabilize public web auth on `https://web.thegrapht.su` with strict same-origin API and WebSocket routing
- finish production deployment checks for frontend, backend, `/api`, `/ws`, cookies, TLS, and reverse proxy behavior
- remove unnecessary browser permission prompts and request access only after explicit user actions
- add password recovery and account management flows
- harden session lifecycle, logout-all-devices, and device/session visibility
- complete message reliability features: retries, drafts, better upload recovery, and clearer delivery states
- improve dialogs UX: pagination, unread counters, search quality, and better empty/error states
- finish media pipeline hardening: previews, limits, cleanup jobs, and quota controls
- unify web and Android feature parity instead of keeping Android as a legacy/plaintext path
- complete secure direct chat implementation end-to-end, including client decrypt UX, key rotation, and clear product wording
- decide whether MTProto remains a long-term protocol direction or stays an internal transport foundation
- add observability: structured production logs, health dashboards, alerting, and deploy smoke checks

## Immediate priorities

Critical work that should be done before wider rollout:

- verify that public `web.thegrapht.su` never points the client to `localhost` or `127.0.0.1`
- guarantee that login, register, and realtime work through the public domain without custom browser setup
- stop requesting notification or device-related permissions before the user explicitly uses those features
- rewrite public FAQ and product copy so it matches the real maturity of the project
- expand deployment validation for nginx, cookies, CORS/origin checks, and websocket upgrades

## Recent Fixes
- **2026-05-08**: Fixed the "infinite bootstrap loop" bug ensuring stable application initialization without infinite reload cycles.
- **2026-05-09**: Removed the false skeleton loader from the message list for a cleaner loading state.
- **2026-05-09**: Added a Google-like circular spinner while loading chat messages.
- **2026-05-09**: Improved image loading behavior by setting a larger default size and using `height: auto` to prevent layout shifts.
- **2026-05-09**: Fixed a bug where a large gap remained below loaded photos by making `min-height` conditional on the `.loaded` class.
- **2026-05-09**: Fixed album display issues by restoring `height: 100%` for images in albums and splitting large albums into chunks of 5 photos.
- **2026-05-09**: Fixed scroll jump bug when deleting messages by respecting `restoreScrollTop` option in `renderMessages`.
- **2026-05-09**: Completely removed the gap bug below photos by restoring `height: 100%` for all message images and using `object-fit: cover`.
- **2026-05-09**: Limited the maximum height of message images to 500px to prevent overly tall vertical photos from filling the screen.
- **2026-05-09**: Narrowed the default width of message images from 350px to 320px for a more compact look.
- **2026-05-09**: Increased backend message limit from 50 to 500 in `getMessagesForDialog` to show older messages that "disappeared".
- **2026-05-09**: Implemented infinite scroll (pagination) for older messages on scroll up, using the circular spinner.
- **2026-05-09**: Rewritten the compose button from scratch as `static-compose-btn`. Removed all transforms, hover shifts, and active scales to make it completely stationary. Kept the menu functionality.
- **2026-05-09**: Implemented `New Group -> Add Members` overlay sidebar in web client. The panel now slides over the left sidebar, shows real direct-chat users with avatars and current subtitle/last-seen text, supports member selection with top selected chips, and closes independently on `Esc` (right-to-left close animation) without closing the main chat.
- **2026-05-09**: Implemented `New Group` step-2 UI flow (without backend create): when at least one member is selected, a floating `Next` arrow opens a second panel with group photo upload, auto-generated editable group name (`You & Name & ...`), selected members summary with avatars and statuses, and member limit guard (`20000`).
- **2026-05-09**: Unified avatars in `New Group -> Add Members`: selected chips above the search field now use the same avatar renderer as the member list (photo when available, generated letter fallback otherwise). Added smooth pop-in animation for newly selected circular avatars.
- **2026-05-09**: Replaced mocked group creation with real backend flow: added `POST /api/v1/dialogs/group`, switched web `New Group` submit to real API create, and removed numeric-id fake group fallback in dialog loader. Also fixed route parsing so `/g/<publicId>` resolves correctly to the actual dialog public id.
- **2026-05-09**: Hardened Group Info UI and data model: backend now returns real `groupMembers` metadata (role, username, last seen) for group dialogs; web profile panel now renders actual member list (owner/admin/member) with English online/last-seen statuses, removes obsolete `Username` and `Actions/Delete Group` cards for groups, and uses normalized subtitle format `Group • N members • M online`.
- **2026-05-09**: Improved browser notifications for group chats: notification title now uses group name (and group avatar when available), while message body uses messenger-style format `Sender: text` with content-aware labels (`Photo`, `Audio`, `replied to a message`) matching normal chat previews.
- **2026-05-09**: Fixed group creation realtime consistency: new groups now appear immediately in sidebar without reload for creator and invited members, route opens directly as `/g/<publicId>` (no transient `/-100...` loader loop), and invited users receive system browser notification `You were added to group <name>`. Group avatar from create flow is now persisted and rendered in chat/header/notifications when provided.
- **2026-05-09**: Fixed group online counters and profile controls: group online count now correctly includes the current user and all online members; group profile card now uses `Group link` label; notifications control is upgraded to a Telegram-like switch with per-group persisted state (default off for new groups) and smooth toggle animation.
- **2026-05-10**: Refined group incoming message UX in chat: removed extra left indent for consecutive messages without avatar, improved sender-name readability with softer per-user colors, and aligned avatar/name flow for clearer multi-user group threads.
- **2026-05-10**: Updated group incoming readability again: sender name is now shown on every incoming group bubble, and incoming group rows are shifted closer to the left edge for denser Telegram-like alignment.
- **2026-05-10**: Added realtime reliability hardening for dialogs: client now runs periodic and reconnect-triggered message reconciliation against server history to auto-recover missed WS deliveries (text, photo, audio) and keep chat state consistent after tab switches/reconnects.
- **2026-05-10**: Fixed message flicker/regression during reconciliation: dialog resync now uses non-destructive merge (current UI messages + server canonical updates) instead of replacing with server slice only, preventing "message disappeared then came back" across direct and group chats.
- **2026-05-10**: Composer UX fixes: switched chat composer to multiline textarea with smooth auto-grow on Shift+Enter (up to capped height), fixed reply-chip clearing immediately after send, and relaxed incoming/group bubble width constraints to reduce aggressive line wrapping on receiver side.
- **2026-05-10**: Follow-up chat UI polish: normalized group incoming bubble geometry to prevent overly narrow stacked text, aligned composer placeholder baseline, removed excessive side insets in composer width, and added custom scrollbar styling for expanded multiline composer.
- **2026-05-10**: Fixed realtime delete race: message removal now rerenders immediately (no delayed ghost node), duplicate delete requests for the same message are blocked client-side, and `message not found` on delete is treated as already deleted with instant local reconciliation.
- **2026-05-10**: Hardened delete consistency further with deleted-message tombstones (WS/resync/filter guards) to prevent deleted messages from reappearing; restored smooth collapse animation on delete; tuned composer width and moved send button closer to input.
- **2026-05-10**: Tuned send UX: text send sound now plays immediately on local send action (not on backend ack), and composer send button was shifted further left toward the input for tighter alignment.
- **2026-05-10**: Fixed composer send button layout without transform hacks: removed auto margin from the input stack and made the send button position stable across inactive, active, and pressed states.
- **2026-05-10**: Group UX and navigation pass: incoming realtime messages in open group chats now force bottom anchoring (even when previously scrolled up), dialog position restore is now session-aware (first open -> bottom, revisits before hard refresh -> previous scroll position), group member rows support Telegram-like right-click context action `Send Message` with same-target toggle close behavior, and clicking group member avatars (profile list and incoming message avatars) opens the corresponding direct chat with profile panel.
- **2026-05-10**: Startup auth stability hardening: initial workspace bootstrap now retries transient API failures (service restart window) before falling back to sign-in, preventing false logout UX during backend/frontend restarts.
- **2026-05-10**: Fixed duplicate direct-chat creation from group member actions: opening direct chat from group avatar/member now first reuses existing direct/private/secret dialog by `peerUserId`, and only creates a new chat when none exists.
- **2026-05-10**: Registration hardening for release: added automatic username regeneration retry on DB unique-conflict (`username`) during register flow, reducing rare collision-based `409` failures under concurrent signups.
- **2026-05-10**: Direct chat URL migration compatibility: added canonical personal-chat routing to `/@username` with backward support for legacy `/-100...` links; route resolver now maps `@username` to existing direct/private/secret dialogs without creating duplicates, and UI route updates keep direct links human-readable while preserving stable dialog ids under the hood.
- **2026-05-11**: Implemented dual-mode direct messaging: default personal dialogs are now Cloud chats (server-readable moderation/search/recovery model), while Secret chats are created only via explicit `Start Secret Chat` action in profile. Added mode clarity in UI (`Cloud chat` vs `Secret chat • End-to-end encrypted`), routed secret dialogs via stable public-id path (no `@username` collision), and blocked accidental secure-dialog creation by requiring explicit secure intent in backend API payload.
- **2026-05-11**: Hardened Secret chat reliability: fixed key-envelope targeting bug during secure dialog bootstrap (creator/recipient envelopes now wrapped for correct recipients), moved secret dialog key persistence from `sessionStorage` to durable storage, and updated decrypt-failure placeholder to user-facing `Encrypted message unavailable on this device`.
- **2026-05-22**: Native Android Client Overhaul: fixed the authentication 404 crash by routing `BASE_URL` to `https://web.thegrapht.su`, integrated hardware-accelerated `TransitionManager` layout transitions for fluid switching/resizing of the login card, and replaced custom touches with native M3-compliant `<ripple>` drawables across all buttons and clickable views.

## GitHub Repository & Git Workflow (Интеграция с GitHub)

This repository is integrated with a private GitHub repository for development and safe deployment updates.

### 1. Repository Info (Информация о репозитории)
* **Remote Origin (SSH)**: `git@github.com:ty414783-arch/thegrapht.git`
* **Default Branch**: `main`

### 2. SSH Configuration (Настройка SSH)
To authenticate securely without password prompts, the server uses a dedicated SSH key pair:
* **Private Key Path**: `/root/.ssh/id_ed25519_github`
* **SSH Config (`/root/.ssh/config`)**:
  ```text
  Host github.com
    HostName github.com
    User git
    IdentityFile /root/.ssh/id_ed25519_github
    IdentitiesOnly yes
  ```

### 3. Security & Anti-Leak Policy (Безопасность и защита от утечек)
We enforce a strict security policy to guarantee that **no secrets, passwords, or environments are committed to GitHub**.
* **Blocked Files** (configured in `.gitignore`):
  * All environment files: `.env`, `.env.*` (except `.env.example`)
  * Database files and state: `postgres-data/`, `redis-data/`, `*.db`, `*.sqlite`
  * Certificates, private and public keys: `*.key`, `*.pem`, `*.pub`, `*.cert`
  * Access logs and dynamic run files.
* **Important**: Always verify `git status` before committing. If you create new private files/directories containing secrets, ensure they are added to `.gitignore`.

### 4. Git Workflows & Essential Commands (Основные команды)

#### Safe Deploy Updates (Обновление изменений на сервере)
Whenever changes are made, follow these steps to commit and push them securely:
```bash
# Check modified files and untracked files
git status

# Add changes to staging
git add .

# Create a clear, meaningful commit message
git commit -m "feat/fix: descriptive message"

# Push securely to the main branch
git push origin main
```

#### Safe Updates Retrieval (Получение обновлений из репозитория)
To pull the latest changes from GitHub without breaking local modifications:
```bash
# Fetch and merge latest code
git pull origin main
```

#### Disaster Recovery / Rollback (Откат изменений при сбоях)
If a bad update breaks development:
```bash
# View recent commits and their hashes
git log -n 5 --oneline

# Soft rollback (undo commit, keep modified files in working directory)
git reset --soft HEAD~1

# Hard rollback (completely revert files to last committed state)
# WARNING: This will discard all uncommitted changes!
git reset --hard HEAD
```
