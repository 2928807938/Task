package com.task.infrastructure.config

import com.task.infrastructure.id.IdGeneratorService
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration

/**
 * ID生成器配置类
 * 负责注册ID生成相关的Bean
 */
@Configuration
class IdGeneratorConfig {
    
    /**
     * 注册ID生成服务Bean
     * @return IdGeneratorService实例
     */
    @Bean
    fun idGeneratorService(): IdGeneratorService {
        return IdGeneratorService()
    }
}
