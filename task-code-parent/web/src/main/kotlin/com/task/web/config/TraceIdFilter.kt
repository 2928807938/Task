package com.task.web.config

import org.slf4j.LoggerFactory
import org.slf4j.MDC
import org.springframework.core.Ordered
import org.springframework.core.annotation.Order
import org.springframework.stereotype.Component
import org.springframework.web.server.ServerWebExchange
import org.springframework.web.server.WebFilter
import org.springframework.web.server.WebFilterChain
import reactor.core.publisher.Hooks
import reactor.core.publisher.Mono
import reactor.core.scheduler.Schedulers
import reactor.util.context.Context
import java.util.*

/**
 * 追踪ID过滤器
 * 为每个请求生成唯一的追踪ID并传递到响应式上下文中
 * 同时提供MDC上下文处理，确保日志中显示追踪ID
 * 
 * 在响应式编程中，MDC是线程局部的，需要特殊处理才能在不同线程间传递
 */
@Component
@Order(Ordered.HIGHEST_PRECEDENCE)
class TraceIdFilter : WebFilter {
    private val logger = LoggerFactory.getLogger(TraceIdFilter::class.java)

    companion object {
        const val TRACE_ID_KEY = "traceId"
        private val log = LoggerFactory.getLogger(TraceIdFilter::class.java)
        
        // 在静态初始化块中设置Hook，确保最早执行
        init {
            // 配置Reactor的全局Hook，确保在所有调度器上都能传递MDC上下文
            Schedulers.onScheduleHook("mdc-hook") { runnable ->
                val mdcContext = MDC.getCopyOfContextMap() ?: emptyMap()
                Runnable {
                    val oldContext = MDC.getCopyOfContextMap()
                    try {
                        MDC.setContextMap(mdcContext)
                        runnable.run()
                    } finally {
                        if (oldContext != null) MDC.setContextMap(oldContext) else MDC.clear()
                    }
                }
            }

            // 添加异常处理Hook，确保异常情况下也能传递traceId
            Hooks.onErrorDropped { error ->
                log.error("Reactor dropped error: {}", error.message, error)
            }
            
            // 添加操作行为Hook，在切换操作时保留MDC上下文
            Hooks.onOperatorDebug()
            
            log.info("已全局配置MDC上下文传递Hook")
        }
    }

    override fun filter(exchange: ServerWebExchange, chain: WebFilterChain): Mono<Void> {
        // 从请求头中获取traceId，如果没有则生成新的
        val traceId = exchange.request.headers.getFirst(TRACE_ID_KEY) ?: UUID.randomUUID().toString()
        logger.debug("生成追踪ID: $traceId 用于请求: ${exchange.request.path}")
        
        // 将traceId存储在exchange属性中，使异常处理器也能访问
        exchange.attributes[TRACE_ID_KEY] = traceId
        
        // 设置响应头
        exchange.response.headers.add(TRACE_ID_KEY, traceId)

        // 清除当前线程的MDC以防止污染
        MDC.clear()
        // 将traceId放入当前线程的MDC
        MDC.put(TRACE_ID_KEY, traceId)

        // 创建包含traceId的上下文
        val context = Context.of(TRACE_ID_KEY, traceId)

        // 使用装饰器封装响应式链，在每个操作前后处理MDC
        return chain.filter(exchange)
            // 直接处理异常，确保异常情况下也能捕获到traceId
            .onErrorResume { error ->
                // 在异常处理链中也设置MDC
                MDC.put(TRACE_ID_KEY, traceId)
                logger.error("请求处理异常: {}", error.message, error)
                // 将异常继续传递，但确保已记录了跟踪信息
                Mono.error<Void>(error)
                    .contextWrite { ctx -> ctx.putAll(context) }
            }
            // 将traceId放入Reactor上下文
            .contextWrite { ctx -> ctx.putAll(context) }
            // 添加doOnEach处理每个信号，确保在每个操作时都设置MDC
            .doOnEach { signal ->
                if (signal.isOnNext || signal.isOnError || signal.isOnComplete) {
                    try {
                        // 从上下文获取traceId并设置到MDC
                        val ctxTraceId = signal.contextView.getOrDefault(TRACE_ID_KEY, traceId)
                        MDC.put(TRACE_ID_KEY, ctxTraceId)
                    } catch (e: Exception) {
                        logger.warn("设置MDC上下文失败", e)
                        // 出错时使用原始traceId
                        MDC.put(TRACE_ID_KEY, traceId)
                    }
                }
            }
            // 请求完成后清理MDC
            .doFinally { MDC.clear() }
    }
}