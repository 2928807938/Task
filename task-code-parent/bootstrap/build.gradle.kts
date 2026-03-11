import java.io.ByteArrayOutputStream

plugins {
    kotlin("jvm")
    kotlin("plugin.spring")
    id("org.springframework.boot")
    id("io.spring.dependency-management")
    // 启用GraalVM插件，支持原生镜像编译
    id("org.graalvm.buildtools.native")
}

repositories {
    // 阿里云公共仓库
    maven { url = uri("https://maven.aliyun.com/repository/public") }
    // 阿里云谷歌仓库
    maven { url = uri("https://maven.aliyun.com/repository/google") }
    // 阿里云Spring仓库
    maven { url = uri("https://maven.aliyun.com/repository/spring") }
    // 阿里云中央仓库
    maven { url = uri("https://maven.aliyun.com/repository/central") }
    // 阿里云Gradle插件仓库
    maven { url = uri("https://maven.aliyun.com/repository/gradle-plugin") }
    // 保留官方仓库作为备用
    mavenCentral()
    gradlePluginPortal()
}

dependencies {
    implementation(project(":web"))
    implementation(project(":shared"))
    
    implementation("org.springframework.boot:spring-boot-starter")
    implementation("org.jetbrains.kotlin:kotlin-reflect")
    implementation("org.jetbrains.kotlin:kotlin-stdlib")
    
    // Spring Context Indexer可以提高启动性能
    implementation("org.springframework:spring-context-indexer")
    
    // GraalVM本地镜像支持 - 不需要显式依赖添加
    // Spring Boot 3.x已经内置了AOT支持
    // 只需要保留context-indexer用于提高启动性能
    annotationProcessor("org.springframework:spring-context-indexer")
}

tasks.bootJar {
    enabled = true
    archiveFileName.set("${rootProject.name}.jar")
}

tasks.jar {
    enabled = true
}

// GraalVM Native 配置
graalvmNative {
    // 仅保留AOT支持，禁用原生镜像构建
    metadataRepository {
        enabled.set(true)
    }
}

// Spring Boot配置
springBoot {
    mainClass.set("com.task.bootstrap.TaskCodeApplicationKt")
}

// 原GraalVM原生镜像构建任务已删除，仅保留AOT优化

// 添加AOT处理任务
tasks.register("processAotOptimization") {
    group = "build"
    description = "处理Spring AOT优化"
    dependsOn("bootJar")
    
    doLast {
        println("\n========== 开始AOT处理 ==========\n")
        println("当前步骤: 生成AOT元数据")
        
        exec {
            workingDir = projectDir
            commandLine("java",
                "-jar", "${buildDir}/libs/${rootProject.name}.jar",
                "--spring.aot.enabled=true"
            )
        }
        
        println("\n========== AOT处理完成 ==========\n")
    }
}
