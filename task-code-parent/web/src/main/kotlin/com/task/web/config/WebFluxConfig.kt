package com.task.web.config

import com.fasterxml.jackson.core.JsonGenerator
import com.fasterxml.jackson.databind.JsonSerializer
import com.fasterxml.jackson.databind.ObjectMapper
import com.fasterxml.jackson.databind.SerializationFeature
import com.fasterxml.jackson.databind.SerializerProvider
import com.fasterxml.jackson.databind.module.SimpleModule
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule
import org.slf4j.LoggerFactory
import org.springframework.context.annotation.Configuration
import org.springframework.context.annotation.Primary
import org.springframework.http.MediaType
import org.springframework.http.codec.ServerCodecConfigurer
import org.springframework.http.codec.json.Jackson2JsonEncoder
import org.springframework.web.reactive.config.CorsRegistry
import org.springframework.web.reactive.config.ResourceHandlerRegistry
import org.springframework.web.reactive.config.WebFluxConfigurer

@Configuration
@Primary
class WebFluxConfig : WebFluxConfigurer {
    override fun addResourceHandlers(registry: ResourceHandlerRegistry) {
        registry.addResourceHandler("/static/**")
            .addResourceLocations("classpath:/static/")
    }
    
    override fun configureHttpMessageCodecs(configurer: ServerCodecConfigurer) {
        val log = LoggerFactory.getLogger(this::class.java)
        log.info("配置编码器，将Long转为字符串")
        
        // 步骤1: 创建自定义ObjectMapper
        val objectMapper = ObjectMapper()
        
        // 步骤2: 创建并注册Long序列化模块
        val longStringModule = SimpleModule("LongToStringModule")
        
        // 为Long包装类型添加序列化器
        longStringModule.addSerializer(Long::class.java, object : JsonSerializer<Long>() {
            override fun serialize(value: Long, gen: JsonGenerator, serializers: SerializerProvider) {
                gen.writeString(value.toString())
            }
        })
        
        // 为long基本类型添加序列化器
        longStringModule.addSerializer(Long::class.javaPrimitiveType!!, object : JsonSerializer<Long>() {
            override fun serialize(value: Long, gen: JsonGenerator, serializers: SerializerProvider) {
                gen.writeString(value.toString())
            }
        })
        
        // 注册 Long 序列化模块
        objectMapper.registerModule(longStringModule)
        
        // 注册 Java 8 日期时间模块，支持 OffsetDateTime 等类型
        val javaTimeModule = JavaTimeModule()
        objectMapper.registerModule(javaTimeModule)
        
        // 配置序列化特性，确保日期时间类型不会被序列化为时间戳
        objectMapper.configure(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS, false)
        
        // 步骤3: 创建自定义编码器
        val encoder = Jackson2JsonEncoder(objectMapper)
        
        // 步骤4: 设置支持的媒体类型
        encoder.setStreamingMediaTypes(
            listOf(
                MediaType.APPLICATION_JSON,
                MediaType.APPLICATION_NDJSON,
                MediaType.APPLICATION_STREAM_JSON,
                MediaType.TEXT_EVENT_STREAM
            )
        )
        
        // 步骤5: 添加到自定义编码器列表
        configurer.customCodecs().encoder(encoder)
        
        // 步骤6: 覆盖默认编码器
        configurer.defaultCodecs().jackson2JsonEncoder(encoder)
        
        // 其他配置
        // 增加缓冲区大小以支持大型请求体（如需求对话列表创建请求）
        configurer.defaultCodecs().maxInMemorySize(2 * 1024 * 1024) // 2MB
        configurer.defaultCodecs().enableLoggingRequestDetails(true)
        
        log.info("完成Long转字符串编码器配置")
    }
    
    override fun addCorsMappings(registry: CorsRegistry) {
        registry.addMapping("/**")
            .allowedOriginPatterns("*") // 允许所有域名，生产环境建议指定具体域名
            .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH")
            .allowedHeaders("*")
            .allowCredentials(true)
            .maxAge(3600) // 预检请求缓存时间（秒）
    }
}