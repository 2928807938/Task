#!/bin/bash

# 启动Redis服务
echo "正在启动Redis服务..."
docker-compose up -d redis

# 检查Redis服务是否成功启动
echo "检查Redis服务状态..."
sleep 3
docker-compose ps redis

echo "Redis服务已启动，可以通过localhost:6379访问"
echo "Redis密码已设置为: redis123"
echo "连接Redis命令行： docker exec -it task-code-parent-redis redis-cli -a redis123"
echo "可以使用以下命令停止Redis服务："
echo "docker-compose stop redis"
