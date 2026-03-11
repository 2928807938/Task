package com.task.infrastructure

import org.springframework.boot.autoconfigure.SpringBootApplication
import org.springframework.boot.runApplication

/**
 * 测试专用的应用程序入口类
 * 用于测试环境的Spring Boot应用程序启动
 */
@SpringBootApplication
class TestApplication

fun main(args: Array<String>) {
    runApplication<TestApplication>(*args)
}
