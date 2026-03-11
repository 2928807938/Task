package com.task.domain.transaction

import com.task.domain.event.core.DomainEvent
import org.springframework.core.annotation.AliasFor
import org.springframework.transaction.annotation.Propagation
import org.springframework.transaction.annotation.Transactional
import org.springframework.transaction.reactive.TransactionalOperator
import reactor.core.publisher.Flux
import reactor.core.publisher.Mono
import reactor.util.context.Context
import reactor.util.context.ContextView
import java.util.concurrent.CopyOnWriteArrayList
import kotlin.reflect.KClass

/**
 * 响应式事务性发件箱模式注解
 * 
 * 用于标记方法，确保在同一事务中保存业务数据和领域事件，
 * 并在事务提交后发布事件。专为 Spring WebFlux + R2DBC 设计。
 * 
 * 核心特性：
 * - 在事务中收集领域事件
 * - 事务成功提交后自动发布事件
 * - 支持异步后处理操作
 * - 非侵入式设计，通过AOP实现
 * 
 * 使用示例：
 * ```kotlin
 * @ReactiveTransactionalOutbox
 * fun createUser(command: CreateUserCommand): Mono<User> {
 *     return userRepository.save(user)
 *         .doOnSuccess { 
 *             // 注册事件，事务提交后自动发布
 *             ReactiveTransactionalOutbox.registerEvent(
 *                 UserCreatedEvent(user.id)
 *             ).subscribe()
 *         }
 * }
 * 
 * @ReactiveTransactionalOutbox(enableAsyncOperations = true)
 * fun createProject(command: CreateProjectCommand): Mono<Project> {
 *     return projectRepository.save(project)
 *         .doOnSuccess {
 *             // 注册事件
 *             ReactiveTransactionalOutbox.registerEvent(
 *                 ProjectCreatedEvent(project.id)
 *             ).subscribe()
 *             
 *             // 注册异步操作（事务提交后执行）
 *             ReactiveTransactionalOutbox.registerAsyncOperation {
 *                 initializeProjectAsync(project.id)
 *             }.subscribe()
 *         }
 * }
 * ```
 */
