package com.task.bootstrap

import org.springframework.boot.autoconfigure.SpringBootApplication
import org.springframework.boot.runApplication

/**
 * 应用程序入口类
 */
@SpringBootApplication
class TaskCodeApplication

fun main(args: Array<String>) {
    runApplication<TaskCodeApplication>(*args)
}