#!/usr/bin/env bash
set -euo pipefail

TZ_REGION="Asia/Novosibirsk"
ARCHIVE_ROOT="${1:-/root/thegrapht zip archives}"
PROJECT_DIR="/root/thegrapht"
DATA_DIR="/root/thegrapht-data"
LOCK_FILE="/tmp/thegrapht-full-backup.lock"

if ! command -v docker >/dev/null 2>&1; then
  echo "docker is required" >&2
  exit 1
fi

if ! command -v zip >/dev/null 2>&1; then
  echo "zip is required" >&2
  exit 1
fi

if [[ ! -d "${PROJECT_DIR}" ]]; then
  echo "missing project directory: ${PROJECT_DIR}" >&2
  exit 1
fi

mkdir -p "${ARCHIVE_ROOT}"

exec 9>"${LOCK_FILE}"
if ! flock -n 9; then
  echo "backup is already running" >&2
  exit 1
fi

slot_base="$(LC_TIME=C TZ="${TZ_REGION}" date '+%d %b' | tr '[:upper:]' '[:lower:]')"
slot_dir="${ARCHIVE_ROOT}/${slot_base}"
if [[ -e "${slot_dir}" ]]; then
  idx=2
  while [[ -e "${ARCHIVE_ROOT}/${slot_base} (${idx})" ]]; do
    idx=$((idx + 1))
  done
  slot_dir="${ARCHIVE_ROOT}/${slot_base} (${idx})"
fi
mkdir -p "${slot_dir}"

stamp_local="$(TZ="${TZ_REGION}" date '+%Y%m%d_%H%M%S')"
stamp_utc="$(date -u '+%Y-%m-%dT%H:%M:%SZ')"
work_dir="${slot_dir}/_work_${stamp_local}"
mkdir -p "${work_dir}"

report_path="${slot_dir}/backup_report_${stamp_local}.txt"
zip_path="${slot_dir}/thegrapht_full_backup_${stamp_local}.zip"

echo "[backup] target slot: ${slot_dir}"
echo "[backup] collecting database dump..."

postgres_container="${POSTGRES_CONTAINER:-}"
if [[ -z "${postgres_container}" ]]; then
  postgres_container="$(docker ps --format '{{.Names}} {{.Image}}' | awk '$2 ~ /^postgres:/ { print $1; exit }')"
fi
if [[ -z "${postgres_container}" ]]; then
  postgres_container="$(docker ps --format '{{.Names}}' | awk '/postgres/ { print; exit }')"
fi
if [[ -z "${postgres_container}" ]]; then
  echo "postgres container not found" >&2
  exit 1
fi

pg_user="$(docker exec "${postgres_container}" sh -lc 'printf "%s" "${POSTGRES_USER:-}"' || true)"
if [[ -z "${pg_user}" ]]; then
  pg_user="thegrapht"
fi

pg_dump_path="${work_dir}/postgres_full_${stamp_local}.sql"
dump_ok="false"
for candidate in "${pg_user}" "thegrapht" "postgres"; do
  if docker exec "${postgres_container}" pg_dumpall -U "${candidate}" --clean --if-exists > "${pg_dump_path}"; then
    pg_user="${candidate}"
    dump_ok="true"
    break
  fi
done
if [[ "${dump_ok}" != "true" ]]; then
  echo "failed to create pg_dumpall from ${postgres_container}" >&2
  exit 1
fi

meta_dir="${work_dir}/meta"
mkdir -p "${meta_dir}"
docker ps --format 'table {{.Names}}\t{{.Image}}\t{{.Status}}' > "${meta_dir}/docker_ps.txt"
docker volume ls > "${meta_dir}/docker_volumes.txt" || true

copy_dir="${work_dir}/payload"
mkdir -p "${copy_dir}"
cp -a "${PROJECT_DIR}" "${copy_dir}/thegrapht"
if [[ -d "${DATA_DIR}" ]]; then
  cp -a "${DATA_DIR}" "${copy_dir}/thegrapht-data"
fi
cp -a "${pg_dump_path}" "${copy_dir}/postgres_full.sql"
cp -a "${meta_dir}" "${copy_dir}/meta"

(
  cd "${copy_dir}"
  zip -rq "${zip_path}" .
)

zip_size_human="$(du -h "${zip_path}" | awk '{print $1}')"
zip_size_bytes="$(stat -c '%s' "${zip_path}")"

action_time="$(TZ="${TZ_REGION}" date '+%Y-%m-%d %H:%M:%S %Z')"
{
  echo "TheGraphT full backup"
  echo "Local time (${TZ_REGION}): ${action_time}"
  echo "UTC time: ${stamp_utc}"
  echo "Postgres container: ${postgres_container}"
  echo "Postgres dump user: ${pg_user}"
  echo "Archive root: ${ARCHIVE_ROOT}"
  echo "Backup slot directory: ${slot_dir}"
  echo "Zip archive: ${zip_path}"
  echo "Zip size (bytes): ${zip_size_bytes}"
  echo "Zip size (human): ${zip_size_human}"
} | tee "${report_path}"

rm -rf "${work_dir}"

echo "[backup] complete: ${zip_path}"
echo "[backup] report: ${report_path}"
