#!/usr/bin/env bash
set -euo pipefail
set -x

if ! command -v docker >/dev/null 2>&1; then
  echo "docker is required" >&2
  exit 1
fi

if ! command -v zip >/dev/null 2>&1; then
  echo "zip is required" >&2
  exit 1
fi

if ! command -v zipinfo >/dev/null 2>&1; then
  echo "zipinfo is required (usually from unzip package)" >&2
  exit 1
fi

SOURCE_DIR_ONE="/root/thegrapht"
SOURCE_DIR_TWO="/root/thegrapht-data"
BACKUP_ROOT="${1:-/root/messenger-backups}"
TIMESTAMP="$(date -u +"%Y%m%dT%H%M%SZ")"
SESSION_DIR="${BACKUP_ROOT}/backup_${TIMESTAMP}"
DB_DUMP_PATH="${SESSION_DIR}/full_database_backup.sql"
ZIP_PATH="${SESSION_DIR}/messenger_full_backup_${TIMESTAMP}.zip"
REPORT_PATH="${SESSION_DIR}/backup_report_${TIMESTAMP}.txt"

if [[ ! -d "${SOURCE_DIR_ONE}" ]]; then
  echo "missing source directory: ${SOURCE_DIR_ONE}" >&2
  exit 1
fi

if [[ ! -d "${SOURCE_DIR_TWO}" ]]; then
  echo "missing source directory: ${SOURCE_DIR_TWO}" >&2
  exit 1
fi

mkdir -p "${SESSION_DIR}"

POSTGRES_CONTAINER="${POSTGRES_CONTAINER:-}"
if [[ -z "${POSTGRES_CONTAINER}" ]]; then
  POSTGRES_CONTAINER="$(docker ps --format '{{.Names}}' | grep -E '(^|_)thegrapht_postgres(_|$)' | head -n 1 || true)"
fi
if [[ -z "${POSTGRES_CONTAINER}" ]]; then
  POSTGRES_CONTAINER="$(docker ps --format '{{.Names}} {{.Image}}' | awk '$2 ~ /^postgres:/ { print $1; exit }' || true)"
fi
if [[ -z "${POSTGRES_CONTAINER}" ]]; then
  echo "postgres container not found; set POSTGRES_CONTAINER explicitly" >&2
  exit 1
fi

POSTGRES_DB_USER="${POSTGRES_DB_USER:-}"
if [[ -z "${POSTGRES_DB_USER}" ]]; then
  POSTGRES_DB_USER="$(docker exec "${POSTGRES_CONTAINER}" sh -lc 'printf "%s" "${POSTGRES_USER:-}"' || true)"
fi
if [[ -z "${POSTGRES_DB_USER}" ]]; then
  POSTGRES_DB_USER="thegrapht"
fi

DUMP_OK="false"
for CANDIDATE_USER in "${POSTGRES_DB_USER}" "thegrapht" "postgres"; do
  if docker exec "${POSTGRES_CONTAINER}" pg_dumpall -U "${CANDIDATE_USER}" --clean --if-exists > "${DB_DUMP_PATH}"; then
    POSTGRES_DB_USER="${CANDIDATE_USER}"
    DUMP_OK="true"
    break
  fi
done

if [[ "${DUMP_OK}" != "true" ]]; then
  echo "failed to create pg_dumpall from container ${POSTGRES_CONTAINER}" >&2
  exit 1
fi

zip -r "${ZIP_PATH}" "${SOURCE_DIR_ONE}" "${SOURCE_DIR_TWO}" "${DB_DUMP_PATH}"

ZIP_SIZE_BYTES="$(stat -c '%s' "${ZIP_PATH}")"
ZIP_SIZE_HUMAN="$(du -h "${ZIP_PATH}" | awk '{print $1}')"
DB_DUMP_SIZE_HUMAN="$(du -h "${DB_DUMP_PATH}" | awk '{print $1}')"

{
  echo "Backup timestamp (UTC): ${TIMESTAMP}"
  echo "PostgreSQL container: ${POSTGRES_CONTAINER}"
  echo "PostgreSQL dump user: ${POSTGRES_DB_USER}"
  echo "Database dump file: ${DB_DUMP_PATH}"
  echo "Database dump size: ${DB_DUMP_SIZE_HUMAN}"
  echo "ZIP archive: ${ZIP_PATH}"
  echo "ZIP size (bytes): ${ZIP_SIZE_BYTES}"
  echo "ZIP size (human): ${ZIP_SIZE_HUMAN}"
  echo "----- FILES IN ZIP -----"
  zipinfo -1 "${ZIP_PATH}"
} | tee "${REPORT_PATH}"

echo "Backup complete."
echo "Report saved to: ${REPORT_PATH}"
