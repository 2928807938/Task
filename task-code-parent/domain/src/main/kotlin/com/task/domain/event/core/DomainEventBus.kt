package com.task.domain.event.core

import com.task.domain.model.common.ComparisonOperator
import com.task.domain.model.common.fieldOf
import com.task.domain.repository.DomainEventRepository
import com.task.domain.repository.EventProcessingLogRepository
import org.slf4j.LoggerFactory
import org.springframework.context.ApplicationEventPublisher
import org.springframework.scheduling.annotation.Async
import org.springframework.stereotype.Service
import reactor.core.publisher.Mono
import java.time.OffsetDateTime

/**
 * 领域事件总线
 * 提供事件发布、订阅和处理的统一接口
 */
@Service
class DomainEventBus(
    private val applicationEventPublisher: ApplicationEventPublisher,
    private val domainEventRepository: DomainEventRepository,
    private val eventProcessingLogRepository: EventProcessingLogRepository
) {
    private val logger = LoggerFactory.getLogger(DomainEventBus::class.java)

    /**
     * 发布领域事件
     * 1. 保存事件到事件仓储
     * 2. 通过Spring事件机制发布事件
     * @param event 领域事件
     * @return 保存后的事件
     */
    fun publish(event: DomainEvent): Mono<DomainEvent> {
        logger.debug("发布领域事件: {}", event)
        
        // 保存事件到仓储
        return domainEventRepository.save(event)
            .doOnNext { savedEvent ->
                // 通过Spring事件机制发布事件
                applicationEventPublisher.publishEvent(savedEvent)
                logger.debug("领域事件已发布: {}", savedEvent)
            }
    }

    /**
     * 异步发布领域事件
     * @param event 领域事件
     */
    @Async
    fun publishAsync(event: DomainEvent) {
        publish(event).subscribe(
            { logger.debug("异步事件发布成功: {}", it) },
            { logger.error("异步事件发布失败: {}", event, it) }
        )
    }

    /**
     * 批量发布领域事件
     * @param events 领域事件列表
     * @return 保存后的事件列表
     */
    fun publishAll(events: List<DomainEvent>): Mono<List<DomainEvent>> {
        if (events.isEmpty()) {
            return Mono.just(emptyList())
        }
        
        logger.debug("批量发布领域事件, 数量: {}", events.size)
        
        // 批量保存事件到仓储
        return domainEventRepository.saveBatch(events)
            .collectList()
            .doOnNext { savedEvents ->
                // 通过Spring事件机制发布事件
                savedEvents.forEach { applicationEventPublisher.publishEvent(it) }
                logger.debug("批量领域事件已发布, 数量: {}", savedEvents.size)
            }
    }

    /**
     * 异步批量发布领域事件
     * @param events 领域事件列表
     */
    @Async
    fun publishAllAsync(events: List<DomainEvent>) {
        if (events.isEmpty()) {
            return
        }
        
        publishAll(events).subscribe(
            { logger.debug("异步批量事件发布成功, 数量: {}", it.size) },
            { logger.error("异步批量事件发布失败", it) }
        )
    }

    /**
     * 记录事件处理日志
     * @param eventId 事件ID
     * @param handlerName 处理器名称
     * @param status 处理状态
     * @param errorMessage 错误信息
     * @param retryCount 重试次数
     * @return 保存后的处理日志
     */
    fun logEventProcessing(
        eventId: String,
        handlerName: String,
        status: EventProcessingLog.Status,
        errorMessage: String? = null,
        retryCount: Int = 0
    ): Mono<EventProcessingLog> {
        val log = EventProcessingLog(
            id = null,
            eventId = eventId,
            handlerName = handlerName,
            status = status,
            errorMessage = errorMessage,
            retryCount = retryCount,
            lastProcessedAt = OffsetDateTime.now()
        )
        
        return eventProcessingLogRepository.save(log)
    }

    /**
     * 标记事件处理成功
     * @param eventId 事件ID
     * @param handlerName 处理器名称
     * @return 更新后的处理日志
     */
    fun markEventProcessingSuccess(eventId: String, handlerName: String): Mono<EventProcessingLog> {
        return findEventProcessingLog(eventId, handlerName)
            .flatMap { log ->
                eventProcessingLogRepository.update(log.markAsSuccess())
            }
            .switchIfEmpty(
                logEventProcessing(
                    eventId = eventId,
                    handlerName = handlerName,
                    status = EventProcessingLog.Status.SUCCESS
                )
            )
    }

    /**
     * 标记事件处理失败
     * @param eventId 事件ID
     * @param handlerName 处理器名称
     * @param errorMessage 错误信息
     * @return 更新后的处理日志
     */
    fun markEventProcessingFailed(eventId: String, handlerName: String, errorMessage: String?): Mono<EventProcessingLog> {
        return findEventProcessingLog(eventId, handlerName)
            .flatMap { log ->
                eventProcessingLogRepository.update(log.markAsFailed(errorMessage))
            }
            .switchIfEmpty(
                logEventProcessing(
                    eventId = eventId,
                    handlerName = handlerName,
                    status = EventProcessingLog.Status.FAILED,
                    errorMessage = errorMessage
                )
            )
    }

    /**
     * 增加事件处理重试次数
     * @param eventId 事件ID
     * @param handlerName 处理器名称
     * @return 更新后的处理日志
     */
    fun incrementEventProcessingRetryCount(eventId: String, handlerName: String): Mono<EventProcessingLog> {
        return findEventProcessingLog(eventId, handlerName)
            .flatMap { log ->
                eventProcessingLogRepository.update(log.incrementRetryCount())
            }
            .switchIfEmpty(
                logEventProcessing(
                    eventId = eventId,
                    handlerName = handlerName,
                    status = EventProcessingLog.Status.RETRYING,
                    retryCount = 1
                )
            )
    }

    /**
     * 查找事件处理日志
     * @param eventId 事件ID
     * @param handlerName 处理器名称
     * @return 处理日志
     */
    private fun findEventProcessingLog(eventId: String, handlerName: String): Mono<EventProcessingLog> {
        return eventProcessingLogRepository.findOne {
            fieldOf(EventProcessingLog::eventId, ComparisonOperator.EQUALS, eventId)
            fieldOf(EventProcessingLog::handlerName, ComparisonOperator.EQUALS, handlerName)
        }
    }
}
