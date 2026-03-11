import org.jetbrains.kotlin.gradle.dsl.JvmTarget
import org.jetbrains.kotlin.gradle.tasks.KotlinCompile

plugins {
    id("org.springframework.boot") version "3.2.3"
    id("io.spring.dependency-management") version "1.1.4"
    kotlin("jvm") version "2.1.0"
    kotlin("plugin.spring") version "2.1.0"
    // 启用GraalVM插件以支持原生镜像编译
    id("org.graalvm.buildtools.native") version "0.10.0"
    id("org.jlleitschuh.gradle.ktlint") version "12.0.3"
    id("io.gitlab.arturbosch.detekt") version "1.23.3"
    `maven-publish`
}

group = "com.task"
version = "0.0.1-SNAPSHOT"
java.sourceCompatibility = JavaVersion.VERSION_21
java.targetCompatibility = JavaVersion.VERSION_21

allprojects {
    tasks.withType<JavaCompile> {
        sourceCompatibility = "21"
        targetCompatibility = "21"
    }

    tasks.withType<KotlinCompile> {
        compilerOptions {
            freeCompilerArgs.addAll(listOf("-Xjsr305=strict", "-Xjvm-default=all", "-java-parameters"))
            jvmTarget.set(JvmTarget.JVM_21)
        }
    }
}

