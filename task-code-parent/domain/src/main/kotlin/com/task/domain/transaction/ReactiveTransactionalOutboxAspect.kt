package com.task.domain.transaction

import com.task.domain.event.core.DomainEvent
import com.task.domain.event.core.DomainEventPublisher
import org.aspectj.lang.ProceedingJoinPoint
import org.aspectj.lang.annotation.Around
import org.aspectj.lang.annotation.Aspect
import org.aspectj.lang.reflect.MethodSignature
import org.slf4j.LoggerFactory
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.core.annotation.Order
import org.springframework.stereotype.Component
import org.springframework.transaction.ReactiveTransactionManager
import org.springframework.transaction.reactive.TransactionalOperator
import reactor.core.publisher.Flux
import reactor.core.publisher.Mono
import reactor.core.scheduler.Schedulers
import reactor.util.context.Context
import java.util.concurrent.CopyOnWriteArrayList
import java.lang.reflect.Method

/**
 * 响应式事务性发件箱模式切面
 * 
 * 负责处理 @ReactiveTransactionalOutbox 注解：
 * 1. 在事务中收集领域事件
 * 2. 事务成功提交后发布事件
 * 3. 如果启用了异步操作，则在事务提交后异步执行
 * 
 * 设计原则：
 * - 简单易用：只做最核心的事情
 * - 可靠稳定：基于R2DBC的实际能力
 * - 性能友好：避免不必要的复杂性
 */
@Aspect
@Component
@Order(0) // 确保在事务切面之前执行
class ReactiveTransactionalOutboxAspect {
    
    private val log = LoggerFactory.getLogger(ReactiveTransactionalOutboxAspect::class.java)
    
    @Autowired
    private lateinit var reactiveTransactionManager: ReactiveTransactionManager
    
    @Autowired
    private lateinit var domainEventPublisher: DomainEventPublisher
    
    /**
     * 环绕通知，处理带有 @ReactiveTransactionalOutbox 注解的方法
     * 
     * @param joinPoint 切点
     * @return 方法执行结果
     */
    @Around("@annotation(com.task.domain.transaction.ReactiveTransactionalOutbox)")
    fun aroundTransactionalOutboxMethod(joinPoint: ProceedingJoinPoint): Any {
        val signature = joinPoint.signature as MethodSignature
        val methodName = "${signature.declaringType.simpleName}.${signature.name}"
        
        log.debug("处理响应式事务性发件箱方法: {}", methodName)
        
        // 获取注解配置
        val annotation = getAnnotation(signature.method)
        val enableAsyncOperations = annotation?.enableAsyncOperations ?: false
        
        // 创建事务操作符
        val transactionalOperator = TransactionalOperator.create(reactiveTransactionManager)
        
        // 简化处理，直接执行方法并应用事务
        return try {
            val result = joinPoint.proceed()
            
            when (result) {
                is Mono<*> -> {
                    handleMonoResult(result, transactionalOperator, methodName, enableAsyncOperations)
                }
                is Flux<*> -> {
                    handleFluxResult(result, transactionalOperator, methodName, enableAsyncOperations)
                }
                else -> {
                    log.error("不支持的返回类型: {}，方法: {}", result?.javaClass?.name, methodName)
                    throw IllegalArgumentException("ReactiveTransactionalOutbox 只支持返回 Mono 或 Flux 的方法")
                }
            }
        } catch (e: Throwable) {
            log.error("响应式事务方法执行失败: {}", methodName, e)
            when {
                signature.returnType.isAssignableFrom(Mono::class.java) -> Mono.error<Any>(e)
                signature.returnType.isAssignableFrom(Flux::class.java) -> Flux.error<Any>(e)
                else -> throw e
            }
        }
    }
    
    /**
     * 处理 Mono 结果
     * 
     * @param mono 方法返回的 Mono
     * @param transactionalOperator 事务操作符
     * @param methodName 方法名称
     * @param enableAsyncOperations 是否启用异步操作
     * @return 处理后的 Mono
     */
    private fun handleMonoResult(
        mono: Mono<*>,
        transactionalOperator: TransactionalOperator,
        methodName: String,
        enableAsyncOperations: Boolean
    ): Mono<*> {
        return mono
            // 设置事务上下文
            .contextWrite { context ->
                setupTransactionContext(context, enableAsyncOperations)
            }
            // 包装在事务中
            .`as` { transactionalOperator.transactional(it) }
            // 在事务提交后处理事件和异步操作
            .flatMap { result ->
                handlePostTransactionOperations(result, methodName, enableAsyncOperations)
            }
            .doOnError { e ->
                log.error("响应式事务方法执行失败: {}", methodName, e)
            }
    }
    
    /**
     * 处理 Flux 结果
     * 
     * @param flux 方法返回的 Flux
     * @param transactionalOperator 事务操作符
     * @param methodName 方法名称
     * @param enableAsyncOperations 是否启用异步操作
     * @return 处理后的 Flux
     */
    private fun handleFluxResult(
        flux: Flux<*>,
        transactionalOperator: TransactionalOperator,
        methodName: String,
        enableAsyncOperations: Boolean
    ): Flux<*> {
        return flux
            // 设置事务上下文
            .contextWrite { context ->
                setupTransactionContext(context, enableAsyncOperations)
            }
            // 包装在事务中
            .`as` { transactionalOperator.transactional(it) }
            // 收集所有结果
            .collectList()
            .flatMapMany { results ->
                // 在事务提交后处理事件和异步操作
                handlePostTransactionOperations(results, methodName, enableAsyncOperations)
                    .thenMany(Flux.fromIterable(results))
            }
            .doOnError { e ->
                log.error("响应式Flux方法执行失败: {}, 错误信息: {}", methodName, e)
            }
    }
    
