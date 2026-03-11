#!/bin/bash
# 优化的JVM启动脚本
# 使用类数据共享和优化的JVM参数启动Spring Boot应用

# 显示信息函数
print_info() {
  echo -e "\033[1;34m[信息]\033[0m $1"
}

print_success() {
  echo -e "\033[1;32m[成功]\033[0m $1"
}

print_error() {
  echo -e "\033[1;31m[错误]\033[0m $1"
}

# 检查CDS文件是否存在
if [ ! -f "app-cds.jsa" ]; then
  print_error "找不到CDS文件(app-cds.jsa)！请先运行 ./optimize-jvm.sh 创建优化文件"
  exit 1
fi

# 查找应用JAR包
# 首先检查当前目录
APP_JAR="task-code-parent.jar"
if [ ! -f "$APP_JAR" ]; then
  # 如果当前目录没有，尝试查找其它位置
  APP_JAR=$(find . -name "*.jar" | grep -v "sources\|javadoc\|plain" | head -1)
  if [ -z "$APP_JAR" ]; then
    print_error "找不到应用JAR包！请确保部署包解压正确"
    exit 1
  fi
fi

# 显示实际路径
CURRENT_DIR=$(pwd)
print_info "当前目录: $CURRENT_DIR"

# 设置优化的JVM参数
JVM_OPTS="-server \
  -XX:+UseG1GC \
  -XX:MaxGCPauseMillis=100 \
  -XX:+ParallelRefProcEnabled \
  -Xmx512m \
  -Xms256m \
  -XX:+TieredCompilation \
  -XX:+UseCompressedOops \
  -XX:+UseStringDeduplication \
  -Xshare:on \
  -XX:SharedArchiveFile=app-cds.jsa \
  -XX:TieredStopAtLevel=1 \
  -Dspring.aot.enabled=true"

# 如果需要在生产环境设置相关参数
SPRING_OPTS="-Dspring.profiles.active=prod"

# 显示启动信息
print_info "使用优化参数启动应用..."
print_info "应用JAR包: $APP_JAR"
print_info "JVM参数: $JVM_OPTS"
print_info "Spring参数: $SPRING_OPTS"

# 启动应用
# 使用完整路径的Java命令，避免环境变量问题
java $JVM_OPTS $SPRING_OPTS -jar $APP_JAR
