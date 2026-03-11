#!/bin/bash
# 全流程构建优化脚本：构建应用 -> 生成优化文件 -> 部署准备
# 作者：架构师助手

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

print_progress() {
  echo -e "\033[1;36m[进度 $1%]\033[0m $2"
}

# 确保使用正确的JDK
if [ -z "$JAVA_HOME" ]; then
  # 尝试自动检测JDK位置
  if [ -d "/opt/java/graalvm-jdk-21.0.7+8.1" ]; then
    export JAVA_HOME=/opt/java/graalvm-jdk-21.0.7+8.1
  elif [ -d "/usr/lib/jvm/graalvm-jdk-21" ]; then
    export JAVA_HOME=/usr/lib/jvm/graalvm-jdk-21
  elif [ -d "/Library/Java/JavaVirtualMachines/graalvm-jdk-21.jdk/Contents/Home" ]; then
    # macOS 路径
    export JAVA_HOME=/Library/Java/JavaVirtualMachines/graalvm-jdk-21.jdk/Contents/Home
  else
    print_info "未找到GraalVM JDK 21，使用系统默认Java"
    if ! command -v java &> /dev/null; then
      print_error "未找到Java，请安装JDK 21或设置JAVA_HOME环境变量"
      exit 1
    fi
  fi
  print_info "使用JAVA_HOME: $JAVA_HOME"
fi
export PATH=$JAVA_HOME/bin:$PATH

# 设置项目根目录
PROJECT_ROOT=$(pwd)
BOOTSTRAP_DIR=$PROJECT_ROOT/bootstrap
JAR_DIR=$BOOTSTRAP_DIR/build/libs

# 检查项目目录结构
if [ ! -d "$BOOTSTRAP_DIR" ]; then
  print_error "找不到bootstrap目录，请确保在项目根目录运行此脚本"
  print_info "当前目录: $(pwd)"
  exit 1
fi

# 步骤1: 清理并构建项目
print_progress "10" "开始构建项目..."

print_info "确认使用GraalVM $($JAVA_HOME/bin/java -version 2>&1 | head -1)"

# 创建gradle.properties确保使用正确的JDK
echo "org.gradle.java.home=$JAVA_HOME" > $PROJECT_ROOT/gradle.properties

# 清理之前的构建产物
print_info "清理构建目录..."
if [ -d "$BOOTSTRAP_DIR/build" ]; then
  rm -rf $BOOTSTRAP_DIR/build
  print_info "已清理旧的构建目录"
fi

# 执行构建
print_info "执行Gradle构建..."

# 首先检查系统Gradle
GRADLE_CMD=""
if [ -x "/opt/gradle/8.7/bin/gradle" ]; then
  GRADLE_CMD="/opt/gradle/8.7/bin/gradle"
  print_info "找到系统Gradle: /opt/gradle/8.7/bin/gradle"
elif command -v gradle &> /dev/null; then
  GRADLE_CMD="gradle"
  print_info "使用PATH中的Gradle: $(which gradle)"
else
  # 只有当系统Gradle不可用时才尝试Gradle Wrapper
  if [ -f "$PROJECT_ROOT/gradlew" ] && [ -f "$PROJECT_ROOT/gradle/wrapper/gradle-wrapper.jar" ]; then
    print_info "使用Gradle Wrapper执行构建..."
    chmod +x "$PROJECT_ROOT/gradlew"
    $PROJECT_ROOT/gradlew --init-script=$PROJECT_ROOT/gradle-init.gradle :bootstrap:bootJar -x test --no-daemon --refresh-dependencies
    GRADLE_RESULT=$?
    if [ $GRADLE_RESULT -eq 0 ]; then
      print_success "Gradle Wrapper构建成功"
    else
      print_error "Gradle Wrapper构建失败，请安装系统Gradle"
      exit 1
    fi
    return
  else
    print_error "找不到Gradle，请安装Gradle"
    print_info "可以使用以下命令安装Gradle:"
    print_info "  - macOS: brew install gradle"
    print_info "  - Ubuntu: sudo apt install gradle"
    print_info "  - CentOS: sudo yum install gradle"
    exit 1
  fi
fi

# 使用系统Gradle执行构建
print_info "使用系统Gradle执行构建: $GRADLE_CMD"
$GRADLE_CMD --init-script=$PROJECT_ROOT/gradle-init.gradle :bootstrap:bootJar -x test --no-daemon --refresh-dependencies

# 检查构建结果
if [ ! -d "$JAR_DIR" ] || [ -z "$(ls -A $JAR_DIR/*.jar 2>/dev/null)" ]; then
  print_error "构建失败！无法找到生成的JAR包"
  exit 1
fi

APP_JAR=$(find $JAR_DIR -name "*.jar" | grep -v "sources\|javadoc\|plain" | head -1)

if [ -z "$APP_JAR" ]; then
  print_error "无法找到构建的JAR包，请检查构建输出"
  exit 1
fi

print_success "项目构建完成: $APP_JAR"
print_progress "30" "构建完成，准备优化..."

# 步骤2: 生成类列表
print_info "正在分析应用加载的类..."

# 删除旧的优化文件
if [ -f "$PROJECT_ROOT/app-classes.lst" ]; then
  rm $PROJECT_ROOT/app-classes.lst
fi
if [ -f "$PROJECT_ROOT/app-cds.jsa" ]; then
  rm $PROJECT_ROOT/app-cds.jsa
fi

