plugins {
    kotlin("jvm")
    kotlin("plugin.spring")
    id("org.springframework.boot")
    id("io.spring.dependency-management")
}

java {
    sourceCompatibility = JavaVersion.VERSION_21
    targetCompatibility = JavaVersion.VERSION_21
}

tasks.withType<org.jetbrains.kotlin.gradle.tasks.KotlinCompile> {
    kotlinOptions {
        jvmTarget = "21"
        freeCompilerArgs += "-Xjsr305=strict"
    }
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
    // Reactor Core for reactive programming
    api("io.projectreactor:reactor-core")
    
    // Spring Context for component scanning
    api("org.springframework:spring-context")
    
    // Kotlin Logging
    implementation("io.github.microutils:kotlin-logging-jvm:3.0.5")
}

tasks.bootJar {
    enabled = false
}

tasks.jar {
    enabled = true
}
