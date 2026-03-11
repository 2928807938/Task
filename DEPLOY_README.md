# Task 项目 Linux 部署脚本使用说明

## 📋 脚本功能

这是一个统一的 Linux 自动化部署脚本，提供以下功能：

1. **主部署脚本** - 自动安装环境并完成首次部署
2. **启动后端服务** - 单独启动 Kotlin/Spring Boot 后端
3. **启动前端服务** - 单独启动 Next.js 前端
4. **停止所有服务** - 一键停止前后端和数据库
5. **查看服务状态** - 实时查看所有服务运行状态
6. **更新部署** - 拉取最新 Git 代码并重启服务

## 🚀 快速开始

### 1. 下载脚本

```bash
# 方式一：直接从 GitHub 下载
wget https://raw.githubusercontent.com/2928807938/Task/master/deploy-linux.sh
chmod +x deploy-linux.sh

# 方式二：克隆整个仓库
git clone https://github.com/2928807938/Task.git
cd Task
chmod +x deploy-linux.sh
```

### 2. 运行脚本

```bash
./deploy-linux.sh
```

### 3. 首次部署

首次运行时，选择 **选项 1 - 主部署脚本**，脚本会自动：
- 检测操作系统
- 安装所有依赖（Docker, Java 21, Node.js 18+, Git）
- 克隆项目代码
- 启动 PostgreSQL 和 Redis 容器
- 构建并启动后端和前端服务

## 📦 系统要求

### 最低配置
- **CPU**: 2 核
- **内存**: 4GB
- **磁盘**: 20GB
- **系统**: Ubuntu 20.04+ / CentOS 7+ / Debian 10+

### 推荐配置
- **CPU**: 4 核
- **内存**: 8GB
- **磁盘**: 50GB

## 🔧 自动安装的软件

脚本会自动检测并安装以下软件（如果未安装）：

- **Docker** - 用于运行 PostgreSQL 和 Redis
- **Docker Compose** - 容器编排工具
- **Java 21** (OpenJDK) - 后端运行环境
- **Node.js 18+** - 前端运行环境
- **Git** - 代码版本控制

## 🌐 端口配置

| 服务 | 端口 | 访问地址 |
|------|------|----------|
| 前端 | 3000 | http://localhost:3000 |
| 后端 | 8080 | http://localhost:8080 |
| PostgreSQL | 5432 | localhost:5432 |
| Redis | 6379 | localhost:6379 |

## 📂 目录结构

```
/opt/task-project/              # 部署根目录
├── task-code-parent/           # 后端项目
├── task-client/task-client/    # 前端项目
├── logs/                       # 日志目录
│   ├── backend.log            # 后端日志
│   └── frontend.log           # 前端日志
├── docker-compose.yml          # 数据库配置
├── backend.pid                 # 后端进程 ID
└── frontend.pid                # 前端进程 ID
```

## 🎯 使用场景

### 场景 1: 首次部署

```bash
./deploy-linux.sh
# 选择: 1 (主部署脚本)
# 等待自动安装和部署完成
```

### 场景 2: 重启后端

```bash
./deploy-linux.sh
# 选择: 4 (停止所有服务)
# 然后选择: 2 (启动后端服务)
```

### 场景 3: 更新代码

```bash
./deploy-linux.sh
# 选择: 6 (更新部署)
# 脚本会自动拉取最新代码并重启
```

### 场景 4: 查看状态

```bash
./deploy-linux.sh
# 选择: 5 (查看服务状态)
```

## 📝 数据库配置

### PostgreSQL
- **数据库名**: task_db
- **用户名**: task_user
- **密码**: task_password_2024
- **端口**: 5432

### Redis
- **密码**: task_redis_2024
- **端口**: 6379

## 🔍 日志查看

### 实时查看后端日志
```bash
tail -f /opt/task-project/logs/backend.log
```

### 实时查看前端日志
```bash
tail -f /opt/task-project/logs/frontend.log
```

### 查看 Docker 容器日志
```bash
# PostgreSQL
docker logs -f task-postgres

# Redis
docker logs -f task-redis
```

## ⚠️ 常见问题

### 1. 端口被占用

**问题**: 启动服务时提示端口被占用

**解决方案**:
```bash
# 查看占用端口的进程
sudo lsof -i :8080  # 后端端口
sudo lsof -i :3000  # 前端端口

# 停止占用端口的进程
sudo kill -9 <PID>

# 或使用脚本的停止功能
./deploy-linux.sh
# 选择: 4 (停止所有服务)
```

### 2. Docker 权限问题

**问题**: 运行 Docker 命令时提示权限不足

**解决方案**:
```bash
# 将当前用户添加到 docker 组
sudo usermod -aG docker $USER

# 重新登录或执行
newgrp docker
```

### 3. 构建失败

**问题**: 后端构建失败

**解决方案**:
```bash
# 检查 Java 版本
java -version  # 应该是 21

# 手动构建
cd /opt/task-project/task-code-parent
./gradlew clean build -x test
```

### 4. 前端依赖安装失败

**问题**: npm install 失败

**解决方案**:
```bash
# 清理缓存
cd /opt/task-project/task-client/task-client
rm -rf node_modules package-lock.json
npm cache clean --force

# 使用国内镜像重新安装
npm install --registry=https://registry.npmmirror.com
```

## 🔄 更新和回滚

### 更新到最新版本
```bash
./deploy-linux.sh
# 选择: 6 (更新部署)
```

### 回滚到之前版本
```bash
# 查看备份目录
ls -la /opt/task-project/backup_*

# 回滚到指定版本
cd /opt/task-project
git reset --hard <commit-id>

# 重新构建和启动
./deploy-linux.sh
# 选择: 4 (停止所有服务)
# 选择: 2 (启动后端)
# 选择: 3 (启动前端)
```

## 🛡️ 安全建议

1. **修改默认密码**: 部署后请修改 PostgreSQL 和 Redis 的默认密码
2. **配置防火墙**: 只开放必要的端口
3. **使用 HTTPS**: 生产环境建议配置 Nginx 反向代理和 SSL 证书
4. **定期备份**: 定期备份数据库数据

## 📞 技术支持

- **项目地址**: https://github.com/2928807938/Task
- **问题反馈**: 在 GitHub 上提交 Issue

## 📄 许可证

本项目遵循项目仓库的许可证。