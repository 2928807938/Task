#!/bin/bash

# 启动PostgreSQL服务
echo "正在启动PostgreSQL服务..."
docker-compose up -d postgres

# 检查PostgreSQL服务是否成功启动
echo "检查PostgreSQL服务状态..."
sleep 5
docker-compose ps postgres

echo "PostgreSQL服务已启动，可以通过localhost:5432访问"
echo "数据库名称: task_code_parent"
echo "用户名: postgres"
echo "密码: postgres"
echo ""
echo "连接PostgreSQL命令行："
echo "docker exec -it task-code-parent-postgres psql -U postgres -d task_code_parent"
echo ""
echo "可以使用以下命令停止PostgreSQL服务："
echo "docker-compose stop postgres"
