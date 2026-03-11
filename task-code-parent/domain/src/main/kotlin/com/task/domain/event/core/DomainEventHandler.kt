package com.task.domain.event.core

import org.springframework.context.event.EventListener
import org.springframework.core.annotation.AliasFor
import org.springframework.transaction.event.TransactionPhase
import org.springframework.transaction.event.TransactionalEventListener
import kotlin.reflect.KClass

/**
 * 领域事件处理器注解
 * 用于标记处理领域事件的方法
 * 
 * 示例用法:
 * ```
 * @DomainEventHandler
 * fun handleUserCreatedEvent(event: UserCreatedEvent) {
 *     // 处理用户创建事件
 * }
 * ```
 */
@Target(AnnotationTarget.FUNCTION, AnnotationTarget.CLASS)
@Retention(AnnotationRetention.RUNTIME)
@MustBeDocumented
@EventListener
annotation class DomainEventHandler(
    /**
     * 指定要处理的事件类型，默认根据方法参数自动推断
     */
    @get:AliasFor(annotation = EventListener::class, attribute = "classes")
    val classes: Array<KClass<out Any>> = []
)

/**
 * 事务性领域事件处理器注解
 * 用于标记在事务上下文中处理领域事件的方法
 * 
 * 示例用法:
 * ```
 * @TransactionalDomainEventHandler(phase = TransactionPhase.AFTER_COMMIT)
 * fun handleUserCreatedEvent(event: UserCreatedEvent) {
 *     // 在事务提交后处理用户创建事件
 * }
 * ```
 */
@Target(AnnotationTarget.FUNCTION, AnnotationTarget.CLASS)
@Retention(AnnotationRetention.RUNTIME)
@MustBeDocumented
@TransactionalEventListener
annotation class TransactionalDomainEventHandler(
    /**
     * 指定要处理的事件类型，默认根据方法参数自动推断
     */
    @get:AliasFor(annotation = TransactionalEventListener::class, attribute = "classes")
    val classes: Array<KClass<out Any>> = [],
    
    /**
     * 指定在事务的哪个阶段处理事件
     */
    @get:AliasFor(annotation = TransactionalEventListener::class, attribute = "phase")
    val phase: TransactionPhase = TransactionPhase.AFTER_COMMIT,
    
    /**
     * 如果没有事务，是否仍然处理事件
     */
    @get:AliasFor(annotation = TransactionalEventListener::class, attribute = "fallbackExecution")
    val fallbackExecution: Boolean = false
)
