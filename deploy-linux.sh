#!/bin/bash

################################################################################
# Task 项目 Linux 自动化部署脚本
# 项目地址: https://github.com/2928807938/Task.git
#
# 功能:
# 1. 主部署脚本 - 自动安装环境并部署
# 2. 启动后端服务
# 3. 启动前端服务
# 4. 停止所有服务
# 5. 查看服务状态
# 6. 更新部署 - 拉取最新代码并重启
################################################################################

set -e  # 遇到错误立即退出

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 项目配置
GITHUB_REPO="https://github.com/2928807938/Task.git"
PROJECT_NAME="Task"
DEPLOY_DIR="/opt/task-project"
BACKEND_DIR="$DEPLOY_DIR/task-code-parent"
FRONTEND_DIR="$DEPLOY_DIR/task-client/task-client"

# 端口配置
BACKEND_PORT=8080
FRONTEND_PORT=3000
POSTGRES_PORT=5432
REDIS_PORT=6379

# 日志目录
LOG_DIR="$DEPLOY_DIR/logs"
BACKEND_LOG="$LOG_DIR/backend.log"
FRONTEND_LOG="$LOG_DIR/frontend.log"

# PID 文件
BACKEND_PID="$DEPLOY_DIR/backend.pid"
FRONTEND_PID="$DEPLOY_DIR/frontend.pid"

################################################################################
# 工具函数
################################################################################

print_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_separator() {
    echo -e "${BLUE}========================================${NC}"
}

# 检查命令是否存在
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# 检查端口是否被占用
check_port() {
    local port=$1
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1 || netstat -tuln | grep -q ":$port "; then
        return 0  # 端口被占用
    else
        return 1  # 端口空闲
    fi
}

# 等待端口启动
wait_for_port() {
    local port=$1
    local timeout=${2:-60}
    local count=0

    print_info "等待端口 $port 启动..."
    while [ $count -lt $timeout ]; do
        if check_port $port; then
            print_success "端口 $port 已启动"
            return 0
        fi
        sleep 1
        count=$((count + 1))
    done

    print_error "端口 $port 启动超时"
    return 1
}

################################################################################
# 环境检查和安装
################################################################################

# 检查操作系统
check_os() {
    if [ -f /etc/os-release ]; then
        . /etc/os-release
        OS=$ID
        OS_VERSION=$VERSION_ID
        print_info "检测到操作系统: $PRETTY_NAME"
    else
        print_error "无法识别操作系统"
        exit 1
    fi
}

# 安装 Docker
install_docker() {
    if command_exists docker; then
        print_success "Docker 已安装"
        return 0
    fi

    print_info "开始安装 Docker..."

    case $OS in
        ubuntu|debian)
            sudo apt-get update
            sudo apt-get install -y apt-transport-https ca-certificates curl software-properties-common
            curl -fsSL https://download.docker.com/linux/$OS/gpg | sudo apt-key add -
            sudo add-apt-repository "deb [arch=amd64] https://download.docker.com/linux/$OS $(lsb_release -cs) stable"
            sudo apt-get update
            sudo apt-get install -y docker-ce docker-ce-cli containerd.io
            ;;
        centos|rhel)
            sudo yum install -y yum-utils
            sudo yum-config-manager --add-repo https://download.docker.com/linux/centos/docker-ce.repo
            sudo yum install -y docker-ce docker-ce-cli containerd.io
            sudo systemctl start docker
            sudo systemctl enable docker
            ;;
        *)
            print_error "不支持的操作系统: $OS"
            exit 1
            ;;
    esac

    # 将当前用户添加到 docker 组
    sudo usermod -aG docker $USER
    print_success "Docker 安装完成"
}

# 安装 Docker Compose
install_docker_compose() {
    if command_exists docker-compose || docker compose version >/dev/null 2>&1; then
        print_success "Docker Compose 已安装"
        return 0
    fi

    print_info "开始安装 Docker Compose..."
    sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    sudo chmod +x /usr/local/bin/docker-compose
    print_success "Docker Compose 安装完成"
}