@Target(AnnotationTarget.FUNCTION, AnnotationTarget.CLASS)
@Retention(AnnotationRetention.RUNTIME)
@MustBeDocumented
@Transactional
annotation class ReactiveTransactionalOutbox(
    /**
     * 事务传播行为
     * 默认使用 REQUIRED，这是R2DBC完全支持的传播行为
     * 不建议修改此参数，除非你非常清楚R2DBC的限制
     */
    @get:AliasFor(annotation = Transactional::class, attribute = "propagation")
    val propagation: Propagation = Propagation.REQUIRED,
    
    /**
     * 事务隔离级别
     */
    @get:AliasFor(annotation = Transactional::class, attribute = "isolation")
    val isolation: org.springframework.transaction.annotation.Isolation = 
        org.springframework.transaction.annotation.Isolation.DEFAULT,
    
    /**
     * 事务超时时间（秒）
     */
    @get:AliasFor(annotation = Transactional::class, attribute = "timeout")
    val timeout: Int = -1,
    
    /**
     * 是否只读事务
     */
    @get:AliasFor(annotation = Transactional::class, attribute = "readOnly")
    val readOnly: Boolean = false,
    
    /**
     * 触发回滚的异常类型
     */
    @get:AliasFor(annotation = Transactional::class, attribute = "rollbackFor")
    val rollbackFor: Array<KClass<out Throwable>> = [],
    
    /**
     * 不触发回滚的异常类型
     */
    @get:AliasFor(annotation = Transactional::class, attribute = "noRollbackFor")
    val noRollbackFor: Array<KClass<out Throwable>> = [],
    
    /**
     * 是否启用异步操作支持
     * 
     * 当设置为 true 时，允许使用 ReactiveTransactionalOutbox.registerAsyncOperation()
     * 来注册在事务提交后异步执行的操作。
     * 
     * 适用于不需要在主事务中执行的操作：
     * - 发送通知邮件
     * - 更新统计数据
     * - 缓存刷新
     * - 审计日志记录
     * - 第三方系统集成
     */
    val enableAsyncOperations: Boolean = false
) {
    companion object {
        /**
         * 事务上下文键，用于在响应式上下文中存储和获取事件
         */
        const val OUTBOX_EVENTS_KEY = "REACTIVE_OUTBOX_EVENTS"
        
        /**
         * 异步操作上下文键，用于存储在事务提交后异步执行的操作
         */
        const val ASYNC_OPERATIONS_KEY = "ASYNC_OPERATIONS"
        
        /**
         * 注册领域事件到当前响应式事务上下文
         * 
         * @param event 要注册的领域事件
         * @return 包含事件的Mono
         */
        @JvmStatic
        fun registerEvent(event: DomainEvent): Mono<DomainEvent> {
            return Mono.deferContextual { context ->
                val events = getEventsFromContext(context)
                events.add(event)
                Mono.just(event)
            }
        }
        
        /**
         * 注册异步操作（在主事务提交后异步执行）
         * 
         * 只有在 @ReactiveTransactionalOutbox(enableAsyncOperations = true) 时才会生效。
         * 用于注册不需要在主事务中执行的操作，如发送通知、更新缓存等。
         * 
         * @param operation 异步操作，返回 Mono<Void>
         * @return 完成信号
         */
        @JvmStatic
        fun registerAsyncOperation(operation: () -> Mono<Void>): Mono<Void> {
            return Mono.deferContextual { context ->
                val operations = getAsyncOperationsFromContext(context)
                operations.add(operation)
                Mono.empty()
            }
        }
        
        /**
         * 注册多个领域事件到当前响应式上下文
         * 
         * @param events 要注册的领域事件集合
         * @return 包含事件列表的Mono
         */
        @JvmStatic
        fun registerEvents(events: Collection<DomainEvent>): Mono<List<DomainEvent>> {
            return Mono.deferContextual { context ->
                val eventsList = getEventsFromContext(context)
                eventsList.addAll(events)
                Mono.just(events.toList())
            }
        }
        
        /**
         * 获取当前响应式上下文中注册的所有领域事件
         * 
         * @return 当前上下文中的领域事件列表Mono
         */
        @JvmStatic
        fun getEvents(): Mono<List<DomainEvent>> {
            return Mono.deferContextual { context ->
                if (!context.hasKey(OUTBOX_EVENTS_KEY)) {
                    Mono.just(emptyList())
                } else {
                    val events = getEventsFromContext(context)
                    Mono.just(events.toList())
                }
            }
        }
        
        /**
         * 获取当前上下文中的异步操作
         * 
         * @return 异步操作列表
         */
        @JvmStatic
        fun getAsyncOperations(): Mono<List<() -> Mono<Void>>> {
            return Mono.deferContextual { context ->
                if (!context.hasKey(ASYNC_OPERATIONS_KEY)) {
                    Mono.just(emptyList())
                } else {
                    val operations = getAsyncOperationsFromContext(context)
                    Mono.just(operations.toList())
                }
            }
        }
        
        /**
         * 清除当前响应式上下文中的所有事件
         * 
         * @return 完成信号Mono
         */
        @JvmStatic
        fun clearEvents(): Mono<Void> {
            return Mono.deferContextual { context ->
                if (context.hasKey(OUTBOX_EVENTS_KEY)) {
                    val events = getEventsFromContext(context)
                    events.clear()
                }
                Mono.empty()
            }
        }
        
        /**
         * 从响应式上下文中获取事件列表
         * 
         * @param context 响应式上下文
         * @return 事件列表
         */
        @Suppress("UNCHECKED_CAST")
        private fun getEventsFromContext(context: ContextView): MutableList<DomainEvent> {
            return if (context.hasKey(OUTBOX_EVENTS_KEY)) {
                context.get<MutableList<DomainEvent>>(OUTBOX_EVENTS_KEY)
            } else {
                CopyOnWriteArrayList<DomainEvent>()
            }
        }
        
        /**
         * 从响应式上下文中获取异步操作列表
         * 
         * @param context 响应式上下文
         * @return 异步操作列表
         */
        @Suppress("UNCHECKED_CAST")
        private fun getAsyncOperationsFromContext(context: ContextView): MutableList<() -> Mono<Void>> {
            return if (context.hasKey(ASYNC_OPERATIONS_KEY)) {
                context.get<MutableList<() -> Mono<Void>>>(ASYNC_OPERATIONS_KEY)
            } else {
                CopyOnWriteArrayList<() -> Mono<Void>>()
            }
        }
        
        /**
         * 创建包含空事件列表的响应式上下文
         * 
         * @param enableAsyncOperations 是否启用异步操作支持
         * @return 包含空事件列表的上下文
         */
        @JvmStatic
        fun createEmptyContext(enableAsyncOperations: Boolean = false): Context {
            var context = Context.of(OUTBOX_EVENTS_KEY, CopyOnWriteArrayList<DomainEvent>())
            if (enableAsyncOperations) {
                context = context.put(ASYNC_OPERATIONS_KEY, CopyOnWriteArrayList<() -> Mono<Void>>())
            }
            return context
        }
        
        /**
         * 使用事务操作符包装Mono，确保在事务中执行
         * 
         * @param mono 要包装的Mono
         * @param transactionalOperator 事务操作符
         * @param enableAsyncOperations 是否启用异步操作支持
         * @return 在事务中执行的Mono
         */
        @JvmStatic
        fun <T> wrapInTransaction(
            mono: Mono<T>, 
            transactionalOperator: TransactionalOperator,
            enableAsyncOperations: Boolean = false
        ): Mono<T> {
            return mono
                .contextWrite { context -> 
                    setupContextIfNeeded(context, enableAsyncOperations)
                }
                .`as`(transactionalOperator::transactional)
        }
        
        /**
         * 使用事务操作符包装Flux，确保在事务中执行
         * 
         * @param flux 要包装的Flux
         * @param transactionalOperator 事务操作符
         * @param enableAsyncOperations 是否启用异步操作支持
         * @return 在事务中执行的Flux
         */
        @JvmStatic
        fun <T> wrapInTransaction(
            flux: Flux<T>, 
            transactionalOperator: TransactionalOperator,
            enableAsyncOperations: Boolean = false
        ): Flux<T> {
            return flux
                .contextWrite { context -> 
                    setupContextIfNeeded(context, enableAsyncOperations)
                }
                .`as`(transactionalOperator::transactional)
        }
        
        /**
         * 如果需要，设置上下文
         * 
         * @param context 当前上下文
         * @param enableAsyncOperations 是否启用异步操作支持
         * @return 设置后的上下文
         */
        private fun setupContextIfNeeded(context: Context, enableAsyncOperations: Boolean): Context {
            var newContext = context
            
            if (!context.hasKey(OUTBOX_EVENTS_KEY)) {
                newContext = newContext.put(OUTBOX_EVENTS_KEY, CopyOnWriteArrayList<DomainEvent>())
            }
            
            if (enableAsyncOperations && !context.hasKey(ASYNC_OPERATIONS_KEY)) {
                newContext = newContext.put(ASYNC_OPERATIONS_KEY, CopyOnWriteArrayList<() -> Mono<Void>>())
            }
            
            return newContext
        }
    }
}
