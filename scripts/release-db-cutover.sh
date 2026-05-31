#!/usr/bin/env bash
set -euo pipefail

# Safe DB cutover helper for release day.
# Default mode (prepare): backup current DB + create new DB.
# Destructive drop is disabled unless explicit token is provided.

POSTGRES_CONTAINER="${POSTGRES_CONTAINER:-9e475160dbad_thegrapht_postgres_1}"
PGUSER_ADMIN="${PGUSER_ADMIN:-thegrapht}"
APP_ROLE="${APP_ROLE:-thegrapht_app}"
OWNER_ROLE="${OWNER_ROLE:-thegrapht_db_owner}"
OLD_DB="${OLD_DB:-thegrapht}"
NEW_DB="${NEW_DB:-thegrapht_release_20260529}"
BACKUP_ROOT="${BACKUP_ROOT:-/root/thegrapht zip archives/release-db-cutover}"
CONFIRM_TOKEN_REQUIRED="DROP_THEGRAPHT_DB_2026_05_29"

MODE="prepare"
CONFIRM_DROP=""
SWITCH_ENV="false"
ENV_PATH="/root/thegrapht/.env"

while [[ $# -gt 0 ]]; do
  case "$1" in
    --prepare)
      MODE="prepare"
      ;;
    --drop-old)
      MODE="drop-old"
      ;;
    --switch-env)
      SWITCH_ENV="true"
      ;;
    --confirm-drop)
      CONFIRM_DROP="${2:-}"
      shift
      ;;
    --old-db)
      OLD_DB="${2:-}"
      shift
      ;;
    --new-db)
      NEW_DB="${2:-}"
      shift
      ;;
    --container)
      POSTGRES_CONTAINER="${2:-}"
      shift
      ;;
    *)
      echo "Unknown argument: $1" >&2
      exit 1
      ;;
  esac
  shift
done

if ! command -v docker >/dev/null 2>&1; then
  echo "docker is required" >&2
  exit 1
fi

mkdir -p "$BACKUP_ROOT"
STAMP="$(date -u +%Y%m%dT%H%M%SZ)"
RUN_DIR="$BACKUP_ROOT/$STAMP"
mkdir -p "$RUN_DIR"

log() { echo "[cutover] $*"; }

psql_exec() {
  docker exec "$POSTGRES_CONTAINER" psql -v ON_ERROR_STOP=1 -U "$PGUSER_ADMIN" -d postgres "$@"
}

psql_query() {
  docker exec "$POSTGRES_CONTAINER" psql -v ON_ERROR_STOP=1 -U "$PGUSER_ADMIN" -d postgres -Atqc "$1"
}

if ! docker ps --format '{{.Names}}' | grep -qx "$POSTGRES_CONTAINER"; then
  echo "Postgres container is not running: $POSTGRES_CONTAINER" >&2
  exit 1
fi

log "mode=$MODE old_db=$OLD_DB new_db=$NEW_DB container=$POSTGRES_CONTAINER"

if [[ "$MODE" == "prepare" ]]; then
  log "creating logical backups"
  docker exec "$POSTGRES_CONTAINER" pg_dump -U "$PGUSER_ADMIN" -d "$OLD_DB" -Fc > "$RUN_DIR/${OLD_DB}.dump"
  docker exec "$POSTGRES_CONTAINER" pg_dumpall -U "$PGUSER_ADMIN" --globals-only > "$RUN_DIR/globals.sql"

  log "ensuring owner role exists"
  psql_exec -c "DO \$\$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname='$OWNER_ROLE') THEN CREATE ROLE $OWNER_ROLE NOLOGIN; END IF; END \$\$;"

  log "creating new database if missing"
  if [[ "$(psql_query "select 1 from pg_database where datname='${NEW_DB}'")" != "1" ]]; then
    psql_exec -c "CREATE DATABASE $NEW_DB OWNER $OWNER_ROLE TEMPLATE template0 ENCODING 'UTF8';"
  else
    log "new DB already exists: $NEW_DB"
  fi

  log "granting runtime privileges to app role"
  docker exec "$POSTGRES_CONTAINER" psql -v ON_ERROR_STOP=1 -U "$PGUSER_ADMIN" -d "$NEW_DB" \
    -c "GRANT CONNECT, TEMP ON DATABASE $NEW_DB TO $APP_ROLE;" \
    -c "GRANT USAGE, CREATE ON SCHEMA public TO $APP_ROLE;" \
    -c "GRANT SELECT, INSERT, UPDATE, DELETE, TRUNCATE, REFERENCES, TRIGGER ON ALL TABLES IN SCHEMA public TO $APP_ROLE;" \
    -c "GRANT USAGE, SELECT, UPDATE ON ALL SEQUENCES IN SCHEMA public TO $APP_ROLE;"

  if [[ "$SWITCH_ENV" == "true" ]]; then
    log "switching .env POSTGRES_DB -> $NEW_DB"
    sed -i "s/^POSTGRES_DB=.*/POSTGRES_DB=$NEW_DB/" "$ENV_PATH"
  fi

  {
    echo "timestamp_utc=$STAMP"
    echo "mode=prepare"
    echo "old_db=$OLD_DB"
    echo "new_db=$NEW_DB"
    echo "container=$POSTGRES_CONTAINER"
    echo "app_role=$APP_ROLE"
    echo "owner_role=$OWNER_ROLE"
    echo "backup_dump=$RUN_DIR/${OLD_DB}.dump"
    echo "backup_globals=$RUN_DIR/globals.sql"
    echo "switch_env=$SWITCH_ENV"
  } > "$RUN_DIR/report.txt"

  log "prepare complete: $RUN_DIR/report.txt"
  exit 0
fi

if [[ "$MODE" == "drop-old" ]]; then
  if [[ "$CONFIRM_DROP" != "$CONFIRM_TOKEN_REQUIRED" ]]; then
    echo "Refusing drop. Pass --confirm-drop $CONFIRM_TOKEN_REQUIRED" >&2
    exit 1
  fi

  log "creating final pre-drop backup"
  docker exec "$POSTGRES_CONTAINER" pg_dump -U "$PGUSER_ADMIN" -d "$OLD_DB" -Fc > "$RUN_DIR/${OLD_DB}.pre_drop.dump"

  log "terminating active connections to $OLD_DB"
  psql_exec -c "SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname='$OLD_DB' AND pid <> pg_backend_pid();"

  log "dropping old db: $OLD_DB"
  psql_exec -c "DROP DATABASE $OLD_DB;"

  {
    echo "timestamp_utc=$STAMP"
    echo "mode=drop-old"
    echo "dropped_db=$OLD_DB"
    echo "backup_dump=$RUN_DIR/${OLD_DB}.pre_drop.dump"
  } > "$RUN_DIR/report.txt"

  log "drop complete: $RUN_DIR/report.txt"
  exit 0
fi