# 安装 Java 21
install_java() {
    if command_exists java; then
        JAVA_VERSION=$(java -version 2>&1 | awk -F '"' '/version/ {print $2}' | cut -d'.' -f1)
        if [ "$JAVA_VERSION" -ge 21 ]; then
            print_success "Java $JAVA_VERSION 已安装"
            return 0
        else
            print_warning "当前 Java 版本为 $JAVA_VERSION，需要升级到 Java 21"
        fi
    fi

    print_info "开始安装 Java 21..."

    case $OS in
        ubuntu|debian)
            sudo apt-get update
            sudo apt-get install -y openjdk-21-jdk
            ;;
        centos|rhel)
            sudo yum install -y java-21-openjdk java-21-openjdk-devel
            ;;
        *)
            print_error "不支持的操作系统: $OS"
            exit 1
            ;;
    esac

    print_success "Java 21 安装完成"
}

# 安装 Node.js
install_nodejs() {
    if command_exists node; then
        NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
        if [ "$NODE_VERSION" -ge 18 ]; then
            print_success "Node.js $NODE_VERSION 已安装"
            return 0
        fi
    fi

    print_info "开始安装 Node.js 18..."

    # 使用 NodeSource 仓库
    curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
    sudo apt-get install -y nodejs

    print_success "Node.js 安装完成"
}

# 安装 Git
install_git() {
    if command_exists git; then
        print_success "Git 已安装"
        return 0
    fi

    print_info "开始安装 Git..."

    case $OS in
        ubuntu|debian)
            sudo apt-get update
            sudo apt-get install -y git
            ;;
        centos|rhel)
            sudo yum install -y git
            ;;
        *)
            print_error "不支持的操作系统: $OS"
            exit 1
            ;;
    esac

    print_success "Git 安装完成"
}

################################################################################
# Docker Compose 配置生成
################################################################################

create_docker_compose() {
    print_info "创建 Docker Compose 配置文件..."

    cat > "$DEPLOY_DIR/docker-compose.yml" <<'EOF'
version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    container_name: task-postgres
    restart: always
    environment:
      POSTGRES_DB: task_db
      POSTGRES_USER: task_user
      POSTGRES_PASSWORD: task_password_2024
      TZ: Asia/Shanghai
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    networks:
      - task-network
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U task_user -d task_db"]
      interval: 10s
      timeout: 5s
      retries: 5

  redis:
    image: redis:7-alpine
    container_name: task-redis
    restart: always
    command: redis-server --requirepass task_redis_2024 --appendonly yes
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    networks:
      - task-network
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5

volumes:
  postgres_data:
    driver: local
  redis_data:
    driver: local

networks:
  task-network:
    driver: bridge
EOF

    print_success "Docker Compose 配置文件创建完成"
}

################################################################################
# 主要功能函数
################################################################################

# 1. 主部署脚本
main_deploy() {
    print_separator
    print_info "开始主部署流程..."
    print_separator

    # 检查操作系统
    check_os

    # 安装依赖
    print_info "步骤 1/8: 检查并安装依赖..."
    install_git
    install_docker
    install_docker_compose
    install_java
    install_nodejs

    # 创建部署目录
    print_info "步骤 2/8: 创建部署目录..."
    sudo mkdir -p "$DEPLOY_DIR"
    sudo chown -R $USER:$USER "$DEPLOY_DIR"
    mkdir -p "$LOG_DIR"

    # 克隆项目
    print_info "步骤 3/8: 克隆项目代码..."
    if [ -d "$DEPLOY_DIR/.git" ]; then
        print_warning "项目已存在，跳过克隆"
    else
        cd "$(dirname "$DEPLOY_DIR")"
        git clone "$GITHUB_REPO" "$(basename "$DEPLOY_DIR")"
        print_success "项目克隆完成"
    fi

    # 创建 Docker Compose 配置
    print_info "步骤 4/8: 创建 Docker Compose 配置..."
    create_docker_compose

    # 启动数据库服务
    print_info "步骤 5/8: 启动 PostgreSQL 和 Redis..."
    cd "$DEPLOY_DIR"
    docker-compose up -d
    sleep 5

    # 等待数据库就绪
    print_info "等待数据库服务启动..."
    wait_for_port $POSTGRES_PORT 30
    wait_for_port $REDIS_PORT 30

    # 构建后端
    print_info "步骤 6/8: 构建后端项目..."
    cd "$BACKEND_DIR"
    chmod +x gradlew
    ./gradlew clean build -x test
    print_success "后端构建完成"

    # 安装前端依赖
    print_info "步骤 7/8: 安装前端依赖..."
    cd "$FRONTEND_DIR"
    npm install --registry=https://registry.npmmirror.com
    print_success "前端依赖安装完成"

    # 启动服务
    print_info "步骤 8/8: 启动服务..."
    start_backend
    sleep 5
    start_frontend

    print_separator
    print_success "部署完成！"
    print_separator
    echo ""
    print_info "服务访问地址:"
    echo -e "  前端: ${GREEN}http://localhost:$FRONTEND_PORT${NC}"
    echo -e "  后端: ${GREEN}http://localhost:$BACKEND_PORT${NC}"
    echo ""
    print_info "数据库信息:"
    echo "  PostgreSQL: localhost:$POSTGRES_PORT"
    echo "  Redis: localhost:$REDIS_PORT"
    echo ""
}

