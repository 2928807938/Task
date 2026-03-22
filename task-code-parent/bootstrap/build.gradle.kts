import org.gradle.api.tasks.SourceSetContainer
import org.springframework.boot.gradle.tasks.bundling.BootJar
import org.springframework.boot.gradle.tasks.run.BootRun

plugins {
    kotlin("jvm")
    kotlin("kapt")
    kotlin("plugin.spring")
    id("org.springframework.boot")
    id("io.spring.dependency-management")
    id("org.graalvm.buildtools.native")
}

repositories {
    maven { url = uri("https://maven.aliyun.com/repository/public") }
    maven { url = uri("https://maven.aliyun.com/repository/google") }
    maven { url = uri("https://maven.aliyun.com/repository/spring") }
    maven { url = uri("https://maven.aliyun.com/repository/central") }
    maven { url = uri("https://maven.aliyun.com/repository/gradle-plugin") }
    mavenCentral()
    gradlePluginPortal()
}

dependencies {
    implementation(project(":web"))
    implementation(project(":shared"))

    implementation("org.springframework.boot:spring-boot-starter")
    implementation("org.flywaydb:flyway-core")
    implementation("org.jetbrains.kotlin:kotlin-reflect")
    implementation("org.jetbrains.kotlin:kotlin-stdlib")

    runtimeOnly("org.postgresql:postgresql")

    compileOnly("org.springframework:spring-context-indexer")
    kapt("org.springframework:spring-context-indexer")
}

val sourceSets = the<SourceSetContainer>()
val aotSourceSet = sourceSets.named("aot")

tasks.named<BootJar>("bootJar") {
    archiveFileName.set("${rootProject.name}.jar")
    dependsOn(tasks.named("processAot"))
    classpath(aotSourceSet.map { it.output })
}

tasks.register<BootRun>("bootRunAot") {
    group = "application"
    description = "Runs the application on the JVM using Spring AOT generated assets."
    dependsOn(tasks.named("processAot"))
    mainClass.set("com.task.bootstrap.TaskCodeApplicationKt")
    classpath = files(sourceSets.named("main").map { it.runtimeClasspath }, aotSourceSet.map { it.output })
    systemProperty("spring.aot.enabled", "true")
    jvmArgs("--enable-preview")
}

tasks.bootJar {
    enabled = true
}

tasks.jar {
    enabled = true
}

graalvmNative {
    metadataRepository {
        enabled.set(true)
    }
}

springBoot {
    mainClass.set("com.task.bootstrap.TaskCodeApplicationKt")
}
