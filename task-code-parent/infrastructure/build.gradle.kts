plugins {
    kotlin("jvm")
    kotlin("kapt")
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
    implementation(project(":shared"))
    implementation(project(":domain"))
    compileOnly("org.springframework:spring-context-indexer")
    kapt("org.springframework:spring-context-indexer")

    // Spring Boot 基础依赖
    implementation("org.springframework.boot:spring-boot-starter")
    implementation("org.springframework.boot:spring-boot-starter-webflux")
    implementation("org.jetbrains.kotlin:kotlin-reflect")
    implementation("org.jetbrains.kotlin:kotlin-stdlib")
    
    // Reactor 支持
    implementation("io.projectreactor.kotlin:reactor-kotlin-extensions")
    implementation("org.jetbrains.kotlinx:kotlinx-coroutines-reactor")
    
    // 数据库驱动
    implementation("org.postgresql:r2dbc-postgresql")
    implementation("io.r2dbc:r2dbc-pool")
    implementation("org.springframework.boot:spring-boot-starter-data-r2dbc")
    
    // Redis 支持
    implementation("org.springframework.boot:spring-boot-starter-data-redis-reactive")
    
    // 邮件发送支持
    implementation("org.springframework.boot:spring-boot-starter-mail")
    
    // TSID 分布式ID生成器
    implementation("com.github.f4b6a3:tsid-creator:5.2.0")
    
    // JWT 支持
    val jjwtVersion = "0.12.3" // 直接定义版本号
    implementation("io.jsonwebtoken:jjwt-api:${jjwtVersion}")
    implementation("io.jsonwebtoken:jjwt-impl:${jjwtVersion}")
    implementation("io.jsonwebtoken:jjwt-jackson:${jjwtVersion}")
    
    // 测试依赖
    testImplementation("org.springframework.boot:spring-boot-starter-test") {
        exclude(group = "org.junit.vintage", module = "junit-vintage-engine")
    }
    testImplementation("io.projectreactor:reactor-test")
    
    // 测试容器
    val testcontainersVersion = "1.19.3" // 直接定义版本号
    testImplementation("org.testcontainers:postgresql:$testcontainersVersion")
    testImplementation("org.testcontainers:r2dbc:$testcontainersVersion")
    testImplementation("org.testcontainers:junit-jupiter:$testcontainersVersion")
}

tasks.bootJar {
    enabled = false
}

tasks.jar {
    enabled = true
}