# 2. 启动后端服务
start_backend() {
    print_separator
    print_info "启动后端服务..."
    print_separator

    # 检查端口
    if check_port $BACKEND_PORT; then
        print_warning "后端端口 $BACKEND_PORT 已被占用"
        read -p "是否停止现有服务并重启? (y/n): " choice
        if [ "$choice" = "y" ]; then
            stop_backend
        else
            return 1
        fi
    fi

    # 检查后端目录
    if [ ! -d "$BACKEND_DIR" ]; then
        print_error "后端目录不存在: $BACKEND_DIR"
        print_info "请先运行主部署脚本 (选项 1)"
        return 1
    fi

    # 检查数据库
    if ! check_port $POSTGRES_PORT; then
        print_warning "PostgreSQL 未启动，正在启动..."
        cd "$DEPLOY_DIR"
        docker-compose up -d postgres redis
        wait_for_port $POSTGRES_PORT 30
    fi

    # 启动后端
    cd "$BACKEND_DIR"
    print_info "正在启动后端服务..."

    nohup ./gradlew :bootstrap:bootRun > "$BACKEND_LOG" 2>&1 &
    echo $! > "$BACKEND_PID"

    # 等待启动
    if wait_for_port $BACKEND_PORT 60; then
        print_success "后端服务启动成功"
        print_info "日志文件: $BACKEND_LOG"
        print_info "访问地址: http://localhost:$BACKEND_PORT"
    else
        print_error "后端服务启动失败"
        print_info "查看日志: tail -f $BACKEND_LOG"
        return 1
    fi
}

# 3. 启动前端服务
start_frontend() {
    print_separator
    print_info "启动前端服务..."
    print_separator

    # 检查端口
    if check_port $FRONTEND_PORT; then
        print_warning "前端端口 $FRONTEND_PORT 已被占用"
        read -p "是否停止现有服务并重启? (y/n): " choice
        if [ "$choice" = "y" ]; then
            stop_frontend
        else
            return 1
        fi
    fi

    # 检查前端目录
    if [ ! -d "$FRONTEND_DIR" ]; then
        print_error "前端目录不存在: $FRONTEND_DIR"
        print_info "请先运行主部署脚本 (选项 1)"
        return 1
    fi

    # 检查依赖
    if [ ! -d "$FRONTEND_DIR/node_modules" ]; then
        print_info "安装前端依赖..."
        cd "$FRONTEND_DIR"
        npm install --registry=https://registry.npmmirror.com
    fi

    # 构建前端
    cd "$FRONTEND_DIR"
    print_info "构建前端项目..."
    npm run build

    # 启动前端
    print_info "正在启动前端服务..."
    nohup npm run start > "$FRONTEND_LOG" 2>&1 &
    echo $! > "$FRONTEND_PID"

    # 等待启动
    if wait_for_port $FRONTEND_PORT 60; then
        print_success "前端服务启动成功"
        print_info "日志文件: $FRONTEND_LOG"
        print_info "访问地址: http://localhost:$FRONTEND_PORT"
    else
        print_error "前端服务启动失败"
        print_info "查看日志: tail -f $FRONTEND_LOG"
        return 1
    fi
}

# 停止后端服务
stop_backend() {
    if [ -f "$BACKEND_PID" ]; then
        PID=$(cat "$BACKEND_PID")
        if ps -p $PID > /dev/null 2>&1; then
            print_info "停止后端服务 (PID: $PID)..."
            kill $PID
            sleep 2
            if ps -p $PID > /dev/null 2>&1; then
                kill -9 $PID
            fi
            rm -f "$BACKEND_PID"
            print_success "后端服务已停止"
        else
            rm -f "$BACKEND_PID"
        fi
    fi

    # 额外检查端口
    if check_port $BACKEND_PORT; then
        print_warning "端口 $BACKEND_PORT 仍被占用，尝试强制停止..."
        PID=$(lsof -ti:$BACKEND_PORT)
        if [ -n "$PID" ]; then
            kill -9 $PID
            print_success "已强制停止占用端口的进程"
        fi
    fi
}

