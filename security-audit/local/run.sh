#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPORT_PATH="${SCRIPT_DIR}/report.md"
RUNNER_PATH="${SCRIPT_DIR}/run-local-audit.mjs"

if command -v node >/dev/null 2>&1 && node -e 'process.exit(Number(process.versions.node.split(".")[0]) >= 18 ? 0 : 1)' >/dev/null 2>&1; then
  node "${RUNNER_PATH}"
  exit 0
fi

if ! command -v docker >/dev/null 2>&1; then
  echo "Neither node >= 18 nor docker is available. Install Node.js >= 18 or run inside a TheGraphT container." >&2
  exit 1
fi

if ! docker ps --format '{{.Names}}' | grep -qx 'thegrapht_frontend_1'; then
  echo "Host node >= 18 is unavailable and container thegrapht_frontend_1 is not running." >&2
  exit 1
fi

AUDIT_STDOUT=1 \
AUDIT_BACKEND_BASE="${AUDIT_BACKEND_BASE:-http://thegrapht_backend_1:3000}" \
AUDIT_FRONTEND_BASE="${AUDIT_FRONTEND_BASE:-http://localhost:5173}" \
AUDIT_MTPROTO_BASE="${AUDIT_MTPROTO_BASE:-http://thegrapht_mtproto_1:3100}" \
docker exec -i \
  -e AUDIT_STDOUT \
  -e AUDIT_BACKEND_BASE \
  -e AUDIT_FRONTEND_BASE \
  -e AUDIT_MTPROTO_BASE \
  thegrapht_frontend_1 \
  node --input-type=module < "${RUNNER_PATH}" > "${REPORT_PATH}"

echo "Wrote ${REPORT_PATH}"
