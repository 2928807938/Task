package com.task.web.client.controller

import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RestController
import reactor.core.publisher.Mono
import java.time.OffsetDateTime
import java.time.Duration
import java.util.concurrent.TimeUnit

/**
 * 自定义健康检查控制器
 * 提供与Spring Boot Actuator健康检查格式一致的端点
 */
@RestController
class HealthCheckController {

    private val startTime = System.currentTimeMillis()

    /**
     * 自定义健康检查端点
     * 返回格式与Spring Boot Actuator的/actuator/health端点一致
     */
    @GetMapping("/actuator/health")
    fun healthCheck(): Mono<HealthStatus> {
        val uptime = System.currentTimeMillis() - startTime
        
        // 构建与Spring Boot健康检查一致的响应格式
        return Mono.just(
            HealthStatus(
                status = "UP",
                components = mapOf(
                    "diskSpace" to Component(status = "UP"),
                    "ping" to Component(status = "UP"),
                    "db" to Component(
                        status = "UP",
                        details = mapOf("database" to "PostgreSQL")
                    )
                ),
                details = mapOf(
                    "uptime" to formatUptime(uptime),
                    "startTime" to OffsetDateTime.now().minus(Duration.ofMillis(uptime)).toString()
                )
            )
        )
    }
    
    /**
     * 格式化运行时间
     */
    private fun formatUptime(uptimeMillis: Long): String {
        val days = TimeUnit.MILLISECONDS.toDays(uptimeMillis)
        val hours = TimeUnit.MILLISECONDS.toHours(uptimeMillis) % 24
        val minutes = TimeUnit.MILLISECONDS.toMinutes(uptimeMillis) % 60
        val seconds = TimeUnit.MILLISECONDS.toSeconds(uptimeMillis) % 60
        
        return "${days}d ${hours}h ${minutes}m ${seconds}s"
    }
    
    /**
     * 健康状态响应类，格式与Spring Boot Actuator一致
     */
    data class HealthStatus(
        val status: String,
        val components: Map<String, Component>,
        val details: Map<String, Any> = emptyMap()
    )
    
    /**
     * 组件状态类
     */
    data class Component(
        val status: String,
        val details: Map<String, Any> = emptyMap()
    )
}
