#!/usr/bin/env bash
set -euo pipefail

UPLOADS_DIR="${UPLOADS_DIR:-/root/thegrapht-data/uploads}"
POSTGRES_HOST="${POSTGRES_HOST:-127.0.0.1}"
POSTGRES_PORT="${POSTGRES_PORT:-5432}"
POSTGRES_DB="${POSTGRES_DB:-thegrapht}"
POSTGRES_USER="${POSTGRES_USER:-thegrapht}"
POSTGRES_PASSWORD="${POSTGRES_PASSWORD:-}"

if [[ -z "${POSTGRES_PASSWORD}" ]]; then
  echo "POSTGRES_PASSWORD is required" >&2
  exit 1
fi

export PGPASSWORD="${POSTGRES_PASSWORD}"

psql_base=(
  psql
  -h "${POSTGRES_HOST}"
  -p "${POSTGRES_PORT}"
  -U "${POSTGRES_USER}"
  -d "${POSTGRES_DB}"
)

mapfile -t rows < <(
  "${psql_base[@]}" -AtF $'\t' -c "
    SELECT
      id,
      attachment_path,
      to_char(created_at AT TIME ZONE 'UTC', 'YYYY'),
      to_char(created_at AT TIME ZONE 'UTC', 'MM'),
      to_char(created_at AT TIME ZONE 'UTC', 'DD')
    FROM messages
    WHERE attachment_path IS NOT NULL
      AND attachment_path NOT LIKE '%/%'
    ORDER BY created_at ASC, id ASC;
  "
)

if [[ "${#rows[@]}" -eq 0 ]]; then
  echo "No legacy uploads to migrate."
  exit 0
fi

migrated=0
missing=0

for row in "${rows[@]}"; do
  IFS=$'\t' read -r message_id old_name year month day <<< "${row}"
  old_path="${UPLOADS_DIR}/${old_name}"

  if [[ ! -f "${old_path}" ]]; then
    echo "Missing file for ${message_id}: ${old_name}" >&2
    missing=$((missing + 1))
    continue
  fi

  new_relative_path="images/legacy/${year}/${month}/${day}/${old_name}"
  new_path="${UPLOADS_DIR}/${new_relative_path}"

  mkdir -p "$(dirname "${new_path}")"

  if [[ ! -f "${new_path}" ]]; then
    mv "${old_path}" "${new_path}"
  else
    rm -f "${old_path}"
  fi

  "${psql_base[@]}" -v ON_ERROR_STOP=1 -c "
    UPDATE messages
    SET attachment_path = '${new_relative_path}'
    WHERE id = '${message_id}'
      AND attachment_path = '${old_name}';
  " >/dev/null

  migrated=$((migrated + 1))
done

echo "Migrated ${migrated} legacy uploads."
if [[ "${missing}" -gt 0 ]]; then
  echo "Skipped ${missing} missing files." >&2
fi
