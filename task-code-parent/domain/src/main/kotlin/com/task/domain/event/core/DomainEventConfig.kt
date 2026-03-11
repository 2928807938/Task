package com.task.domain.event.core

import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.context.event.ApplicationEventMulticaster
import org.springframework.context.event.SimpleApplicationEventMulticaster
import org.springframework.core.task.AsyncTaskExecutor
import org.springframework.scheduling.annotation.EnableAsync

/**
 * 领域事件配置
 * 配置事件发布和处理的基础设施
 */
@Configuration
@EnableAsync
class DomainEventConfig {
    
    /**
     * 配置应用事件多播器
     * 使用异步任务执行器处理事件，提高性能
     * 
     * @param asyncTaskExecutor 异步任务执行器，使用虚拟线程
     * @return 配置好的事件多播器
     */
    @Bean
    fun applicationEventMulticaster(asyncTaskExecutor: AsyncTaskExecutor): ApplicationEventMulticaster {
        val eventMulticaster = SimpleApplicationEventMulticaster()
        eventMulticaster.setTaskExecutor(asyncTaskExecutor)
        return eventMulticaster
    }
}
