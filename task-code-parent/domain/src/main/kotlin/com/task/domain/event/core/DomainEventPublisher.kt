package com.task.domain.event.core

import org.slf4j.LoggerFactory
import org.springframework.context.ApplicationEventPublisher
import org.springframework.stereotype.Component
import reactor.core.publisher.Mono
import reactor.core.scheduler.Schedulers

/**
 * 领域事件发布器
 * 负责发布领域事件到事件总线
 */
@Component
class DomainEventPublisher(private val applicationEventPublisher: ApplicationEventPublisher) {
    private val logger = LoggerFactory.getLogger(DomainEventPublisher::class.java)
    
    /**
     * 同步发布领域事件
     * @param event 要发布的领域事件
     */
    fun publish(event: DomainEvent) {
        try {
            logger.debug("发布领域事件: {}", event)
            applicationEventPublisher.publishEvent(event)
        } catch (e: Exception) {
            logger.error("发布领域事件失败: {}", event, e)
            throw e
        }
    }
    
    /**
     * 异步发布领域事件
     * @param event 要发布的领域事件
     * @return Mono<Void> 表示发布操作的完成
     */
    fun publishAsync(event: DomainEvent): Mono<Void> {
        return Mono.defer {
            Mono.fromCallable {
                logger.debug("开始异步发布领域事件: {}", event)
                applicationEventPublisher.publishEvent(event)
            }
            .then()
            .doOnSuccess { logger.debug("领域事件发布成功: {}", event) }
            .doOnError { e -> 
                logger.error("领域事件发布失败: {}, 错误信息: {}", event, e.message, e)
            }
            .onErrorResume { e -> 
                // 记录错误但不中断流
                Mono.empty()
            }
        }
        .subscribeOn(Schedulers.boundedElastic())
    }
    
    /**
     * 批量发布领域事件
     * @param events 要发布的领域事件列表
     */
    fun publishAll(events: Collection<DomainEvent>) {
        events.forEach { publish(it) }
    }
    
    /**
     * 异步批量发布领域事件
     * @param events 要发布的领域事件列表
     * @return Mono<Void> 表示所有发布操作的完成
     */
    fun publishAllAsync(events: Collection<DomainEvent>): Mono<Void> {
        if (events.isEmpty()) {
            return Mono.empty()
        }
        
        return Mono.`when`(events.map { publishAsync(it) })
    }
}
