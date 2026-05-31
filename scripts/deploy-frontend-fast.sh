#!/usr/bin/env bash
set -euo pipefail

PROJECT_ROOT="/root/thegrapht"
FRONTEND_SRC_ROOT="${PROJECT_ROOT}/apps/frontend/src"
GUARD_ROOT="${PROJECT_ROOT}/backups/frontend-src-guard"
CRITICAL_SNAPSHOT_ROOT="${GUARD_ROOT}/critical"
FULL_SNAPSHOT_ROOT="${GUARD_ROOT}/full"
LATEST_FULL_LINK="${FULL_SNAPSHOT_ROOT}/latest"
FRONTEND_LOCAL_URL="${FRONTEND_LOCAL_URL:-http://127.0.0.1:5173/}"

CRITICAL_FILES=(
  "${FRONTEND_SRC_ROOT}/server/client-script.js"
  "${FRONTEND_SRC_ROOT}/server/page-template.js"
  "${FRONTEND_SRC_ROOT}/server/client/bootstrap.js"
  "${FRONTEND_SRC_ROOT}/server/client/media.js"
  "${FRONTEND_SRC_ROOT}/server/client/sidebar.js"
)

smoke_check_frontend_http() {
  local container_name="$1"
  local tries="${2:-45}"
  local delay_seconds="${3:-1}"

  for ((i = 1; i <= tries; i++)); do
    if docker exec "${container_name}" sh -lc "wget -qO- '${FRONTEND_LOCAL_URL}' 2>/dev/null | grep -Eq '<!doctype html>|<html'"; then
      return 0
    fi
    sleep "${delay_seconds}"
  done
  return 1
}

safe_restart_with_auto_rollback() {
  local container_name="$1"

  echo "Restarting ${container_name} (bind-mount deploy, no docker cp)..."
  docker restart "${container_name}" >/dev/null

  if smoke_check_frontend_http "${container_name}" 45 1; then
    docker logs --tail 8 "${container_name}"
    return 0
  fi

  echo "Smoke check failed after restart, auto-rollback from latest snapshot..." >&2
  if ! restore_from_latest_full_snapshot; then
    echo "Auto-rollback failed: cannot restore snapshot." >&2
    docker logs --tail 40 "${container_name}" >&2 || true
    return 1
  fi

  docker restart "${container_name}" >/dev/null
  if smoke_check_frontend_http "${container_name}" 50 1; then
    echo "Auto-rollback succeeded, container recovered." >&2
    docker logs --tail 12 "${container_name}"
    return 0
  fi

  echo "Auto-rollback did not recover frontend. Manual intervention required." >&2
  docker logs --tail 80 "${container_name}" >&2 || true
  return 1
}

restore_from_latest_full_snapshot() {
  if [[ ! -L "${LATEST_FULL_LINK}" && ! -d "${LATEST_FULL_LINK}" ]]; then
    echo "No latest full snapshot found, cannot auto-restore." >&2
    return 1
  fi

  local latest_snapshot
  latest_snapshot="$(readlink -f "${LATEST_FULL_LINK}")"
  if [[ -z "${latest_snapshot}" || ! -d "${latest_snapshot}" ]]; then
    echo "Latest full snapshot path is invalid: ${latest_snapshot}" >&2
    return 1
  fi

  if [[ ! -d "${latest_snapshot}/src" ]]; then
    echo "Latest snapshot is missing src directory: ${latest_snapshot}/src" >&2
    return 1
  fi

  echo "Auto-restoring frontend src from snapshot: ${latest_snapshot}" >&2
  cp -a "${latest_snapshot}/src/." "${FRONTEND_SRC_ROOT}/"
}

ensure_no_zero_byte_files() {
  local zero_files
  zero_files="$(find "${FRONTEND_SRC_ROOT}" -type f \( -name '*.js' -o -name '*.mjs' -o -name '*.css' -o -name '*.html' -o -name '*.json' \) -size 0 -print)"
  if [[ -n "${zero_files}" ]]; then
    echo "Detected zero-byte frontend files:" >&2
    echo "${zero_files}" >&2
    return 1
  fi
  return 0
}

mkdir -p "${CRITICAL_SNAPSHOT_ROOT}" "${FULL_SNAPSHOT_ROOT}"

if ! ensure_no_zero_byte_files; then
  if ! restore_from_latest_full_snapshot; then
    echo "Deploy aborted: zero-byte files detected and auto-restore failed." >&2
    exit 1
  fi
  if ! ensure_no_zero_byte_files; then
    echo "Deploy aborted: zero-byte files remain after auto-restore." >&2
    exit 1
  fi
fi

for FILE_PATH in "${CRITICAL_FILES[@]}"; do
  if [[ ! -f "${FILE_PATH}" ]]; then
    echo "Critical file is missing: ${FILE_PATH}" >&2
    exit 1
  fi

  if [[ ! -s "${FILE_PATH}" ]]; then
    echo "Critical file is empty (0 bytes): ${FILE_PATH}" >&2
    echo "Deploy aborted to protect production." >&2
    exit 1
  fi
done

SNAPSHOT_TS="$(date +%Y%m%dT%H%M%S)"
CRITICAL_SNAPSHOT_TARGET="${CRITICAL_SNAPSHOT_ROOT}/${SNAPSHOT_TS}"
FULL_SNAPSHOT_TARGET="${FULL_SNAPSHOT_ROOT}/${SNAPSHOT_TS}"
mkdir -p "${CRITICAL_SNAPSHOT_TARGET}" "${FULL_SNAPSHOT_TARGET}"

for FILE_PATH in "${CRITICAL_FILES[@]}"; do
  cp "${FILE_PATH}" "${CRITICAL_SNAPSHOT_TARGET}/$(basename "${FILE_PATH}")"
done

cp -a "${FRONTEND_SRC_ROOT}" "${FULL_SNAPSHOT_TARGET}/src"
if [[ -e "${LATEST_FULL_LINK}" && ! -L "${LATEST_FULL_LINK}" ]]; then
  rm -rf "${LATEST_FULL_LINK}"
fi
ln -sfn "${FULL_SNAPSHOT_TARGET}" "${LATEST_FULL_LINK}"

if [[ $# -gt 0 ]]; then
  TARGET_CONTAINERS=("$@")
else
  mapfile -t TARGET_CONTAINERS < <(
    docker ps -a --format '{{.Names}}' | grep -E '(^|_)thegrapht_frontend(_|$)' || true
  )
fi

if [[ ${#TARGET_CONTAINERS[@]} -eq 0 ]]; then
  echo "No frontend containers found" >&2
  exit 1
fi

for CONTAINER_NAME in "${TARGET_CONTAINERS[@]}"; do
  if ! docker ps -a --format '{{.Names}}' | grep -qx "${CONTAINER_NAME}"; then
    echo "Container ${CONTAINER_NAME} not found" >&2
    exit 1
  fi

  safe_restart_with_auto_rollback "${CONTAINER_NAME}"
done
