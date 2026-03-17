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

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

GITHUB_REPO="git@github.com:2928807938/Task.git"
GIT_SSH_KEY_PATH="${HOME}/.ssh/task_github_deploy"
SERVER_SSH_KEY_SOURCE="/Users/tanghulu/Downloads"
PROJECT_NAME="Task"
SCRIPT_PATH="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/$(basename "${BASH_SOURCE[0]}")"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DEPLOY_DIR="$SCRIPT_DIR"
BACKEND_DIR="$DEPLOY_DIR/task-code-parent"
FRONTEND_DIR="$DEPLOY_DIR/task-client/task-client"
BACKEND_BOOTSTRAP_DIR="$BACKEND_DIR/bootstrap"
BACKEND_JAR_PATH="$BACKEND_BOOTSTRAP_DIR/build/libs/task-code-parent.jar"

BACKEND_PORT=8080
FRONTEND_PORT=3000
POSTGRES_PORT=5432
REDIS_PORT=6379

POSTGRES_DB="task_code_parent"
POSTGRES_USER="task_ark"
POSTGRES_PASSWORD="tanghulu040707"
REDIS_PASSWORD="tanghulu040707"

LOG_DIR="$DEPLOY_DIR/logs"
BACKEND_LOG="$LOG_DIR/backend.log"
FRONTEND_LOG="$LOG_DIR/frontend.log"

BACKEND_PID="$DEPLOY_DIR/backend.pid"
FRONTEND_PID="$DEPLOY_DIR/frontend.pid"

GIT_CLONE_RETRIES=3
GIT_CLONE_RETRY_DELAY=5
GIT_FETCH_RETRIES=3
GIT_FETCH_RETRY_DELAY=10
GIT_CONNECT_TIMEOUT=10
GIT_SSH_CONTROL_PATH="${HOME}/.ssh/task-github-%r@%h:%p"
GRADLE_VERSION="8.11.1"
GRADLE_DOWNLOAD_URL="https://mirrors.cloud.tencent.com/gradle/gradle-${GRADLE_VERSION}-bin.zip"
GRADLE_INSTALL_DIR="/opt/gradle"
GRADLE_USER_HOME_DIR="$BACKEND_DIR/.gradle-user-home"
NPM_REGISTRY="https://registry.npmmirror.com"
ENABLE_AUTO_CACHE_CLEANUP=1

print_info() { echo -e "${BLUE}[INFO]${NC} $1"; }
print_success() { echo -e "${GREEN}[SUCCESS]${NC} $1"; }
print_warning() { echo -e "${YELLOW}[WARNING]${NC} $1"; }
print_error() { echo -e "${RED}[ERROR]${NC} $1"; }
print_separator() { echo -e "${BLUE}========================================${NC}"; }
command_exists() { command -v "$1" >/dev/null 2>&1; }

APT_LOCK_TIMEOUT=600
APT_LOCK_WAIT_INTERVAL=5

get_apt_lock_holder() {
    local lock_file=$1
    local holder=""

    if command_exists fuser; then
        holder=$(sudo fuser "$lock_file" 2>/dev/null | tr '\n' ' ' | sed 's/^\s*//;s/\s*$//')
    fi

    if [ -z "$holder" ] && command_exists lsof; then
        holder=$(sudo lsof -t "$lock_file" 2>/dev/null | tr '\n' ' ' | sed 's/^\s*//;s/\s*$//')
    fi

    printf '%s' "$holder"
}

wait_for_apt_lock_release() {
    local timeout=${1:-$APT_LOCK_TIMEOUT}
    local waited=0
    local lock_files="/var/lib/dpkg/lock-frontend /var/lib/dpkg/lock /var/cache/apt/archives/lock /var/lib/apt/lists/lock"

    while true; do
        local blocked=0
        local lock_file
        local active_lock=""
        local holder=""

        for lock_file in $lock_files; do
            [ -e "$lock_file" ] || continue
            holder=$(get_apt_lock_holder "$lock_file")
            if [ -n "$holder" ]; then
                blocked=1
                active_lock="$lock_file"
                break
            fi
        done

        if [ "$blocked" -eq 0 ]; then
            return 0
        fi

        if [ "$waited" -eq 0 ]; then
            print_warning "检测到 apt/dpkg 锁被占用，正在等待释放: $active_lock"
        fi

        if [ "$waited" -ge "$timeout" ]; then
            print_error "等待 apt/dpkg 锁超时 (${timeout}s)，占用进程: ${holder:-未知}"
            print_info "如果是 unattended-upgrades，建议等待系统自动更新完成后重试"
            return 1
        fi

        print_info "apt/dpkg 锁占用中，${APT_LOCK_WAIT_INTERVAL} 秒后重试（已等待 ${waited}s/${timeout}s），进程: ${holder:-未知}"
        sleep "$APT_LOCK_WAIT_INTERVAL"
        waited=$((waited + APT_LOCK_WAIT_INTERVAL))
    done
}

apt_get_safe() {
    wait_for_apt_lock_release "$APT_LOCK_TIMEOUT"
    sudo DEBIAN_FRONTEND=noninteractive apt-get -o DPkg::Lock::Timeout="$APT_LOCK_TIMEOUT" "$@"
}