# 运行应用一段时间，收集类加载信息
print_info "启动应用收集类加载数据，这可能需要约20秒..."
cd "$PROJECT_ROOT"
$JAVA_HOME/bin/java -Xshare:off -XX:DumpLoadedClassList=app-classes.lst -jar $APP_JAR \
  --spring.main.web-application-type=none \
  --spring.jmx.enabled=false \
  --spring.profiles.active=prod \
  --logging.level.root=OFF &

# 记录进程ID
APP_PID=$!
print_info "应用已启动，进程ID: $APP_PID"

# 等待足够时间让应用初始化并加载关键类
sleep 20

# 终止应用
kill $APP_PID 2>/dev/null
sleep 2
# 确保进程已终止
kill -9 $APP_PID 2>/dev/null || true

print_success "类数据收集完毕!"
print_progress "60" "类数据分析完成，生成CDS文件..."

# 步骤3: 创建CDS归档文件
print_info "正在生成CDS归档文件..."
$JAVA_HOME/bin/java -Xshare:dump -XX:SharedClassListFile=app-classes.lst \
  -XX:SharedArchiveFile=app-cds.jsa -jar $APP_JAR > /dev/null 2>&1

# 步骤4: 验证CDS文件
if [ -f "app-cds.jsa" ]; then
  CDS_SIZE=$(du -h app-cds.jsa | cut -f1)
  print_success "CDS归档文件创建成功: ${CDS_SIZE}"
else
  print_error "CDS归档文件创建失败，尝试使用简化方法..."
  
  # 尝试使用简化方法创建CDS文件
  print_info "使用默认类路径创建CDS文件..."
  $JAVA_HOME/bin/java -XX:ArchiveClassesAtExit=app-cds.jsa -jar $APP_JAR \
    --spring.main.web-application-type=none \
    --spring.profiles.active=prod \
    --logging.level.root=OFF &
    
  APP_PID=$!
  sleep 10
  kill $APP_PID 2>/dev/null
  sleep 2
  kill -9 $APP_PID 2>/dev/null || true
  
  if [ -f "app-cds.jsa" ]; then
    CDS_SIZE=$(du -h app-cds.jsa | cut -f1)
    print_success "备用方法CDS归档文件创建成功: ${CDS_SIZE}"
  else
    print_error "无法创建CDS归档文件"
    exit 1
  fi
fi

print_progress "80" "CDS文件创建完成，准备优化启动脚本..."

# 步骤5: 确认优化启动脚本存在
if [ ! -f "$PROJECT_ROOT/start-optimized.sh" ]; then
  print_info "创建优化启动脚本..."
  cat > $PROJECT_ROOT/start-optimized.sh << EOL
#!/bin/bash
# 优化的JVM启动脚本 - 自动生成
# 使用类数据共享和优化的JVM参数启动Spring Boot应用

# 显示信息函数
print_info() {
  echo -e "\033[1;34m[信息]\033[0m \$1"
}

# 检查CDS文件是否存在
if [ ! -f "app-cds.jsa" ]; then
  echo -e "\033[1;31m[错误]\033[0m 找不到CDS文件(app-cds.jsa)！请先运行 ./build-and-optimize.sh 创建优化文件"
  exit 1
fi

# 应用JAR包 - 使用相对路径而非绝对路径
APP_JAR="./task-code-parent.jar"
# 复制JAR到当前目录
cp "${APP_JAR}" "./task-code-parent.jar"

# 设置优化的JVM参数
JVM_OPTS="-server \\
  -XX:+UseG1GC \\
  -XX:MaxGCPauseMillis=100 \\
  -XX:+ParallelRefProcEnabled \\
  -Xmx512m \\
  -Xms256m \\
  -XX:+TieredCompilation \\
  -XX:+UseCompressedOops \\
  -XX:+UseStringDeduplication \\
  -Xshare:on \\
  -XX:SharedArchiveFile=app-cds.jsa \\
  -XX:TieredStopAtLevel=1 \\
  -Dspring.aot.enabled=true"

# 生产环境参数
SPRING_OPTS="-Dspring.profiles.active=prod"

# 显示启动信息
print_info "使用优化参数启动应用..."
print_info "应用JAR包: \$APP_JAR"
print_info "JVM参数: \$JVM_OPTS"
print_info "Spring参数: \$SPRING_OPTS"

# 启动应用
java \$JVM_OPTS \$SPRING_OPTS -jar \$APP_JAR
EOL

  chmod +x $PROJECT_ROOT/start-optimized.sh
  print_success "优化启动脚本已创建: $PROJECT_ROOT/start-optimized.sh"
else
  print_info "优化启动脚本已存在，确保引用正确的JAR包"
  # 更新启动脚本中的JAR包路径
  sed -i "s|APP_JAR=.*|APP_JAR=\"$APP_JAR\"|g" $PROJECT_ROOT/start-optimized.sh
  print_success "优化启动脚本已更新"
fi

print_progress "100" "全流程优化完成!"

# 步骤6: 总结优化结果
print_info "优化过程完成，生成的优化产物:"
print_info "1. JAR包: $APP_JAR"
print_info "2. CDS优化文件: $(pwd)/app-cds.jsa (大小: ${CDS_SIZE})"
print_info "3. 优化启动脚本: $(pwd)/start-optimized.sh"

print_success "要使用优化启动，请执行: ./start-optimized.sh"
print_info "启动将使用CDS技术和优化的JVM参数，显著提升启动速度和内存利用率"
