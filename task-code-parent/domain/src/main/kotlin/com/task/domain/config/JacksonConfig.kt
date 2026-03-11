package com.task.domain.config

import com.fasterxml.jackson.databind.ObjectMapper
import com.fasterxml.jackson.databind.SerializationFeature
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule
import com.fasterxml.jackson.module.kotlin.KotlinModule
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration

/**
 * Jackson配置类
 * 用于处理JSON序列化和反序列化
 * 支持Java 8日期时间类型如OffsetDateTime
 */
@Configuration
class JacksonConfig {

    @Bean
    fun objectMapper(): ObjectMapper {
        return ObjectMapper().apply {
            // 注册Kotlin模块
            registerModule(KotlinModule.Builder().build())
            
            // 注册Java 8日期时间模块，支持OffsetDateTime等类型
            registerModule(JavaTimeModule())
            
            // 配置序列化特性
            configure(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS, false)
        }
    }
}