# 停止前端服务
stop_frontend() {
    if [ -f "$FRONTEND_PID" ]; then
        PID=$(cat "$FRONTEND_PID")
        if ps -p $PID > /dev/null 2>&1; then
            print_info "停止前端服务 (PID: $PID)..."
            kill $PID
            sleep 2
            if ps -p $PID > /dev/null 2>&1; then
                kill -9 $PID
            fi
            rm -f "$FRONTEND_PID"
            print_success "前端服务已停止"
        else
            rm -f "$FRONTEND_PID"
        fi
    fi

    # 额外检查端口
    if check_port $FRONTEND_PORT; then
        print_warning "端口 $FRONTEND_PORT 仍被占用，尝试强制停止..."
        PID=$(lsof -ti:$FRONTEND_PORT)
        if [ -n "$PID" ]; then
            kill -9 $PID
            print_success "已强制停止占用端口的进程"
        fi
    fi
}

# 4. 停止所有服务
stop_all() {
    print_separator
    print_info "停止所有服务..."
    print_separator

    # 停止前端
    print_info "停止前端服务..."
    stop_frontend

    # 停止后端
    print_info "停止后端服务..."
    stop_backend

    # 停止数据库
    print_info "停止数据库服务..."
    if [ -f "$DEPLOY_DIR/docker-compose.yml" ]; then
        cd "$DEPLOY_DIR"
        docker-compose stop
        print_success "数据库服务已停止"
    fi

    print_separator
    print_success "所有服务已停止"
    print_separator
}

# 5. 查看服务状态
check_status() {
    print_separator
    print_info "服务状态检查"
    print_separator
    echo ""

    # 检查前端
    echo -e "${BLUE}前端服务:${NC}"
    if check_port $FRONTEND_PORT; then
        echo -e "  状态: ${GREEN}运行中${NC}"
        echo "  端口: $FRONTEND_PORT"
        if [ -f "$FRONTEND_PID" ]; then
            PID=$(cat "$FRONTEND_PID")
            echo "  PID: $PID"
        fi
        echo "  访问: http://localhost:$FRONTEND_PORT"
    else
        echo -e "  状态: ${RED}未运行${NC}"
    fi
    echo ""

    # 检查后端
    echo -e "${BLUE}后端服务:${NC}"
    if check_port $BACKEND_PORT; then
        echo -e "  状态: ${GREEN}运行中${NC}"
        echo "  端口: $BACKEND_PORT"
        if [ -f "$BACKEND_PID" ]; then
            PID=$(cat "$BACKEND_PID")
            echo "  PID: $PID"
        fi
        echo "  访问: http://localhost:$BACKEND_PORT"
    else
        echo -e "  状态: ${RED}未运行${NC}"
    fi
    echo ""

    # 检查 PostgreSQL
    echo -e "${BLUE}PostgreSQL:${NC}"
    if check_port $POSTGRES_PORT; then
        echo -e "  状态: ${GREEN}运行中${NC}"
        echo "  端口: $POSTGRES_PORT"
        CONTAINER_ID=$(docker ps -q -f name=task-postgres)
        if [ -n "$CONTAINER_ID" ]; then
            echo "  容器: $CONTAINER_ID"
        fi
    else
        echo -e "  状态: ${RED}未运行${NC}"
    fi
    echo ""

    # 检查 Redis
    echo -e "${BLUE}Redis:${NC}"
    if check_port $REDIS_PORT; then
        echo -e "  状态: ${GREEN}运行中${NC}"
        echo "  端口: $REDIS_PORT"
        CONTAINER_ID=$(docker ps -q -f name=task-redis)
        if [ -n "$CONTAINER_ID" ]; then
            echo "  容器: $CONTAINER_ID"
        fi
    else
        echo -e "  状态: ${RED}未运行${NC}"
    fi
    echo ""

    # 日志文件
    echo -e "${BLUE}日志文件:${NC}"
    if [ -f "$BACKEND_LOG" ]; then
        echo "  后端: $BACKEND_LOG"
    fi
    if [ -f "$FRONTEND_LOG" ]; then
        echo "  前端: $FRONTEND_LOG"
    fi
    echo ""

    print_separator
}


