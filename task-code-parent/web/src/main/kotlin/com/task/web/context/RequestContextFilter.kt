package com.task.web.context

import com.task.shared.context.RequestContextHolder
import com.task.web.config.TraceIdFilter
import org.slf4j.LoggerFactory
import org.springframework.core.annotation.Order
import org.springframework.stereotype.Component
import org.springframework.web.server.ServerWebExchange
import org.springframework.web.server.WebFilter
import org.springframework.web.server.WebFilterChain
import reactor.core.publisher.Mono
import java.util.*

/**
 * 请求上下文过滤器
 * 用于在每个请求开始时设置上下文信息，如请求ID、跟踪ID等
 */
@Component
@Order(-100)  // 确保在JWT认证过滤器之前执行
class RequestContextFilter : WebFilter {

    private val log = LoggerFactory.getLogger(this::class.java)

    companion object {
        private const val HEADER_USER_ID = "X-User-ID"
        private const val HEADER_TENANT_ID = "X-Tenant-ID"
        private const val HEADER_TRACE_ID = "X-Trace-ID"
    }

    override fun filter(exchange: ServerWebExchange, chain: WebFilterChain): Mono<Void> {
        val path = exchange.request.path.value()
        log.info("RequestContextFilter处理请求: {}", path)
        
        // 从请求头中提取信息
        val headers = exchange.request.headers
        val userId = headers.getFirst(HEADER_USER_ID)
        val tenantId = headers.getFirst(HEADER_TENANT_ID)
        val traceId = exchange.attributes[TraceIdFilter.TRACE_ID_KEY] as? String
            ?: headers.getFirst(HEADER_TRACE_ID)
            ?: headers.getFirst(TraceIdFilter.TRACE_ID_KEY)
            ?: UUID.randomUUID().toString()
        val requestId = UUID.randomUUID().toString()

        log.debug("请求头用户ID: {}, 跟踪ID: {}", userId, traceId)

        // 将跟踪ID添加到响应头
        exchange.response.headers.add(HEADER_TRACE_ID, traceId)

        // 设置响应式上下文并执行请求链
        return chain.filter(exchange)
            .contextWrite { ctx ->
                var newCtx = ctx.put("requestId", requestId)
                    .put("traceId", traceId)
                
                // 只有在有用户ID时才设置
                userId?.let { 
                    log.debug("从请求头设置用户ID到上下文: {}", it)
                    newCtx = newCtx.put("userId", it) 
                }
                tenantId?.let { newCtx = newCtx.put("tenantId", it) }
                
                newCtx
            }
    }
}