repositories {
    // 项目私有仓库 - 首先检查，优先级最高
    maven {
        name = "task-ark-server"
        url = uri("https://g-avsg8658-maven.pkg.coding.net/repository/task/task-ark-server/")
        credentials {
            username = "task-ark-server-1748240828487"
            password = "07ba8ab6cd934d369a72610f8ae5648b73f13e29"
        }
    }

    // 腾讯云镜像加速 - 但排除私有仓库的制品
    maven {
        name = "tencent-mirror"
        url = uri("https://mirrors.cloud.tencent.com/nexus/repository/maven-public/")
        content {
            // 排除私有仓库的组和制品，确保从私有仓库拉取
            excludeGroup("com.task")
        }
    }

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

// 统一管理版本号
val springdocVersion = "2.3.0"
val kotlinLoggingVersion = "3.0.5"
val mockkVersion = "1.13.8"
val springMockkVersion = "4.0.2"
val testcontainersVersion = "1.19.3"

dependencies {
    // Spring Boot 核心依赖
    implementation("org.springframework.boot:spring-boot-starter-webflux")
    implementation("org.springframework.boot:spring-boot-starter-data-r2dbc")
    implementation("org.springframework.boot:spring-boot-starter-validation")
    implementation("org.springframework.boot:spring-boot-starter-data-redis-reactive")
    implementation("org.springframework.boot:spring-boot-starter-aop")
    implementation("org.springframework.boot:spring-boot-starter-actuator")
    
    // GraalVM本地镜像支持 - 使用Spring Boot 3.x内置的AOT支持
    // 在Spring Boot 3.x中，AOT支持已经集成到核心依赖中
    // 不需要显式添加spring-boot-starter-aot依赖

    // Kotlin 支持
    implementation("com.fasterxml.jackson.module:jackson-module-kotlin")
    implementation("io.projectreactor.kotlin:reactor-kotlin-extensions")
    implementation("org.jetbrains.kotlin:kotlin-reflect")
    implementation("org.jetbrains.kotlin:kotlin-stdlib")
    implementation("org.jetbrains.kotlinx:kotlinx-coroutines-reactor")

    // 数据库驱动
    implementation("org.postgresql:r2dbc-postgresql")
    implementation("io.r2dbc:r2dbc-pool")

    // API 文档
    implementation("org.springdoc:springdoc-openapi-starter-webflux-ui:$springdocVersion")

    // 日志工具
    implementation("io.github.microutils:kotlin-logging-jvm:$kotlinLoggingVersion")

    // 开发工具
    developmentOnly("org.springframework.boot:spring-boot-devtools")

    // 测试依赖
    testImplementation("org.springframework.boot:spring-boot-starter-test") {
        exclude(group = "org.junit.vintage", module = "junit-vintage-engine")
    }
    testImplementation("io.projectreactor:reactor-test")
    testImplementation("io.mockk:mockk:$mockkVersion")
    testImplementation("com.ninja-squad:springmockk:$springMockkVersion")
    testImplementation("org.testcontainers:postgresql:$testcontainersVersion")
    testImplementation("org.testcontainers:r2dbc:$testcontainersVersion")
    testImplementation("org.testcontainers:junit-jupiter:$testcontainersVersion")
}

// Kotlin 编译配置
tasks.withType<KotlinCompile> {
    compilerOptions {
        freeCompilerArgs.addAll(listOf("-Xjsr305=strict", "-Xjvm-default=all", "-java-parameters"))
        jvmTarget.set(JvmTarget.JVM_21)
    }
}

// 配置 Java 编译器以启用预览特性
tasks.withType<JavaCompile> {
    options.compilerArgs.addAll(listOf("--enable-preview"))
}

// 配置所有任务启用预览特性
allprojects {
    tasks.withType<JavaExec> {
        jvmArgs("--enable-preview")
    }

    tasks.withType<Test> {
        jvmArgs("--enable-preview")
        useJUnitPlatform()
        testLogging {
            events("passed", "skipped", "failed")
        }
    }
}

// 测试配置
tasks.withType<Test> {
    useJUnitPlatform()
    testLogging {
        events("passed", "skipped", "failed")
    }
}

// 配置 jar 包名称
tasks.jar {
    archiveBaseName.set("task")
}

// 为所有子项目添加Kotlin JVM配置
allprojects {
    // 应用kotlin插件到所有子项目
    apply {
        plugin("org.jetbrains.kotlin.jvm")
        plugin("org.jetbrains.kotlin.plugin.spring")
        plugin("org.springframework.boot")
        plugin("io.spring.dependency-management")
    }

    // 添加Java元数据，解决Kotlin平台属性问题
    java {
        withJavadocJar()
        withSourcesJar()
    }

    // 定义共享的Kotlin编译选项
    tasks.withType<KotlinCompile> {
        compilerOptions {
            freeCompilerArgs.addAll(listOf("-Xjsr305=strict", "-Xjvm-default=all", "-java-parameters"))
            jvmTarget.set(JvmTarget.JVM_21)
        }
    }

    // 禁止不同任务并行访问同一个项目
    gradle.projectsEvaluated {
        tasks.withType<JavaCompile> {
            options.compilerArgs.add("-Xmaxerrs")
            options.compilerArgs.add("1000")
        }
    }
}

// 配置健康检查任务
tasks.register("checkHealth") {
    group = "verification"
    description = "检查项目配置和依赖健康状况"
    doLast {
        println("检查项目健康状况...")
        println("Kotlin 版本: ${kotlin.coreLibrariesVersion}")
        println("Spring Boot 版本: 3.4.1")
        println("Java 兼容性: ${java.sourceCompatibility}")
    }
}

// ktlint 配置
ktlint {
    verbose.set(true)
    outputToConsole.set(true)
}

// detekt 配置
detekt {
    buildUponDefaultConfig = true
    allRules = false
    config = files("$projectDir/config/detekt.yml")
}

// GraalVM Native 配置 - 在根项目中配置基本设置，详细配置在bootstrap模块中
graalvmNative {
    // 仅在bootstrap模块中启用原生镜像构建
    // 根项目中不生成原生镜像
    metadataRepository {
        enabled.set(false)
    }
}

// Spring Boot Actuator 配置
springBoot {
    buildInfo()
    mainClass.set("com.task.bootstrap.TaskCodeApplication")
}

// Maven发布配置
allprojects {
    apply(plugin = "maven-publish")

    // 发布配置
    afterEvaluate {
        configure<PublishingExtension> {
            publications {
                create<MavenPublication>("mavenJava") {
                    from(components["java"])
                    groupId = project.group.toString()
                    artifactId = project.name
                    version = project.version.toString()
                }
            }

            repositories {
                maven {
                    name = "task-ark-server"
                    url = uri("https://g-avsg8658-maven.pkg.coding.net/repository/task/task-ark-server/")
                    credentials {
                        username = "task-ark-server-1748240828487"
                        password = "07ba8ab6cd934d369a72610f8ae5648b73f13e29"
                    }
                }
            }
        }
    }
}
