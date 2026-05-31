#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
TARGET_ENV="${ROOT_DIR}/.env"

if [[ -f "${TARGET_ENV}" ]]; then
  echo ".env already exists at ${TARGET_ENV}"
  exit 0
fi

cat > "${TARGET_ENV}" <<EOF
POSTGRES_DB=thegrapht
POSTGRES_USER=thegrapht
POSTGRES_PASSWORD=$(openssl rand -hex 24)
POSTGRES_HOST=postgres
POSTGRES_PORT=5432
POSTGRES_SSLMODE=disable
JWT_SECRET=$(openssl rand -base64 32)
JWT_EXPIRES_IN=30d
SESSION_COOKIE_NAME=thegrapht_session
ENABLE_INFRA_CHECKS=false
LOG_LEVEL=info
CORS_ALLOWED_ORIGINS=http://localhost,http://127.0.0.1,http://localhost:80,http://127.0.0.1:80,http://localhost:5173,http://127.0.0.1:5173,http://localhost:5175,http://127.0.0.1:5175,https://thegrapht.su,https://www.thegrapht.su,https://web.thegrapht.su
VITE_API_BASE_URL=http://localhost:3001/api
VITE_WS_BASE_URL=ws://localhost:3001/ws
VITE_MTPROTO_BASE_URL=http://localhost:3100/mtproto
TURN_PUBLIC_HOST=web.thegrapht.su
TURN_REALM=web.thegrapht.su
TURN_USERNAME=thegrapht_turn
TURN_PASSWORD=$(openssl rand -hex 16)
SECURE_DIRECT_CHATS_ENABLED=true
EOF

chmod 600 "${TARGET_ENV}"
echo "Generated ${TARGET_ENV}"