clean_apt_cache() {
    case $OS in
        ubuntu|debian)
            print_info "清理 apt 缓存..."
            apt_get_safe clean || true
            apt_get_safe autoclean || true
            sudo rm -rf /var/lib/apt/lists/* 2>/dev/null || true
            ;;
    esac
}

cleanup_gradle_cache() {
    if [ -d "$HOME/.gradle/caches" ]; then
        print_info "清理 Gradle 缓存..."
        rm -rf "$HOME/.gradle/caches"
    fi
}

cleanup_gradle_kotlin_dsl_cache() {
    local gradle_cache_root="$HOME/.gradle/caches"
    local local_gradle_cache_root="$GRADLE_USER_HOME_DIR/caches"

    if [ ! -d "$gradle_cache_root" ]; then
        mkdir -p "$GRADLE_USER_HOME_DIR"
    fi

    print_info "清理可能损坏的 Gradle Kotlin DSL 缓存..."
    rm -rf "$gradle_cache_root/$GRADLE_VERSION/kotlin-dsl" 2>/dev/null || true
    rm -rf "$gradle_cache_root/$GRADLE_VERSION/generated-gradle-jars" 2>/dev/null || true
    rm -rf "$local_gradle_cache_root/$GRADLE_VERSION/kotlin-dsl" 2>/dev/null || true
    rm -rf "$local_gradle_cache_root/$GRADLE_VERSION/generated-gradle-jars" 2>/dev/null || true
}

cleanup_npm_cache() {
    if command_exists npm; then
        print_info "清理 npm 缓存..."
        npm cache clean --force >/dev/null 2>&1 || true
    fi
    rm -rf "$HOME/.npm/_cacache" 2>/dev/null || true
}

cleanup_frontend_build_cache() {
    if [ -d "$FRONTEND_DIR/.next/cache" ]; then
        print_info "清理 Next.js 构建缓存..."
        rm -rf "$FRONTEND_DIR/.next/cache"
    fi
}

cleanup_backend_build_artifacts() {
    local build_dirs="
$BACKEND_DIR/build
$BACKEND_BOOTSTRAP_DIR/build/tmp
$BACKEND_BOOTSTRAP_DIR/build/classes
$BACKEND_BOOTSTRAP_DIR/build/resources
"
    local target
    while IFS= read -r target; do
        [ -z "$target" ] && continue
        if [ -d "$target" ]; then
            print_info "清理后端构建缓存: $target"
            rm -rf "$target"
        fi
    done <<EOF
$build_dirs
EOF
}

cleanup_deployment_caches() {
    if [ "$ENABLE_AUTO_CACHE_CLEANUP" != "1" ]; then
        return 0
    fi

    print_separator
    print_info "开始自动清理部署缓存..."
    print_separator
    clean_apt_cache
    cleanup_npm_cache
    cleanup_gradle_cache
    cleanup_frontend_build_cache
    cleanup_backend_build_artifacts
    print_success "部署缓存清理完成"
}

resolve_deploy_dir() {
    DEPLOY_DIR="$SCRIPT_DIR"
    BACKEND_DIR="$DEPLOY_DIR/task-code-parent"
    FRONTEND_DIR="$DEPLOY_DIR/task-client/task-client"
    BACKEND_BOOTSTRAP_DIR="$BACKEND_DIR/bootstrap"
    BACKEND_JAR_PATH="$BACKEND_BOOTSTRAP_DIR/build/libs/task-code-parent.jar"
    LOG_DIR="$DEPLOY_DIR/logs"
    BACKEND_LOG="$LOG_DIR/backend.log"
    FRONTEND_LOG="$LOG_DIR/frontend.log"
    BACKEND_PID="$DEPLOY_DIR/backend.pid"
    FRONTEND_PID="$DEPLOY_DIR/frontend.pid"
}

cleanup_deploy_dir_preserving_script() {
    local deploy_dir="$1"
    local script_name
    script_name="$(basename "$SCRIPT_PATH")"

    if [ ! -d "$deploy_dir" ]; then
        mkdir -p "$deploy_dir"
        return 0
    fi

    local item
    shopt -s dotglob nullglob
    for item in "$deploy_dir"/*; do
        if [ "$(basename "$item")" = "$script_name" ]; then
            continue
        fi
        rm -rf "$item"
    done
    shopt -u dotglob nullglob
}

ensure_runtime_dirs() {
    mkdir -p "$DEPLOY_DIR"
    mkdir -p "$LOG_DIR"
}

git_ssh_command() {
    local ssh_cmd="ssh -o StrictHostKeyChecking=accept-new -o ConnectTimeout=$GIT_CONNECT_TIMEOUT -o ConnectionAttempts=1 -o ServerAliveInterval=15 -o ServerAliveCountMax=2"
    if [ -d "$HOME/.ssh" ]; then
        ssh_cmd="$ssh_cmd -o ControlMaster=auto -o ControlPersist=10m -o ControlPath=$GIT_SSH_CONTROL_PATH"
    fi
    if [ -f "$GIT_SSH_KEY_PATH" ]; then
        ssh_cmd="$ssh_cmd -i $GIT_SSH_KEY_PATH"
    fi
    printf '%s' "$ssh_cmd"
}

run_git() {
    GIT_SSH_COMMAND="$(git_ssh_command)" git "$@"
}

validate_github_ssh_access() {
    if [ ! -f "$GIT_SSH_KEY_PATH" ]; then
        print_error "未找到 GitHub SSH 私钥: $GIT_SSH_KEY_PATH"
        return 1
    fi

    print_info "校验 GitHub SSH 连接..."
    local ssh_output
    ssh_output=$(ssh -T $(git_ssh_command | sed 's/^ssh //') git@github.com 2>&1 || true)

    if printf '%s' "$ssh_output" | grep -Eq "successfully authenticated|Hi .*! You've successfully authenticated"; then
        print_success "GitHub SSH 认证成功"
        return 0
    fi

    print_error "GitHub SSH 认证失败"
    printf '%s\n' "$ssh_output"
    print_info "请确认以下几点:"
    echo "  1. 私钥文件存在且可用: $GIT_SSH_KEY_PATH"
    echo "  2. 该私钥对应的公钥已添加到 GitHub"
    echo "  3. 目标仓库允许该 GitHub 账号访问: $GITHUB_REPO"
    echo "  4. 服务器可访问 github.com:22"
    return 1
}

prepare_github_ssh_key() {
    if [ -f "$GIT_SSH_KEY_PATH" ]; then
        chmod 600 "$GIT_SSH_KEY_PATH" 2>/dev/null || true
        return 0
    fi

    mkdir -p "$HOME/.ssh"

    local key_file=""
    if [ -d "$SERVER_SSH_KEY_SOURCE" ]; then
        key_file=$(python3 - <<'PY'
import os

base = "/Users/tanghulu/Downloads"
for name in sorted(os.listdir(base)):
    lowered = name.lower()
    if "task" in lowered or "github" in lowered or name.endswith((".pem", ".key")):
        path = os.path.join(base, name)
        if os.path.isfile(path):
            print(path)
            break
PY
)
    fi

    if [ -n "$key_file" ] && ssh-keygen -y -f "$key_file" >/dev/null 2>&1; then
        cp "$key_file" "$GIT_SSH_KEY_PATH"
        chmod 600 "$GIT_SSH_KEY_PATH"
        print_success "已从 $key_file 安装 GitHub SSH 私钥到 $GIT_SSH_KEY_PATH"
        return 0
    fi

    print_warning "未在 $SERVER_SSH_KEY_SOURCE 自动找到可用的 GitHub SSH 私钥"
    print_info "请确认 GitHub 对应的私钥已放到: $GIT_SSH_KEY_PATH"
    print_info "对应公钥应已添加到 GitHub: ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIPPbs02//lMIvRJF6s2U4Q9U4nPI7NQs86pHoXifwG5c task-github-deploy"
}

is_rhel_like_os() {
    case $OS in
        centos|rhel|rocky|almalinux|opencloudos|anolis|ol)
            return 0
            ;;
        *)
            return 1
            ;;
    esac
}

pkg_install() {
    if command_exists dnf; then
        sudo dnf install -y "$@"
    else
        sudo yum install -y "$@"
    fi
}

install_gradle() {
    if command_exists gradle; then
        print_success "Gradle 已安装"
        return 0
    fi

    print_info "开始安装 Gradle..."
    case $OS in
        ubuntu|debian)
            apt_get_safe update
            apt_get_safe install -y gradle unzip
            ;;
        *)
            if is_rhel_like_os; then
                if command_exists dnf; then
                    sudo dnf install -y gradle unzip || pkg_install unzip
                else
                    sudo yum install -y gradle unzip || pkg_install unzip
                fi
            else
                print_error "不支持的操作系统: $OS"
                exit 1
            fi
            ;;
    esac

    if ! command_exists gradle; then
        print_warning "系统仓库未提供 Gradle，尝试安装官方发行版 ${GRADLE_VERSION}"
        sudo mkdir -p "$GRADLE_INSTALL_DIR"
        local gradle_zip="/tmp/gradle-${GRADLE_VERSION}-bin.zip"
        curl -L "$GRADLE_DOWNLOAD_URL" -o "$gradle_zip"
        sudo rm -rf "$GRADLE_INSTALL_DIR/gradle-${GRADLE_VERSION}"
        sudo unzip -qo "$gradle_zip" -d "$GRADLE_INSTALL_DIR"
        sudo ln -sfn "$GRADLE_INSTALL_DIR/gradle-${GRADLE_VERSION}/bin/gradle" /usr/local/bin/gradle
        rm -f "$gradle_zip"
    fi

    if ! command_exists gradle; then
        print_error "Gradle 安装失败"
        return 1
    fi

    print_success "Gradle 安装完成"
}

ensure_gradle_wrapper_jar() {
    local wrapper_jar="$BACKEND_DIR/gradle/wrapper/gradle-wrapper.jar"
    local wrapper_properties="$BACKEND_DIR/gradle/wrapper/gradle-wrapper.properties"

    if [ -f "$wrapper_jar" ]; then
        if [ -f "$wrapper_properties" ]; then
            sed -i "s@^distributionUrl=.*@distributionUrl=https\\://mirrors.cloud.tencent.com/gradle/gradle-${GRADLE_VERSION}-bin.zip@" "$wrapper_properties"
        fi
        return 0
    fi

    print_warning "未找到 gradle-wrapper.jar，尝试自动生成"
    if ! command_exists gradle; then
        install_gradle
    fi

    (
        cd "$BACKEND_DIR"
        gradle wrapper
    )

    if [ -f "$wrapper_properties" ]; then
        sed -i "s@^distributionUrl=.*@distributionUrl=https\\://mirrors.cloud.tencent.com/gradle/gradle-${GRADLE_VERSION}-bin.zip@" "$wrapper_properties"
    fi

    if [ ! -f "$wrapper_jar" ]; then
        print_error "gradle-wrapper.jar 自动生成失败"
        return 1
    fi

    print_success "已生成 gradle-wrapper.jar"
}

run_gradle_build() {
    cleanup_gradle_kotlin_dsl_cache
    ensure_gradle_wrapper_jar
    mkdir -p "$GRADLE_USER_HOME_DIR"

    if [ -f "$BACKEND_DIR/gradle/wrapper/gradle-wrapper.jar" ]; then
        chmod +x "$BACKEND_DIR/gradlew"
        GRADLE_USER_HOME="$GRADLE_USER_HOME_DIR" "$BACKEND_DIR/gradlew" clean :bootstrap:bootJar -x test --refresh-dependencies
        return 0
    fi

    print_warning "未找到 gradle-wrapper.jar，跳过 gradlew，改用系统 Gradle 构建"
    if ! command_exists gradle; then
        install_gradle
    fi

    GRADLE_USER_HOME="$GRADLE_USER_HOME_DIR" gradle -p "$BACKEND_DIR" clean :bootstrap:bootJar -x test --refresh-dependencies
}

ensure_gradlew_executable() {
    if [ ! -f "$BACKEND_DIR/gradlew" ]; then
        print_error "未找到 Gradle 启动脚本: $BACKEND_DIR/gradlew"
        return 1
    fi

    chmod +x "$BACKEND_DIR/gradlew"
}

clone_repository() {
    local target_parent_dir=$1
    local target_name=$2
    local attempt=1

    cd "$target_parent_dir"
    while [ "$attempt" -le "$GIT_CLONE_RETRIES" ]; do
        if run_git clone "$GITHUB_REPO" "$target_name"; then
            print_success "项目克隆完成"
            return 0
        fi

        rm -rf "$target_name"
        if [ "$attempt" -lt "$GIT_CLONE_RETRIES" ]; then
            print_warning "项目克隆失败，${GIT_CLONE_RETRY_DELAY} 秒后重试 (${attempt}/${GIT_CLONE_RETRIES})"
            sleep "$GIT_CLONE_RETRY_DELAY"
        fi
        attempt=$((attempt + 1))
    done

    print_error "项目克隆失败，已重试 ${GIT_CLONE_RETRIES} 次: $GITHUB_REPO"
    return 1
}

checkout_repository_branch() {
    local repo_dir=$1
    local preferred_branch=${2:-}

    if [ ! -d "$repo_dir/.git" ]; then
        print_error "目录不是 Git 仓库: $repo_dir"
        return 1
    fi

    cd "$repo_dir"

    local target_branch="$preferred_branch"
    if [ -z "$target_branch" ]; then
        target_branch=$(git symbolic-ref --quiet refs/remotes/origin/HEAD 2>/dev/null | sed 's@^refs/remotes/origin/@@')
    fi
    if [ -z "$target_branch" ]; then
        target_branch=$(git branch --show-current)
    fi
    if [ -z "$target_branch" ]; then
        target_branch="master"
    fi

    print_info "切换到分支: $target_branch"
    run_git checkout "$target_branch"
}

ensure_latest_repository_code() {
    local repo_dir=$1
    local preferred_branch=${2:-}
    local attempt=1

    if [ ! -d "$repo_dir/.git" ]; then
        print_error "目录不是 Git 仓库: $repo_dir"
        return 1
    fi

    cd "$repo_dir"

    while [ "$attempt" -le "$GIT_FETCH_RETRIES" ]; do
        print_info "检查远程仓库最新状态... (尝试 ${attempt}/${GIT_FETCH_RETRIES})"
        if run_git fetch --prune origin; then
            break
        fi

        if [ "$attempt" -lt "$GIT_FETCH_RETRIES" ]; then
            print_warning "获取远程代码失败，${GIT_FETCH_RETRY_DELAY} 秒后重试"
            sleep "$GIT_FETCH_RETRY_DELAY"
        else
            print_error "获取远程最新代码失败，已重试 ${GIT_FETCH_RETRIES} 次"
            return 1
        fi

        attempt=$((attempt + 1))
    done

    local target_branch="$preferred_branch"
    if [ -z "$target_branch" ]; then
        target_branch=$(git symbolic-ref --quiet refs/remotes/origin/HEAD 2>/dev/null | sed 's@^refs/remotes/origin/@@')
    fi
    if [ -z "$target_branch" ]; then
        target_branch=$(git branch --show-current)
    fi
    if [ -z "$target_branch" ]; then
        target_branch="master"
    fi

    checkout_repository_branch "$repo_dir" "$target_branch"

    local local_commit
    local remote_commit
    local base_commit
    local status_message

    local_commit=$(run_git rev-parse HEAD)
    remote_commit=$(run_git rev-parse "origin/$target_branch")
    base_commit=$(run_git merge-base HEAD "origin/$target_branch")

    if [ "$local_commit" = "$remote_commit" ]; then
        print_success "当前已经是最新代码: ${local_commit:0:7}"
        return 0
    fi

    if [ "$local_commit" = "$base_commit" ]; then
        status_message="检测到远程有新提交，开始拉取最新代码"
    elif [ "$remote_commit" = "$base_commit" ]; then
        status_message="检测到本地代码领先远程，继续后续部署流程"
        print_warning "$status_message"
        return 0
    else
        status_message="检测到本地与远程分支已分叉，使用远程最新代码覆盖本地"
    fi

    print_info "$status_message"
    run_git reset --hard "origin/$target_branch"
    print_success "已同步到最新代码: $(run_git rev-parse --short HEAD)"
}

check_port() {
    local port=$1
    if command_exists ss; then
        ss -lnt | awk '{print $4}' | grep -qE ":${port}$"
        return $?
    elif command_exists lsof; then
        lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1
        return $?
    elif command_exists netstat; then
        netstat -tuln | grep -q ":$port "
        return $?
    else
        print_warning "未找到 ss/lsof/netstat，无法检查端口 $port"
        return 1
    fi
}

wait_for_port() {
    local port=$1
    local timeout=${2:-60}
    local count=0
    print_info "等待端口 $port 启动..."
    while [ $count -lt $timeout ]; do
        if check_port "$port"; then
            print_success "端口 $port 已启动"
            return 0
        fi
        sleep 1
        count=$((count + 1))
    done
    print_error "端口 $port 启动超时"
    return 1
}

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

install_utils() {
    case $OS in
        ubuntu|debian)
            apt_get_safe update
            apt_get_safe install -y lsof iproute2 curl gnupg ca-certificates software-properties-common psmisc
            ;;
        *)
            if is_rhel_like_os; then
                pkg_install lsof iproute curl ca-certificates gnupg2
            fi
            ;;
    esac
}

install_java() {
    if command_exists java; then
        JAVA_VERSION=$(java -version 2>&1 | awk -F '"' '/version/ {print $2}' | cut -d'.' -f1)
        if [ "$JAVA_VERSION" -ge 21 ]; then
            print_success "Java $JAVA_VERSION 已安装"
            return 0
        fi
        print_warning "当前 Java 版本为 $JAVA_VERSION，需要升级到 Java 21"
    fi
    print_info "开始安装 Java 21..."
    case $OS in
        ubuntu|debian)
            apt_get_safe update
            apt_get_safe install -y openjdk-21-jdk
            ;;
        *)
            if is_rhel_like_os; then
                pkg_install java-21-openjdk java-21-openjdk-devel
            else
                print_error "不支持的操作系统: $OS"
                exit 1
            fi
            ;;
    esac
    print_success "Java 21 安装完成"
}

install_nodejs() {
    if command_exists node; then
        NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
        if [ "$NODE_VERSION" -ge 18 ]; then
            print_success "Node.js $NODE_VERSION 已安装"
            return 0
        fi
    fi
    print_info "开始安装 Node.js 18..."
    case $OS in
        ubuntu|debian)
            curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
            apt_get_safe install -y nodejs
            ;;
        centos|rhel|rocky|almalinux|anolis|ol)
            curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -
            pkg_install nodejs
            ;;
        opencloudos)
            if command_exists dnf; then
                sudo dnf module reset -y nodejs || true
                sudo dnf module enable -y nodejs:18 || true
            fi
            pkg_install nodejs npm
            ;;
        *)
            print_error "不支持的操作系统: $OS"
            exit 1
            ;;
    esac
    if command_exists node; then
        NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
        if [ "$NODE_VERSION" -lt 18 ]; then
            print_error "Node.js 安装后版本过低: $(node -v)，需要 18+"
            exit 1
        fi
    fi
    print_success "Node.js 安装完成"
}

install_git() {
    if command_exists git; then
        print_success "Git 已安装"
        return 0
    fi
    print_info "开始安装 Git..."
    case $OS in
        ubuntu|debian)
            apt_get_safe update
            apt_get_safe install -y git
            ;;
        *)
            if is_rhel_like_os; then
                pkg_install git
            else
                print_error "不支持的操作系统: $OS"
                exit 1
            fi
            ;;
    esac
    print_success "Git 安装完成"
}

install_postgresql() {
    if command_exists psql && check_port "$POSTGRES_PORT"; then
        print_success "PostgreSQL 已安装并运行"
        return 0
    fi
    print_info "开始安装 PostgreSQL..."
    case $OS in
        ubuntu|debian)
            apt_get_safe update
            apt_get_safe install -y postgresql postgresql-contrib
            ;;
        *)
            if is_rhel_like_os; then
                pkg_install postgresql-server postgresql-contrib
            if [ ! -d /var/lib/pgsql/data/base ]; then
                sudo postgresql-setup --initdb || true
            fi
            else
                print_error "不支持的操作系统: $OS"
                exit 1
            fi
            ;;
    esac
    sudo systemctl enable postgresql || true
    sudo systemctl restart postgresql || sudo systemctl restart postgresql-16 || sudo systemctl restart postgresql-15 || true
    wait_for_port "$POSTGRES_PORT" 60
    print_success "PostgreSQL 安装完成"
}

configure_postgresql() {
    print_info "配置 PostgreSQL 数据库和用户..."
    sudo systemctl start postgresql || sudo systemctl start postgresql-16 || sudo systemctl start postgresql-15 || true
    sudo -u postgres psql -d postgres -tc "SELECT 1 FROM pg_database WHERE datname = '${POSTGRES_DB}'" | grep -q 1 || \
        sudo -u postgres psql -d postgres -c "CREATE DATABASE ${POSTGRES_DB};"
    sudo -u postgres psql -d postgres -tc "SELECT 1 FROM pg_roles WHERE rolname = '${POSTGRES_USER}'" | grep -q 1 || \
        sudo -u postgres psql -d postgres -c "CREATE USER ${POSTGRES_USER} WITH PASSWORD '${POSTGRES_PASSWORD}';"
    sudo -u postgres psql -d postgres -c "ALTER USER ${POSTGRES_USER} WITH PASSWORD '${POSTGRES_PASSWORD}';"
    sudo -u postgres psql -d postgres -c "GRANT ALL PRIVILEGES ON DATABASE ${POSTGRES_DB} TO ${POSTGRES_USER};"
    print_success "PostgreSQL 配置完成"
}

get_postgresql_hba_config() {
    local candidates="
/etc/postgresql/${OS_VERSION}/main/pg_hba.conf
/etc/postgresql/16/main/pg_hba.conf
/etc/postgresql/15/main/pg_hba.conf
/var/lib/pgsql/data/pg_hba.conf
/var/lib/pgsql/16/data/pg_hba.conf
/var/lib/pgsql/15/data/pg_hba.conf
"
    local path
    while IFS= read -r path; do
        [ -z "$path" ] && continue
        if [ -f "$path" ]; then
            printf '%s' "$path"
            return 0
        fi
    done <<EOF
$candidates
EOF

    sudo -u postgres psql -t -P format=unaligned -c "SHOW hba_file;" 2>/dev/null | head -n 1
}

configure_postgresql_authentication() {
    print_info "配置 PostgreSQL 本地认证方式为密码认证..."
    local pg_hba
    pg_hba=$(get_postgresql_hba_config)

    if [ -z "$pg_hba" ] || [ ! -f "$pg_hba" ]; then
        print_error "未找到 pg_hba.conf，无法自动配置 PostgreSQL 认证方式"
        return 1
    fi

    sudo cp "$pg_hba" "${pg_hba}.bak"
    sudo python3 - "$pg_hba" <<'PY'
import pathlib
import re
import sys

config_path = pathlib.Path(sys.argv[1])
lines = config_path.read_text().splitlines()
updated = []

patterns = [
    (re.compile(r'^\s*local\s+all\s+postgres\s+'), 'local   all             postgres                                peer'),
    (re.compile(r'^\s*local\s+all\s+all\s+'), 'local   all             all                                     peer'),
    (re.compile(r'^\s*host\s+all\s+all\s+127\.0\.0\.1/32\s+'), 'host    all             all             127.0.0.1/32            md5'),
    (re.compile(r'^\s*host\s+all\s+all\s+::1/128\s+'), 'host    all             all             ::1/128                 md5'),
]

matched = [False, False, False, False]

for line in lines:
    replaced = False
    for index, (pattern, replacement) in enumerate(patterns):
        if pattern.match(line) and not line.lstrip().startswith('#'):
            updated.append(replacement)
            matched[index] = True
            replaced = True
            break
    if not replaced:
        updated.append(line)

for index, found in enumerate(matched):
    if not found:
        updated.append(patterns[index][1])

config_path.write_text('\n'.join(updated) + '\n')
PY

    sudo systemctl restart postgresql || sudo systemctl restart postgresql-16 || sudo systemctl restart postgresql-15 || true
    wait_for_port "$POSTGRES_PORT" 60
    print_success "PostgreSQL 认证方式已更新: $pg_hba"
}

install_redis() {
    if command_exists redis-server && check_port "$REDIS_PORT"; then
        print_success "Redis 已安装并运行"
        return 0
    fi
    print_info "开始安装 Redis..."
    case $OS in
        ubuntu|debian)
            apt_get_safe update
            apt_get_safe install -y redis-server
            ;;
        *)
            if is_rhel_like_os; then
                pkg_install redis
            else
                print_error "不支持的操作系统: $OS"
                exit 1
            fi
            ;;
    esac
    print_success "Redis 安装完成"
}

configure_redis() {
    print_info "配置 Redis 密码..."
    local redis_conf="/etc/redis/redis.conf"
    if [ ! -f "$redis_conf" ] && [ -f /etc/redis.conf ]; then
        redis_conf="/etc/redis.conf"
    fi
    if [ ! -f "$redis_conf" ]; then
        print_error "未找到 Redis 配置文件"
        return 1
    fi
    sudo python3 - "$redis_conf" "$REDIS_PASSWORD" <<'PY'
import pathlib
import sys

config_path = pathlib.Path(sys.argv[1])
password = sys.argv[2]
lines = config_path.read_text().splitlines()
updated = []
replaced = False

for line in lines:
    stripped = line.lstrip()
    if stripped.startswith('requirepass ') or stripped.startswith('# requirepass ') or stripped.startswith('#requirepass '):
        updated.append(f'requirepass {password}')
        replaced = True
    else:
        updated.append(line)

if not replaced:
    updated.append(f'requirepass {password}')

config_path.write_text('\n'.join(updated) + '\n')
PY
    if ! sudo grep -q "^requirepass ${REDIS_PASSWORD}$" "$redis_conf"; then
        echo "requirepass ${REDIS_PASSWORD}" | sudo tee -a "$redis_conf" >/dev/null
    fi
    sudo systemctl enable redis-server 2>/dev/null || sudo systemctl enable redis 2>/dev/null || true
    sudo systemctl restart redis-server 2>/dev/null || sudo systemctl restart redis 2>/dev/null || true
    wait_for_port "$REDIS_PORT" 60
    print_success "Redis 配置完成"
}

ensure_local_app_config() {
    if [ ! -d "$BACKEND_DIR/bootstrap/src/main/resources" ]; then
        return 0
    fi
    local config_file="$BACKEND_DIR/bootstrap/src/main/resources/application-prod.yml"
    if [ -f "$config_file" ]; then
        print_info "同步生产环境数据库与 Redis 地址为本机..."
        sed -i "s@r2dbc:postgresql://[^:]*:[0-9]*/${POSTGRES_DB}@r2dbc:postgresql://localhost:${POSTGRES_PORT}/${POSTGRES_DB}@" "$config_file"
        sed -i "s@username: .*@username: ${POSTGRES_USER}@" "$config_file"
        sed -i "s@password: .*@password: ${POSTGRES_PASSWORD}@" "$config_file"
        sed -i "0,/host: .*/s//host: localhost/" "$config_file"
        sed -i "0,/port: 6379/s//port: ${REDIS_PORT}/" "$config_file"
        sed -i "0,/password: .*/s//password: ${REDIS_PASSWORD}/" "$config_file"
    fi
}

