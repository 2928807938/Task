#!/bin/bash

# 配置参数
COS_BUCKET="task-ark-image-1312085776"
COS_REGION="ap-shanghai"
DOWNLOAD_DIR="./downloads"
EXTRACT_DIR="./extracted"

# 定义颜色
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # 恢复默认颜色

# 打印带颜色的消息
print_info() {
    echo -e "${BLUE}[信息]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[成功]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[警告]${NC} $1"
}

print_error() {
    echo -e "${RED}[错误]${NC} $1"
}

# 清理旧文件
cleanup() {
    print_info "清理旧文件..."
    if [ -d "$DOWNLOAD_DIR" ]; then
        rm -rf "$DOWNLOAD_DIR"
    fi
    mkdir -p "$DOWNLOAD_DIR"
    
    if [ -d "$EXTRACT_DIR" ]; then
        rm -rf "$EXTRACT_DIR"
    fi
    mkdir -p "$EXTRACT_DIR"
}

# 检查命令是否存在
check_command() {
    if ! command -v $1 &> /dev/null; then
        print_error "命令 $1 未找到，请先安装"
        exit 1
    fi
}

# 检查必要的命令
check_command curl
check_command unzip

# 获取版本号（如果提供）
VERSION="$1"

# 设置下载URL
if [ -z "$VERSION" ]; then
    print_info "未指定版本号，将下载最新版本"
    DOWNLOAD_URL="https://${COS_BUCKET}.cos.${COS_REGION}.myqcloud.com/latest/task-client-latest.zip"
    OUTPUT_FILE="${DOWNLOAD_DIR}/task-client-latest.zip"
else
    # 对版本号进行清洗，只保留字母、数字、点和连字符
    CLEAN_VERSION=$(echo "$VERSION" | tr -cd '0-9a-zA-Z.-')
    if [ "$CLEAN_VERSION" != "$VERSION" ]; then
        print_warning "警告: 版本号包含特殊字符，已清理为: $CLEAN_VERSION"
        VERSION="$CLEAN_VERSION"
    fi
    
    print_info "将下载版本: v${VERSION}"
    
    # 尝试查找指定版本的README文件以获取确切的文件名
    README_URL="https://${COS_BUCKET}.cos.${COS_REGION}.myqcloud.com/releases/v${VERSION}/README.md"
    README_FILE="${DOWNLOAD_DIR}/readme.md"
    
    print_info "检查版本信息..."
    if curl -s -o "$README_FILE" "$README_URL"; then
        print_info "找到版本 v${VERSION} 的信息"
        
        # 从README中提取确切文件名
        FILE_PATTERN="task-client_v${VERSION}_[0-9]*\.zip"
        FOUND_FILE=$(grep -o "$FILE_PATTERN" "$README_FILE" | head -1)
        
        if [ -n "$FOUND_FILE" ]; then
            print_info "找到文件: $FOUND_FILE"
            DOWNLOAD_URL="https://${COS_BUCKET}.cos.${COS_REGION}.myqcloud.com/releases/v${VERSION}/${FOUND_FILE}"
            OUTPUT_FILE="${DOWNLOAD_DIR}/${FOUND_FILE}"
        else
            # 如果没有找到确切文件名，使用通用格式
            print_warning "未找到确切文件名，使用通用格式"
            DOWNLOAD_URL="https://${COS_BUCKET}.cos.${COS_REGION}.myqcloud.com/releases/v${VERSION}/task-client_v${VERSION}_*.zip"
            OUTPUT_FILE="${DOWNLOAD_DIR}/task-client_v${VERSION}.zip"
            
            # 列出目录内容查找匹配的文件
            print_info "尝试列出目录内容..."
            DIR_URL="https://${COS_BUCKET}.cos.${COS_REGION}.myqcloud.com/releases/v${VERSION}/"
            RESPONSE=$(curl -s "$DIR_URL")
            
            # 尝试从响应中提取文件名
            FILE_PATTERN="task-client_v${VERSION}_[0-9]+_[0-9]+\.zip"
            FOUND_FILE=$(echo "$RESPONSE" | grep -o "$FILE_PATTERN" | head -1)
            
            if [ -n "$FOUND_FILE" ]; then
                print_info "找到文件: $FOUND_FILE"
                DOWNLOAD_URL="https://${COS_BUCKET}.cos.${COS_REGION}.myqcloud.com/releases/v${VERSION}/${FOUND_FILE}"
                OUTPUT_FILE="${DOWNLOAD_DIR}/${FOUND_FILE}"
            else
                print_warning "无法找到确切文件名，将使用最新版本"
                DOWNLOAD_URL="https://${COS_BUCKET}.cos.${COS_REGION}.myqcloud.com/latest/task-client-latest.zip"
                OUTPUT_FILE="${DOWNLOAD_DIR}/task-client-latest.zip"
            fi
        fi
    else
        print_warning "无法获取版本 v${VERSION} 的信息，将使用最新版本"
        DOWNLOAD_URL="https://${COS_BUCKET}.cos.${COS_REGION}.myqcloud.com/latest/task-client-latest.zip"
        OUTPUT_FILE="${DOWNLOAD_DIR}/task-client-latest.zip"
    fi
fi

# 清理旧文件
cleanup

# 下载文件
print_info "开始下载: $DOWNLOAD_URL"
print_info "输出到: $OUTPUT_FILE"

if curl -# -o "$OUTPUT_FILE" "$DOWNLOAD_URL"; then
    print_success "下载完成"
else
    print_error "下载失败，请检查网络连接或版本号"
    exit 1
fi

# 解压文件
print_info "解压文件到 $EXTRACT_DIR"
unzip -q "$OUTPUT_FILE" -d "$EXTRACT_DIR"

if [ $? -ne 0 ]; then
    print_error "解压失败"
    exit 1
fi

# 查找start.sh脚本
print_info "查找启动脚本..."
START_SCRIPT=$(find "$EXTRACT_DIR" -name "start.sh" | head -1)

if [ -z "$START_SCRIPT" ]; then
    print_error "未找到启动脚本 start.sh"
    exit 1
fi

# 设置脚本为可执行
chmod +x "$START_SCRIPT"

# 进入解压目录
SCRIPT_DIR=$(dirname "$START_SCRIPT")
print_info "进入目录: $SCRIPT_DIR"
cd "$SCRIPT_DIR"

# 修改start.sh，去掉安装Node环境依赖的步骤
print_info "修改启动脚本，去掉Node环境安装步骤..."
if grep -q "npm install --production" "./start.sh"; then
    print_info "找到Node环境安装步骤，正在移除..."
    # 创建临时文件
    TEMP_FILE="$(mktemp)"
    # 使用sed删除npm install部分（包括前后的注释和错误检查）
    sed '/# 安装依赖/,/fi/d' "./start.sh" > "$TEMP_FILE"
    # 替换原文件
    mv "$TEMP_FILE" "./start.sh"
    # 确保脚本仍然可执行
    chmod +x "./start.sh"
    print_success "成功移除Node环境安装步骤"
else
    print_warning "未找到Node环境安装步骤，保持脚本不变"
fi

# 运行脚本
print_success "准备启动应用..."
./start.sh

# 完成
print_info "应用已启动"
