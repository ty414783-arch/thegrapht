#!/usr/bin/env bash
set -euo pipefail

PROJECT_ROOT="/root/thegrapht"
DEV_ROOT="/root/thegrapht-dev"

echo "========================================================="
echo "   PROMOTING DEVELOPMENT CHANGES TO PRODUCTION STACK"
echo "========================================================="

# 1. Выполняем бэкап базы данных продакшна
echo "[1/3] Создание резервной копии рабочей базы данных..."
if [[ -f "${PROJECT_ROOT}/scripts/backup-postgres.sh" ]]; then
  bash "${PROJECT_ROOT}/scripts/backup-postgres.sh"
else
  echo "Предупреждение: Скрипт backup-postgres.sh не найден в ${PROJECT_ROOT}/scripts/"
fi

# 2. Синхронизируем файлы исходного кода через rsync
echo "[2/3] Синхронизация файлов из dev в prod..."
rsync -av \
  --exclude='node_modules' \
  --exclude='.env' \
  --exclude='logs' \
  --exclude='backups' \
  --exclude='.git' \
  --exclude='scratch' \
  --exclude='*.log' \
  --exclude='docker-compose.yml' \
  --exclude='docker-compose.dev.yml' \
  "${DEV_ROOT}/" "${PROJECT_ROOT}/"

# 3. Пересобираем и перезапускаем продакшн-контейнеры
echo "[3/3] Перезапуск рабочих контейнеров продакшна..."
cd "${PROJECT_ROOT}"
docker compose -f docker-compose.yml up -d --build backend mtproto frontend

echo "========================================================="
echo "   ПЕРЕНОС ИЗМЕНЕНИЙ НА ПРОДАКШН ВЫПОЛНЕН УСПЕШНО!      "
echo "========================================================="