main_deploy() {
    print_separator
    print_info "开始主部署流程..."
    print_separator

    check_os
    resolve_deploy_dir
    print_info "当前脚本路径: $SCRIPT_PATH"
    print_info "部署目录: $DEPLOY_DIR"

    print_info "步骤 1/8: 检查并安装依赖..."
    install_utils
    install_git
    prepare_github_ssh_key
    validate_github_ssh_access
    install_java
    install_nodejs
    install_postgresql
    configure_postgresql_authentication
    configure_postgresql
    install_redis
    configure_redis

    print_info "步骤 2/8: 创建部署目录..."
    sudo mkdir -p "$DEPLOY_DIR"
    sudo chown -R $USER:$USER "$DEPLOY_DIR"
    mkdir -p "$LOG_DIR"

    print_info "步骤 3/8: 克隆项目代码..."
    if [ -d "$DEPLOY_DIR" ] && [ -n "$(ls -A "$DEPLOY_DIR" 2>/dev/null)" ]; then
        print_warning "首次部署会重新拉取代码，准备清理现有目录: $DEPLOY_DIR"
        cleanup_deploy_dir_preserving_script "$DEPLOY_DIR"
        print_success "已清理部署目录，并保留脚本: $(basename "$SCRIPT_PATH")"
    fi
    clone_repository "$(dirname "$DEPLOY_DIR")" "$(basename "$DEPLOY_DIR")"
    checkout_repository_branch "$DEPLOY_DIR"

    print_info "步骤 4/8: 校验本机数据库配置..."
    ensure_local_app_config

    print_info "步骤 5/8: 检查 PostgreSQL 和 Redis..."
    wait_for_port "$POSTGRES_PORT" 30
    wait_for_port "$REDIS_PORT" 30

    print_info "步骤 6/8: 构建后端项目..."
    cd "$BACKEND_DIR"
    run_gradle_build
    print_success "后端构建完成"

    print_info "步骤 7/8: 安装前端依赖..."
    cd "$FRONTEND_DIR"
    npm install --registry=https://registry.npmmirror.com
    print_success "前端依赖安装完成"

    print_info "步骤 8/8: 启动服务..."
    start_backend
    sleep 5
    start_frontend
    cleanup_deployment_caches

    print_separator
    print_success "部署完成！"
    print_separator
    print_info "服务访问地址:"
    echo -e "  前端: ${GREEN}http://localhost:$FRONTEND_PORT${NC}"
    echo -e "  后端: ${GREEN}http://localhost:$BACKEND_PORT${NC}"
    print_info "数据库信息:"
    echo "  PostgreSQL: localhost:$POSTGRES_PORT"
    echo "  Redis: localhost:$REDIS_PORT"
}

