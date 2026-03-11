plugins {
    kotlin("jvm")
    kotlin("plugin.spring")
    id("org.springframework.boot")
    id("io.spring.dependency-management")
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
    implementation(project(":application"))
    implementation(project(":infrastructure"))
    implementation(project(":domain"))
    implementation(project(":shared"))
    
    // Spring Boot 依赖
    implementation("org.springframework.boot:spring-boot-starter-webflux")
    implementation("org.springframework.boot:spring-boot-starter-validation")
    // Spring Security 依赖
    implementation("org.springframework.boot:spring-boot-starter-security")
    
    // Kotlin 支持
    implementation("com.fasterxml.jackson.module:jackson-module-kotlin")
    implementation("io.projectreactor.kotlin:reactor-kotlin-extensions")
    implementation("org.jetbrains.kotlin:kotlin-reflect")
    implementation("org.jetbrains.kotlin:kotlin-stdlib")
    implementation("org.jetbrains.kotlinx:kotlinx-coroutines-reactor")
    
    // API 文档
    val springdocVersion = "2.3.0" // 直接定义版本号
    implementation("org.springdoc:springdoc-openapi-starter-webflux-ui:$springdocVersion")
}

tasks.bootJar {
    enabled = false
}

tasks.jar {
    enabled = true
}