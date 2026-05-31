# TheGraphT Dev Isolation and Release Flow

Date: **2026-05-27**
Target release: **2026-05-29**

## Goal
- Keep production messenger on `web.thegrapht.su` stable.
- Run all risky changes first on isolated `dev.thegrapht.su`.
- Promote verified changes from `dev` to `web` with minimal commands.

## Domains
- Production messenger: `https://web.thegrapht.su`
- Dev messenger: `https://dev.thegrapht.su`
- Public site: `https://thegrapht.su`

## Isolation model
- Production stack uses `docker-compose.yml`.
- Dev stack uses `docker-compose.dev.yml`.
- Dev has dedicated DB service `postgres-dev` and dedicated uploads path `/root/thegrapht-data/uploads-dev`.
- Dev routes are bound to separate localhost ports:
  - `frontend-dev`: `127.0.0.1:5185`
  - `backend-dev`: `127.0.0.1:3011`
  - `mtproto-dev`: `127.0.0.1:3110`

## Nginx routing
`infra/nginx/thegrapht.conf` includes `dev.thegrapht.su`:
- `/` -> `127.0.0.1:5185`
- `/api/` -> `127.0.0.1:3011/api/`
- `/ws` -> `127.0.0.1:3011/ws`
- `/mtproto/` -> `127.0.0.1:3110/`

TLS files expected:
- `/etc/letsencrypt/live/dev.thegrapht.su/fullchain.pem`
- `/etc/letsencrypt/live/dev.thegrapht.su/privkey.pem`

## First-time setup on server
1. Ensure DNS `A` record for `dev.thegrapht.su` points to the new server IP.
2. Ensure cert is issued for `dev.thegrapht.su`.
3. Start dev stack:

```bash
cd /root/thegrapht
docker compose -f docker-compose.yml -f docker-compose.dev.yml up -d --build postgres-dev backend-dev mtproto-dev frontend-dev
```

4. Reload nginx after config update:

```bash
sudo nginx -t && sudo systemctl reload nginx
```

## Dev test cycle
1. Apply code changes.
2. Rebuild/restart only dev services:

```bash
cd /root/thegrapht
docker compose -f docker-compose.yml -f docker-compose.dev.yml up -d --build backend-dev mtproto-dev frontend-dev
```

3. Test only on `https://dev.thegrapht.su`:
- login/register/logout
- dialog open/send/edit/delete
- media upload/download
- websocket realtime reconnect

## Promotion from dev to production
When dev is green, deploy same code to production stack:

```bash
cd /root/thegrapht
./scripts/backup-postgres.sh
docker compose up -d --build backend mtproto frontend
```

Post-deploy validation (production):
- `https://web.thegrapht.su/health`
- auth flow
- messaging + realtime

## Rollback
If production check fails:

```bash
cd /root/thegrapht
docker compose logs --tail=200 backend frontend mtproto
docker compose up -d --build backend mtproto frontend
```

If DB rollback is needed, restore the latest backup from `scripts/backup-postgres.sh`.