start_backend() {
    ensure_runtime_dirs
    print_separator
    print_info "启动后端服务..."
    print_separator
    if check_port "$BACKEND_PORT"; then
        print_warning "后端端口 $BACKEND_PORT 已被占用"
        read -p "是否停止现有服务并重启? (y/n): " choice
        if [ "$choice" = "y" ]; then
            stop_backend
        else
            return 1
        fi
    fi
    if [ ! -d "$BACKEND_DIR" ]; then
        print_error "后端目录不存在: $BACKEND_DIR"
        print_info "请先运行主部署脚本 (选项 1)"
        return 1
    fi
    if ! check_port "$POSTGRES_PORT"; then
        print_warning "PostgreSQL 未启动，正在启动..."
        sudo systemctl restart postgresql || sudo systemctl restart postgresql-16 || sudo systemctl restart postgresql-15 || true
        wait_for_port "$POSTGRES_PORT" 30
    fi
    if ! check_port "$REDIS_PORT"; then
        print_warning "Redis 未启动，正在启动..."
        sudo systemctl restart redis-server 2>/dev/null || sudo systemctl restart redis 2>/dev/null || true
        wait_for_port "$REDIS_PORT" 30
    fi
    cd "$BACKEND_DIR"
    ensure_gradlew_executable
    print_info "正在启动后端服务..."
    if [ ! -f "$BACKEND_JAR_PATH" ]; then
        print_info "未找到后端 JAR，先执行构建..."
        run_gradle_build
    fi
    if [ ! -f "$BACKEND_JAR_PATH" ]; then
        print_error "未找到后端 JAR: $BACKEND_JAR_PATH"
        return 1
    fi
    nohup java --enable-preview -jar "$BACKEND_JAR_PATH" --spring.profiles.active=prod > "$BACKEND_LOG" 2>&1 &
    echo $! > "$BACKEND_PID"
    if wait_for_port "$BACKEND_PORT" 120; then
        print_success "后端服务启动成功"
        print_info "日志文件: $BACKEND_LOG"
        print_info "访问地址: http://localhost:$BACKEND_PORT"
    else
        print_error "后端服务启动失败"
        print_info "查看日志: tail -f $BACKEND_LOG"
        return 1
    fi
}