# 6. 更新部署
update_deploy() {
    print_separator
    print_info "更新部署 - 拉取最新代码并重启"
    print_separator

    # 检查项目目录
    if [ \! -d "$DEPLOY_DIR/.git" ]; then
        print_error "项目目录不存在或不是 Git 仓库"
        print_info "请先运行主部署脚本 (选项 1)"
        return 1
    fi

    # 停止服务
    print_info "步骤 1/5: 停止现有服务..."
    stop_frontend
    stop_backend

    # 备份当前版本
    print_info "步骤 2/5: 备份当前版本..."
    cd "$DEPLOY_DIR"
    BACKUP_DIR="$DEPLOY_DIR/backup_$(date +%Y%m%d_%H%M%S)"
    mkdir -p "$BACKUP_DIR"

    # 保存当前 commit
    CURRENT_COMMIT=$(git rev-parse HEAD)
    echo "$CURRENT_COMMIT" > "$BACKUP_DIR/commit.txt"
    print_info "当前版本: $CURRENT_COMMIT"

    # 拉取最新代码
    print_info "步骤 3/5: 拉取最新代码..."
    git fetch origin

    # 显示更新内容
    print_info "更新内容:"
    git log HEAD..origin/master --oneline | head -10

    read -p "是否继续更新? (y/n): " choice
    if [ "$choice" \!= "y" ]; then
        print_warning "取消更新"
        return 0
    fi

    # 执行更新
    git pull origin master
    NEW_COMMIT=$(git rev-parse HEAD)

    if [ "$CURRENT_COMMIT" = "$NEW_COMMIT" ]; then
        print_info "代码已是最新版本"
    else
        print_success "代码更新完成"
        print_info "新版本: $NEW_COMMIT"
    fi

    # 重新构建后端
    print_info "步骤 4/5: 重新构建后端..."
    cd "$BACKEND_DIR"
    ./gradlew clean build -x test
    print_success "后端构建完成"

    # 更新前端依赖
    print_info "更新前端依赖..."
    cd "$FRONTEND_DIR"
    npm install --registry=https://registry.npmmirror.com

    # 重启服务
    print_info "步骤 5/5: 重启服务..."
    start_backend
    sleep 5
    start_frontend

    print_separator
    print_success "更新部署完成！"
    print_separator
    echo ""
    print_info "备份目录: $BACKUP_DIR"
    print_info "如需回滚，执行: cd $DEPLOY_DIR && git reset --hard $CURRENT_COMMIT"
    echo ""
}

################################################################################
# 主菜单
################################################################################

show_menu() {
    clear
    echo -e "${BLUE}"
    echo "╔════════════════════════════════════════════════════════════╗"
    echo "║                                                            ║"
    echo "║          Task 项目 Linux 自动化部署脚本                   ║"
    echo "║                                                            ║"
    echo "║          项目地址: github.com/2928807938/Task             ║"
    echo "║                                                            ║"
    echo "╚════════════════════════════════════════════════════════════╝"
    echo -e "${NC}"
    echo ""
    echo -e "${GREEN}请选择操作:${NC}"
    echo ""
    echo "  1) 主部署脚本 - 自动安装环境并部署"
    echo "  2) 启动后端服务"
    echo "  3) 启动前端服务"
    echo "  4) 停止所有服务"
    echo "  5) 查看服务状态"
    echo "  6) 更新部署 - 拉取最新代码并重启"
    echo "  0) 退出"
    echo ""
    echo -e "${YELLOW}提示: 首次部署请选择选项 1${NC}"
    echo ""
}

# 主程序
main() {
    while true; do
        show_menu
        read -p "请输入选项 [0-6]: " choice
        echo ""

        case $choice in
            1)
                main_deploy
                ;;
            2)
                start_backend
                ;;
            3)
                start_frontend
                ;;
            4)
                stop_all
                ;;
            5)
                check_status
                ;;
            6)
                update_deploy
                ;;
            0)
                print_info "退出脚本"
                exit 0
                ;;
            *)
                print_error "无效的选项，请重新选择"
                ;;
        esac

        echo ""
        read -p "按 Enter 键继续..."
    done
}

# 脚本入口
if [ "$EUID" -eq 0 ]; then
    print_error "请不要使用 root 用户运行此脚本"
    print_info "正确用法: ./deploy-linux.sh"
    exit 1
fi

main
