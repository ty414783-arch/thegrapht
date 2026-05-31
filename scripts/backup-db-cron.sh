#!/usr/bin/env bash
set -euo pipefail

BACKUP_DIR="/root/thegrapht/backups/db_daily"
mkdir -p "${BACKUP_DIR}"

FILENAME="${BACKUP_DIR}/db_backup_$(date +%Y%m%d_%H%M%S).sql"

# Выполняем дамп базы данных
if docker exec thegrapht-postgres-1 pg_dump -U thegrapht -d thegrapht > "${FILENAME}" 2>/dev/null; then
  # Удаляем бэкапы старше 14 дней, чтобы не забивать диск
  find "${BACKUP_DIR}" -name "db_backup_*.sql" -mtime +14 -delete
else
  # Если контейнер по какой-то причине недоступен, пишем в лог ошибок
  echo "$(date +'%Y-%m-%d %H:%M:%S') - Database backup failed!" >> "${BACKUP_DIR}/backup_error.log"
fi