start_frontend() {
    ensure_runtime_dirs
    print_separator
    print_info "启动前端服务..."
    print_separator
    if check_port "$FRONTEND_PORT"; then
        print_warning "前端端口 $FRONTEND_PORT 已被占用"
        read -p "是否停止现有服务并重启? (y/n): " choice
        if [ "$choice" = "y" ]; then
            stop_frontend
        else
            return 1
        fi
    fi
    if [ ! -d "$FRONTEND_DIR" ]; then
        print_error "前端目录不存在: $FRONTEND_DIR"
        print_info "请先运行主部署脚本 (选项 1)"
        return 1
    fi
    if [ ! -d "$FRONTEND_DIR/node_modules" ]; then
        print_info "安装前端依赖..."
        cd "$FRONTEND_DIR"
        npm install --registry="$NPM_REGISTRY"
    fi
    cd "$FRONTEND_DIR"
    print_info "构建前端项目..."
    npm run build
    print_info "正在启动前端服务..."
    nohup npm run start -- -p "$FRONTEND_PORT" > "$FRONTEND_LOG" 2>&1 &
    echo $! > "$FRONTEND_PID"
    if wait_for_port "$FRONTEND_PORT" 60; then
        print_success "前端服务启动成功"
        print_info "日志文件: $FRONTEND_LOG"
        print_info "访问地址: http://localhost:$FRONTEND_PORT"
    else
        print_error "前端服务启动失败"
        print_info "查看日志: tail -f $FRONTEND_LOG"
        return 1
    fi
}

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
    if check_port "$BACKEND_PORT"; then
        print_warning "端口 $BACKEND_PORT 仍被占用，尝试强制停止..."
        PID=$(lsof -ti:$BACKEND_PORT)
        if [ -n "$PID" ]; then
            kill -9 $PID
            print_success "已强制停止占用端口的进程"
        fi
    fi
}

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
    if check_port "$FRONTEND_PORT"; then
        print_warning "端口 $FRONTEND_PORT 仍被占用，尝试强制停止..."
        PID=$(lsof -ti:$FRONTEND_PORT)
        if [ -n "$PID" ]; then
            kill -9 $PID
            print_success "已强制停止占用端口的进程"
        fi
    fi
}