    /**
     * 获取ReactiveTransactionalOutbox注解
     * 
     * @param method 方法对象
     * @return 注解实例
     */
    private fun getAnnotation(method: Method): ReactiveTransactionalOutbox? {
        return method.getAnnotation(ReactiveTransactionalOutbox::class.java)
            ?: method.declaringClass.getAnnotation(ReactiveTransactionalOutbox::class.java)
    }
    
    /**
     * 设置事务上下文
     * 
     * @param context 当前上下文
     * @param enableAsyncOperations 是否启用异步操作
     * @return 设置后的上下文
     */
    private fun setupTransactionContext(context: Context, enableAsyncOperations: Boolean): Context {
        var newContext = context
        
        // 设置事件上下文
        if (!newContext.hasKey(ReactiveTransactionalOutboxContext.OUTBOX_EVENTS_KEY)) {
            newContext = newContext.put(
                ReactiveTransactionalOutboxContext.OUTBOX_EVENTS_KEY,
                CopyOnWriteArrayList<DomainEvent>()
            )
        }
        
        // 如果启用了异步操作，设置异步操作上下文
        if (enableAsyncOperations && !newContext.hasKey(ReactiveTransactionalOutboxContext.ASYNC_OPERATIONS_KEY)) {
            newContext = newContext.put(
                ReactiveTransactionalOutboxContext.ASYNC_OPERATIONS_KEY,
                CopyOnWriteArrayList<() -> Mono<Void>>()
            )
        }
        
        return newContext
    }
    
    /**
     * 处理事务提交后的操作（发布事件和异步操作）
     * 
     * @param result 方法执行结果
     * @param methodName 方法名称
     * @param enableAsyncOperations 是否启用了异步操作
     * @return 处理后的Mono
     */
    private fun handlePostTransactionOperations(result: Any, methodName: String, enableAsyncOperations: Boolean): Mono<Any> {
        return ReactiveTransactionalOutboxContext.getEvents()
            .flatMap { events ->
                val eventsMono = if (events.isNotEmpty()) {
                    log.debug("事务提交后发布 {} 个事件，方法: {}", events.size, methodName)
                    publishEvents(events)
                } else {
                    Mono.empty<Void>()
                }
                
                if (enableAsyncOperations) {
                    // 处理异步操作
                    ReactiveTransactionalOutboxContext.getAsyncOperations()
                        .doOnNext { operations ->
                            if (operations.isNotEmpty()) {
                                log.debug("事务提交后异步执行 {} 个操作，方法: {}", operations.size, methodName)
                                // 异步执行操作，不阻塞主流程
                                executeAsync {
                                    executeOperationsIfNeeded(operations, methodName)
                                }
                            }
                        }
                        .then(eventsMono)
                } else {
                    eventsMono
                }
            }
            .then(Mono.just(result))
    }
    
    /**
     * 发布领域事件（在事务提交后）
     * 
     * @param events 要发布的事件列表
     * @return 完成信号
     */
    private fun publishEvents(events: List<DomainEvent>): Mono<Void> {
        if (events.isEmpty()) {
            return Mono.empty()
        }
        
        return Flux.fromIterable(events)
            .flatMap { event ->
                domainEventPublisher.publishAsync(event)
                    .doOnSuccess {
                        log.debug("已发布事件: {}", event.javaClass.simpleName)
                    }
                    .onErrorResume { e ->
                        // 事件发布失败不影响业务逻辑
                        log.warn("事件发布失败: {}", event.javaClass.simpleName, e)
                        Mono.empty()
                    }
            }
            .then()
    }
    
    /**
     * 异步执行操作
     * 
     * @param operation 要执行的操作
     */
    private fun executeAsync(operation: () -> Unit) {
        Schedulers.boundedElastic().schedule(operation)
    }
    
    /**
     * 如果需要，发布事件
     * 
     * @param events 事件列表
     * @param methodName 方法名称
     */
    private fun publishEventsIfNeeded(events: List<DomainEvent>, methodName: String) {
        if (events.isNotEmpty()) {
            log.debug("异步发布 {} 个事件，方法: {}", events.size, methodName)
            
            Flux.fromIterable(events)
                .flatMap { event ->
                    domainEventPublisher.publishAsync(event)
                        .doOnSuccess {
                            log.debug("已异步发布事件: {}", event.javaClass.simpleName)
                        }
                        .onErrorResume { e ->
                            log.warn("异步事件发布失败: {}", event.javaClass.simpleName, e)
                            Mono.empty()
                        }
                }
                .subscribeOn(Schedulers.boundedElastic())
                .subscribe()
        }
    }
    
    /**
     * 如果需要，执行异步操作
     * 
     * @param operations 操作列表
     * @param methodName 方法名称
     */
    private fun executeOperationsIfNeeded(operations: List<() -> Mono<Void>>, methodName: String) {
        if (operations.isNotEmpty()) {
            log.debug("异步执行 {} 个操作，方法: {}", operations.size, methodName)
            
            Flux.fromIterable(operations)
                .flatMap { operation ->
                    operation.invoke()
                        .doOnSuccess {
                            log.debug("已异步执行操作")
                        }
                        .onErrorResume { e ->
                            log.warn("异步操作执行失败: {}", e.message, e)
                            Mono.empty()
                        }
                }
                .subscribeOn(Schedulers.boundedElastic())
                .subscribe()
        }
    }
}
