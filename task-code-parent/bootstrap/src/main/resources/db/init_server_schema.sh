#!/usr/bin/env bash

# Legacy helper retained for reference only.
# Database schema is now managed by Flyway migrations under db/migration.

set -euo pipefail

BASE_DIR="${BASE_DIR:-/home/Task/task-code-parent/bootstrap/src/main/resources/db}"
SCHEMA_DIR="${SCHEMA_DIR:-${BASE_DIR}/schema}"
DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-5432}"
DB_NAME="${DB_NAME:-task_code_parent}"
DB_USER="${DB_USER:-task_ark}"
DB_PASSWORD="${DB_PASSWORD:-tanghulu040707}"

if ! command -v psql >/dev/null 2>&1; then
  echo "错误: 服务器未安装 psql，请先安装 postgresql-client。" >&2
  exit 1
fi

if [ ! -d "$SCHEMA_DIR" ]; then
  echo "错误: schema目录不存在: $SCHEMA_DIR" >&2
  exit 1
fi

export PGPASSWORD="$DB_PASSWORD"

echo "开始初始化数据库..."
echo "数据库: ${DB_HOST}:${DB_PORT}/${DB_NAME}"
echo "SQL目录: ${SCHEMA_DIR}"

for file in "$SCHEMA_DIR"/*.sql; do
  [ -f "$file" ] || continue
  echo "正在执行 $(basename "$file")"
  psql \
    -h "$DB_HOST" \
    -p "$DB_PORT" \
    -U "$DB_USER" \
    -d "$DB_NAME" \
    -v ON_ERROR_STOP=1 \
    -f "$file"
done

echo "数据库初始化完成。"
