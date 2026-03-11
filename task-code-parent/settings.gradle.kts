pluginManagement {
    repositories {
        // 阿里云Gradle插件镜像
        maven { url = uri("https://maven.aliyun.com/repository/gradle-plugin") }
        // 官方插件仓库
        gradlePluginPortal()
        mavenCentral()
    }
}

rootProject.name = "task-code-parent"

include(
    ":shared",
    ":domain",
    ":application",
    ":infrastructure",
    ":web",
    ":bootstrap",
)
