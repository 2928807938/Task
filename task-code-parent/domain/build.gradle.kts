plugins {
    kotlin("jvm")
    kotlin("kapt")
    kotlin("plugin.spring")
    id("org.springframework.boot")
    id("io.spring.dependency-management")
    // 暂时移除GraalVM插件
    // id("org.graalvm.buildtools.native")
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
    api(project(":shared"))
    compileOnly("org.springframework:spring-context-indexer")
    kapt("org.springframework:spring-context-indexer")
    implementation("org.springframework.boot:spring-boot-starter")
    implementation("org.springframework.security:spring-security-core")
    implementation("org.jetbrains.kotlin:kotlin-reflect")
    implementation("org.jetbrains.kotlin:kotlin-stdlib")
    implementation("io.projectreactor:reactor-core")
    implementation("io.projectreactor.kotlin:reactor-kotlin-extensions")
    // Spring Security 核心
    api("org.springframework.security:spring-security-core")
    // Spring Transaction 支持
    implementation("org.springframework:spring-tx")
    implementation("org.springframework.boot:spring-boot-starter-aop")
    // AspectJ 支持
    implementation("org.springframework:spring-aspects")
    implementation("org.aspectj:aspectjweaver")
    implementation("org.aspectj:aspectjrt")
    
    // 响应式事务支持
    implementation("org.springframework:spring-r2dbc")
    implementation("io.r2dbc:r2dbc-spi")

    // Jackson 支持
    api("com.fasterxml.jackson.core:jackson-databind")
    api("com.fasterxml.jackson.module:jackson-module-kotlin")
    api("com.fasterxml.jackson.datatype:jackson-datatype-jsr310") // Java 8 日期时间模块

}

tasks.bootJar {
    enabled = false
}

tasks.jar {
    enabled = true
}
