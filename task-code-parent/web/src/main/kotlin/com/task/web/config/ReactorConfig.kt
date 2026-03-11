package com.task.web.config

import org.slf4j.LoggerFactory
import org.slf4j.MDC
import org.springframework.boot.context.event.ApplicationStartedEvent
import org.springframework.context.annotation.Configuration
import org.springframework.context.event.EventListener
import reactor.core.publisher.Hooks
import reactor.core.publisher.Operators
import reactor.core.scheduler.Schedulers
import reactor.util.context.Context
import java.util.function.Function

/**
 * Reactor 全局配置 - MDC上下文传递
 * 确保在所有响应式操作中都能正确传递MDC上下文，包括traceId
 */
@Configuration
class ReactorConfig {
    private val logger = LoggerFactory.getLogger(ReactorConfig::class.java)
    
    companion object {
        const val MDC_CONTEXT_REACTOR_KEY = "MDC_CONTEXT"
        private const val HOOK_KEY = "mdc-context-propagation"

        private val MDC_CONTEXT_SCHEDULER_SUPPLIER = Function<Runnable, Runnable> { runnable ->
            val contextMap = MDC.getCopyOfContextMap()
            Runnable {
                val oldContextMap = MDC.getCopyOfContextMap()
                try {
                    if (contextMap != null) {
                        MDC.setContextMap(contextMap)
                    } else {
                        MDC.clear()
                    }
                    runnable.run()
                } finally {
                    if (oldContextMap != null) {
                        MDC.setContextMap(oldContextMap)
                    } else {
                        MDC.clear()
                    }
                }
            }
        }
    }
    
    @EventListener(ApplicationStartedEvent::class)
    fun onApplicationStarted() {
        try {
            val currentThread = Thread.currentThread().name
            logger.info("在线程 {} 上配置MDC上下文传递", currentThread)

            // 配置Scheduler钩子，在不同线程间传递MDC上下文
            Schedulers.onScheduleHook(HOOK_KEY, MDC_CONTEXT_SCHEDULER_SUPPLIER)

            // 配置Reactor操作符钩子，传递MDC上下文到响应式链中
            Hooks.onEachOperator(HOOK_KEY, Operators.liftPublisher { _, subscriber ->
                MdcContextSubscriber(subscriber, subscriber.currentContext())
            })

            // 配置错误处理钩子
            Hooks.onErrorDropped { error ->
                val traceId = MDC.get(TraceIdFilter.TRACE_ID_KEY)
                val errorMsg = error.message ?: error.javaClass.simpleName
                if (traceId != null) {
                    logger.error("未处理的响应式错误[{}]: {}", traceId, errorMsg, error)
                } else {
                    logger.error("未处理的响应式错误: {}", errorMsg, error)
                }
            }

            logger.info("MDC上下文传递配置完成")
        } catch (e: Exception) {
            logger.error("配置MDC上下文传递失败", e)
        }
    }

    /**
     * 自定义订阅者，用于在响应式流中传递MDC上下文
     */
    private class MdcContextSubscriber<T>(private val actual: reactor.core.CoreSubscriber<T>, 
                                       parentContext: Context) : reactor.core.CoreSubscriber<T> {
        
        private val context: Context
        
        init {
            val initialContext = if (parentContext.size() > 0) parentContext else Context.empty()
            
            // 尝试从上下文中获取MDC信息
            val mdcContextMap = MDC.getCopyOfContextMap() ?: emptyMap<String, String>()
            val mdcContext = Context.of(MDC_CONTEXT_REACTOR_KEY, mdcContextMap)
            
            this.context = initialContext.putAll(mdcContext)
        }
        
        override fun currentContext(): Context {
            return context
        }
        
        override fun onSubscribe(s: org.reactivestreams.Subscription) {
            actual.onSubscribe(s)
        }
        
        override fun onNext(t: T) {
            val map = context.getOrDefault(MDC_CONTEXT_REACTOR_KEY, null) as? Map<String, String>
            if (map != null) {
                val oldMap = MDC.getCopyOfContextMap()
                try {
                    MDC.setContextMap(map)
                    actual.onNext(t)
                } finally {
                    if (oldMap != null) {
                        MDC.setContextMap(oldMap)
                    } else {
                        MDC.clear()
                    }
                }
            } else {
                actual.onNext(t)
            }
        }
        
        override fun onError(t: Throwable) {
            val map = context.getOrDefault(MDC_CONTEXT_REACTOR_KEY, null) as? Map<String, String>
            if (map != null) {
                val oldMap = MDC.getCopyOfContextMap()
                try {
                    MDC.setContextMap(map)
                    actual.onError(t)
                } finally {
                    if (oldMap != null) {
                        MDC.setContextMap(oldMap)
                    } else {
                        MDC.clear()
                    }
                }
            } else {
                actual.onError(t)
            }
        }
        
        override fun onComplete() {
            val map = context.getOrDefault(MDC_CONTEXT_REACTOR_KEY, null) as? Map<String, String>
            if (map != null) {
                val oldMap = MDC.getCopyOfContextMap()
                try {
                    MDC.setContextMap(map)
                    actual.onComplete()
                } finally {
                    if (oldMap != null) {
                        MDC.setContextMap(oldMap)
                    } else {
                        MDC.clear()
                    }
                }
            } else {
                actual.onComplete()
            }
        }
    }
}