stop_all() {
    print_separator
    print_info "停止所有服务..."
    print_separator
    print_info "停止前端服务..."
    stop_frontend
    print_info "停止后端服务..."
    stop_backend
    print_info "停止数据库服务..."
    sudo systemctl stop redis-server 2>/dev/null || sudo systemctl stop redis 2>/dev/null || true
    sudo systemctl stop postgresql || sudo systemctl stop postgresql-16 || sudo systemctl stop postgresql-15 || true
    print_success "数据库服务已停止"
    print_separator
    print_success "所有服务已停止"
    print_separator
}

check_status() {
    print_separator
    print_info "服务状态检查"
    print_separator
    echo ""
    echo -e "${BLUE}前端服务:${NC}"
    if check_port "$FRONTEND_PORT"; then
        echo -e "  状态: ${GREEN}运行中${NC}"
        echo "  端口: $FRONTEND_PORT"
        [ -f "$FRONTEND_PID" ] && echo "  PID: $(cat "$FRONTEND_PID")"
        echo "  访问: http://localhost:$FRONTEND_PORT"
    else
        echo -e "  状态: ${RED}未运行${NC}"
    fi
    echo ""
    echo -e "${BLUE}后端服务:${NC}"
    if check_port "$BACKEND_PORT"; then
        echo -e "  状态: ${GREEN}运行中${NC}"
        echo "  端口: $BACKEND_PORT"
        [ -f "$BACKEND_PID" ] && echo "  PID: $(cat "$BACKEND_PID")"
        echo "  访问: http://localhost:$BACKEND_PORT"
    else
        echo -e "  状态: ${RED}未运行${NC}"
    fi
    echo ""
    echo -e "${BLUE}PostgreSQL:${NC}"
    if check_port "$POSTGRES_PORT"; then
        echo -e "  状态: ${GREEN}运行中${NC}"
        echo "  端口: $POSTGRES_PORT"
        command_exists systemctl && systemctl is-active postgresql 2>/dev/null | sed 's/^/  服务: /' || true
    else
        echo -e "  状态: ${RED}未运行${NC}"
    fi
    echo ""
    echo -e "${BLUE}Redis:${NC}"
    if check_port "$REDIS_PORT"; then
        echo -e "  状态: ${GREEN}运行中${NC}"
        echo "  端口: $REDIS_PORT"
        command_exists systemctl && (systemctl is-active redis-server 2>/dev/null || systemctl is-active redis 2>/dev/null) | sed 's/^/  服务: /' || true
    else
        echo -e "  状态: ${RED}未运行${NC}"
    fi
    echo ""
    echo -e "${BLUE}日志文件:${NC}"
    [ -f "$BACKEND_LOG" ] && echo "  后端: $BACKEND_LOG"
    [ -f "$FRONTEND_LOG" ] && echo "  前端: $FRONTEND_LOG"
    echo ""
    print_separator
}

