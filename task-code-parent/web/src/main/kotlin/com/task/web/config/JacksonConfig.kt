package com.task.web.config

import com.fasterxml.jackson.core.JsonGenerator
import com.fasterxml.jackson.databind.*
import com.fasterxml.jackson.databind.module.SimpleModule
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule
import com.fasterxml.jackson.module.kotlin.KotlinFeature
import com.fasterxml.jackson.module.kotlin.KotlinModule
import jakarta.annotation.PostConstruct
import org.slf4j.LoggerFactory
import org.springframework.boot.autoconfigure.condition.ConditionalOnMissingBean
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.http.converter.json.MappingJackson2HttpMessageConverter

/**
 * Jackson配置类
 * 用于处理JSON序列化和反序列化
 * 特别处理Long类型转为字符串，避免JavaScript精度丢失
 */
@Configuration
class JacksonConfig {
    private val log = LoggerFactory.getLogger(this::class.java)
    
    @PostConstruct
    fun init() {
        log.info("Jackson配置初始化 - 启用Long到String的自动转换，解决前端精度丢失问题")
    }

    /**
     * 配置ObjectMapper，将Long类型序列化为字符串
     * 使用ConditionalOnMissingBean确保只在缺少ObjectMapper bean时才创建
     */
    @Bean(name = ["customJacksonObjectMapper"])
    @ConditionalOnMissingBean(ObjectMapper::class)
    fun objectMapper(): ObjectMapper {
        log.info("创建带有Long到String序列化器的ObjectMapper")
        val module = SimpleModule()
        module.addSerializer(Long::class.java, LongToStringSerializer())
        module.addSerializer(Long::class.javaPrimitiveType!!, LongToStringSerializer())
        
        // 创建ObjectMapper并注册模块
        val objectMapper = ObjectMapper()
        objectMapper.registerModule(module)
        
        // 注册Kotlin模块
        val kotlinModule = KotlinModule.Builder()
            .withReflectionCacheSize(512)
            .configure(KotlinFeature.NullToEmptyCollection, false)
            .configure(KotlinFeature.NullToEmptyMap, false)
            .configure(KotlinFeature.NullIsSameAsDefault, false)
            .configure(KotlinFeature.SingletonSupport, false)
            .configure(KotlinFeature.StrictNullChecks, false)
            .build()
        objectMapper.registerModule(kotlinModule)
        
        // 注册Java 8日期时间模块
        val javaTimeModule = JavaTimeModule()
        objectMapper.registerModule(javaTimeModule)
        
        // 配置序列化特性
        objectMapper.configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false)
        objectMapper.configure(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS, false)
        
        log.info("ObjectMapper配置完成，支持Long类型序列化和Java 8日期时间类型(包括OffsetDateTime)")
        return objectMapper
    }
    
    /**
     * 配置Jackson HTTP消息转换器，使用我们的自定义ObjectMapper
     */
    @Bean
    fun mappingJackson2HttpMessageConverter(objectMapper: ObjectMapper): MappingJackson2HttpMessageConverter {
        log.info("配置Jackson HTTP消息转换器，使用自定义ObjectMapper")
        return MappingJackson2HttpMessageConverter(objectMapper)
    }
    
    /**
     * Long类型序列化为字符串的自定义序列化器
     * 解决JavaScript中数值精度丢失的问题
     */
    class LongToStringSerializer : JsonSerializer<Long>() {
        override fun serialize(value: Long, gen: JsonGenerator, provider: SerializerProvider) {
            gen.writeString(value.toString())
            // 这里我们确保Long值被写入为字符串
        }
    }
}
