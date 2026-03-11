#!/bin/bash
# 增强版JVM优化脚本：生成类数据共享(CDS)文件
# 作用：显著减少应用启动时间和内存占用

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

# 确保使用正确的JDK
export JAVA_HOME=/opt/java/graalvm-jdk-21.0.7+8.1
export PATH=$JAVA_HOME/bin:$PATH

# 步骤1: 尝试查找项目JAR包
print_info "查找项目JAR包..."

# 查找策略1: 首先在标准build目录查找
APP_JAR=$(find /opt/project/task-code-parent -path "*/bootstrap/build/libs/*.jar" -not -path "*/native/*" | grep -v "sources\|javadoc\|plain" | head -1)

# 查找策略2: 如果没找到，搜索整个项目目录
if [ -z "$APP_JAR" ]; then
  print_info "标准位置未找到JAR，扩大搜索范围..."
  APP_JAR=$(find /opt/project/task-code-parent -name "bootstrap*.jar" -not -path "*/gradle/*" | grep -v "sources\|javadoc" | head -1)
fi

# 查找策略3: 如果还是没找到，尝试手动构建
if [ -z "$APP_JAR" ]; then
  print_info "未找到已构建JAR包，尝试手动构建..."
  
  # 创建gradle.properties指定Java路径
  echo "org.gradle.java.home=$JAVA_HOME" > /opt/project/task-code-parent/gradle.properties
  
  # 尝试仅构建bootstrap模块
  cd /opt/project/task-code-parent
  $JAVA_HOME/bin/java -jar gradle/wrapper/gradle-wrapper.jar :bootstrap:bootJar -x test --no-daemon
  
  # 重新查找
  APP_JAR=$(find /opt/project/task-code-parent -path "*/bootstrap/build/libs/*.jar" -not -path "*/native/*" | grep -v "sources\|javadoc\|plain" | head -1)
fi

# 确认是否找到JAR
if [ -z "$APP_JAR" ]; then
  print_error "无法找到或构建应用JAR包，优化终止!"
  exit 1
fi

print_success "找到JAR包: $APP_JAR"

# 步骤2: 生成类列表
print_info "正在分析应用加载的类..."
$JAVA_HOME/bin/java -Xshare:off -XX:DumpLoadedClassList=app-classes.lst -jar $APP_JAR \
  --spring.main.web-application-type=none \
  --spring.profiles.active=prod \
  --spring.jmx.enabled=false \
  --logging.level.root=OFF &

PID=$!
sleep 20
kill $PID
print_success "类分析完成!"

# 步骤3: 创建CDS归档文件
print_info "正在生成CDS归档文件..."
$JAVA_HOME/bin/java -Xshare:dump -XX:SharedClassListFile=app-classes.lst \
  -XX:SharedArchiveFile=app-cds.jsa -jar $APP_JAR > /dev/null 2>&1

# 步骤4: 检查CDS文件
if [ -f "app-cds.jsa" ]; then
  print_success "CDS归档文件创建成功: $(du -h app-cds.jsa | cut -f1)"
else
  print_error "CDS归档文件创建失败，继续尝试简化方法..."
  
  # 尝试简化方法创建CDS文件
  print_info "使用简化方法重新尝试..."
  
  # 简化类列表生成
  $JAVA_HOME/bin/java -XX:DumpLoadedClassList=app-classes-simple.lst \
    -jar $APP_JAR --spring.profiles.active=prod --logging.level.root=OFF &
  
  PID=$!
  sleep 5
  kill $PID
  
  # 简化CDS创建
  $JAVA_HOME/bin/java -Xshare:dump -XX:SharedClassListFile=app-classes-simple.lst \
    -XX:SharedArchiveFile=app-cds.jsa -jar $APP_JAR
  
  if [ -f "app-cds.jsa" ]; then
    print_success "使用简化方法成功创建CDS文件: $(du -h app-cds.jsa | cut -f1)"
  else
    print_error "无法创建CDS文件，请检查Java版本兼容性"
    exit 1
  fi
fi

# 步骤5: 创建优化启动脚本
cat > start-optimized.sh << 'EOL'
#!/bin/bash

JAVA_HOME=/opt/java/graalvm-jdk-21.0.7+8.1

# 找到JAR包
APP_JAR=$(find /opt/project/task-code-parent -name "bootstrap*.jar" -not -path "*/gradle/*" | head -1)

echo "启动优化版应用..."
echo "JAR包: $APP_JAR"

$JAVA_HOME/bin/java \
  -Xshare:on \
  -XX:SharedArchiveFile=app-cds.jsa \
  -XX:+UseG1GC \
  -XX:MaxGCPauseMillis=100 \
  -XX:+ParallelRefProcEnabled \
  -Xmx512m \
  -Xms256m \
  -XX:+TieredCompilation \
  -XX:+UseCompressedOops \
  -XX:+UseStringDeduplication \
  -Dspring.profiles.active=prod \
  -jar $APP_JAR
EOL

chmod +x start-optimized.sh

# 步骤6: 显示使用说明
echo ""
print_info "优化文件已创建，启动应用时请使用以下命令："
echo ""
echo "  ./start-optimized.sh"
echo ""
print_info "或手动执行："
echo ""
echo "  java -Xshare:on -XX:SharedArchiveFile=app-cds.jsa -XX:+UseG1GC -Xms256m -Xmx512m -jar $APP_JAR"
echo ""