update_deploy() {
    print_separator
    print_info "更新部署 - 拉取最新代码并重启"
    print_separator
    resolve_deploy_dir
    if [ ! -d "$DEPLOY_DIR/.git" ]; then
        print_error "项目目录不存在或不是 Git 仓库"
        print_info "请先运行主部署脚本 (选项 1)"
        return 1
    fi
    print_info "步骤 1/5: 停止现有服务..."
    stop_frontend
    stop_backend
    print_info "步骤 2/5: 备份当前版本..."
    cd "$DEPLOY_DIR"
    BACKUP_DIR="$DEPLOY_DIR/backup_$(date +%Y%m%d_%H%M%S)"
    mkdir -p "$BACKUP_DIR"
    CURRENT_COMMIT=$(git rev-parse HEAD)
    echo "$CURRENT_COMMIT" > "$BACKUP_DIR/commit.txt"
    print_info "当前版本: $CURRENT_COMMIT"
    print_info "步骤 3/5: 拉取最新代码..."
    run_git fetch origin
    DEFAULT_BRANCH=$(run_git symbolic-ref --quiet refs/remotes/origin/HEAD 2>/dev/null | sed 's@^refs/remotes/origin/@@')
    [ -z "$DEFAULT_BRANCH" ] && DEFAULT_BRANCH=$(run_git branch --show-current)
    [ -z "$DEFAULT_BRANCH" ] && DEFAULT_BRANCH="master"
    print_info "更新内容:"
    run_git log HEAD..origin/$DEFAULT_BRANCH --oneline | head -10 || true
    ensure_latest_repository_code "$DEPLOY_DIR" "$DEFAULT_BRANCH"
    print_info "步骤 4/5: 重新构建项目..."
    ensure_local_app_config
    cd "$BACKEND_DIR"
    run_gradle_build
    cd "$FRONTEND_DIR"
    npm install --registry=https://registry.npmmirror.com
    npm run build
    print_info "步骤 5/5: 重启服务..."
    start_backend
    sleep 5
    start_frontend
    cleanup_deployment_caches
    print_success "更新部署完成"
}

show_menu() {
    clear
    print_separator
    echo -e "${GREEN}Task 项目 Linux 自动化部署脚本${NC}"
    print_separator
    echo ""
    echo "请选择操作:"
    echo "  1. 主部署脚本 (首次部署)"
    echo "  2. 启动后端服务"
    echo "  3. 启动前端服务"
    echo "  4. 停止所有服务"
    echo "  5. 查看服务状态"
    echo "  6. 更新部署"
    echo "  0. 退出"
    echo ""
}

main() {
    while true; do
        show_menu
        read -p "请输入选项 [0-6]: " choice
        case $choice in
            1) main_deploy ;;
            2) start_backend ;;
            3) start_frontend ;;
            4) stop_all ;;
            5) check_status ;;
            6) update_deploy ;;
            0) print_info "退出脚本"; exit 0 ;;
            *) print_error "无效选项，请重新输入" ;;
        esac
        echo ""
        read -p "按回车键继续..." -r
    done
}

main
