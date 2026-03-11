package com.task.infrastructure.config

import com.fasterxml.jackson.databind.DeserializationFeature
import com.fasterxml.jackson.databind.ObjectMapper
import com.fasterxml.jackson.databind.jsontype.impl.LaissezFaireSubTypeValidator
import com.fasterxml.jackson.module.kotlin.KotlinModule
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.data.redis.connection.ReactiveRedisConnectionFactory
import org.springframework.data.redis.core.ReactiveRedisTemplate
import org.springframework.data.redis.serializer.Jackson2JsonRedisSerializer
import org.springframework.data.redis.serializer.RedisSerializationContext
import org.springframework.data.redis.serializer.StringRedisSerializer

/**
 * Redis配置类
 * 提供响应式Redis模板和序列化配置
 */
@Configuration
class RedisConfig {

    /**
     * 创建响应式Redis模板
     *
     * @param connectionFactory Redis连接工厂
     * @return 响应式Redis模板
     */
    @Bean
    fun reactiveRedisTemplate(connectionFactory: ReactiveRedisConnectionFactory): ReactiveRedisTemplate<String, Any> {
        // 创建JSON序列化器
        val jackson2JsonRedisSerializer = Jackson2JsonRedisSerializer(Any::class.java).apply {
            setObjectMapper(ObjectMapper().apply {
                registerModule(KotlinModule.Builder().build())
                activateDefaultTyping(
                    LaissezFaireSubTypeValidator.instance,
                    ObjectMapper.DefaultTyping.NON_FINAL
                )
                configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false)
            })
        }

        // 创建字符串序列化器
        val stringSerializer = StringRedisSerializer()

        // 创建序列化上下文
        val serializationContext = RedisSerializationContext
            .newSerializationContext<String, Any>()
            .key(stringSerializer)
            .value(jackson2JsonRedisSerializer)
            .hashKey(stringSerializer)
            .hashValue(jackson2JsonRedisSerializer)
            .build()

        // 创建并返回ReactiveRedisTemplate
        return ReactiveRedisTemplate(connectionFactory, serializationContext)
    }
}