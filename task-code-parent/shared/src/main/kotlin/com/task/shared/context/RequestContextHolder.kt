package com.task.shared.context

import mu.KotlinLogging
import reactor.core.publisher.Mono
import reactor.util.context.Context

/**
 * 请求上下文持有者
 * 用于在响应式流中管理请求级别的上下文信息
 * 简化版本，只保留基本的用户ID、请求ID、租户ID和追踪ID管理
 */
object RequestContextHolder {
    private val logger = KotlinLogging.logger {}

    /**
     * 上下文键定义
     */
    private object ContextKeys {
        const val USER_ID = "userId"
        const val REQUEST_ID = "requestId"
        const val TENANT_ID = "tenantId"
        const val TRACE_ID = "traceId"
    }

    /**
     * 获取当前用户ID
     */
    fun getUserId(): String? {
        return try {
            Mono.deferContextual { ctx ->
                val userId = ctx.getOrEmpty<String>(ContextKeys.USER_ID).orElse(null)
                logger.debug { "从上下文获取用户ID: $userId" }
                Mono.just(userId)
            }.block()
        } catch (e: Exception) {
            logger.warn { "Failed to get userId from context: ${e.message}" }
            null
        }
    }

    /**
     * 获取当前用户ID（Long类型）
     * 用于权限校验等需要Long类型用户ID的场景
     */
    fun getCurrentUserId(): Long? {
        return try {
            val userIdString = getUserId()
            logger.debug { "转换用户ID字符串为Long: $userIdString" }
            userIdString?.toLongOrNull()
        } catch (e: Exception) {
            logger.warn { "Failed to convert userId to Long: ${e.message}" }
            null
        }
    }

    /**
     * 获取请求ID
     */
    fun getRequestId(): String? {
        return try {
            Mono.deferContextual { ctx ->
                Mono.just(ctx.getOrEmpty<String>(ContextKeys.REQUEST_ID).orElse(null))
            }.block()
        } catch (e: Exception) {
            logger.warn { "Failed to get requestId from context: ${e.message}" }
            null
        }
    }

    /**
     * 获取租户ID
     */
    fun getTenantId(): String? {
        return try {
            Mono.deferContextual { ctx ->
                Mono.just(ctx.getOrEmpty<String>(ContextKeys.TENANT_ID).orElse(null))
            }.block()
        } catch (e: Exception) {
            logger.warn { "Failed to get tenantId from context: ${e.message}" }
            null
        }
    }

    /**
     * 获取追踪ID
     */
    fun getTraceId(): String? {
        return try {
            Mono.deferContextual { ctx ->
                Mono.just(ctx.getOrEmpty<String>(ContextKeys.TRACE_ID).orElse(null))
            }.block()
        } catch (e: Exception) {
            logger.warn { "Failed to get traceId from context: ${e.message}" }
            null
        }
    }

    /**
     * 使用指定的用户ID执行代码块
     */
    fun <T> withUserId(userId: Long?, block: Mono<T>): Mono<T> {
        return block.contextWrite { ctx ->
            userId?.let { ctx.put(ContextKeys.USER_ID, it.toString()) } ?: ctx
        }
    }

    /**
     * 使用指定的请求ID执行代码块
     */
    fun <T> withRequestId(requestId: String?, block: Mono<T>): Mono<T> {
        return block.contextWrite { ctx ->
            requestId?.let { ctx.put(ContextKeys.REQUEST_ID, it) } ?: ctx
        }
    }

    /**
     * 使用指定的租户ID执行代码块
     */
    fun <T> withTenantId(tenantId: String?, block: Mono<T>): Mono<T> {
        return block.contextWrite { ctx ->
            tenantId?.let { ctx.put(ContextKeys.TENANT_ID, it) } ?: ctx
        }
    }

    /**
     * 使用指定的追踪ID执行代码块
     */
    fun <T> withTraceId(traceId: String?, block: Mono<T>): Mono<T> {
        return block.contextWrite { ctx ->
            traceId?.let { ctx.put(ContextKeys.TRACE_ID, it) } ?: ctx
        }
    }

    /**
     * 使用完整的上下文信息执行代码块
     */
    fun withContext(
        userId: Long? = null,
        requestId: String? = null,
        tenantId: String? = null,
        traceId: String? = null,
        block: () -> Mono<*>
    ): Mono<Void> {
        return Mono.deferContextual { existingContext ->
            var context: Context = Context.of(existingContext)

            // 设置用户ID
            userId?.let { context = context.put(ContextKeys.USER_ID, it.toString()) }

            // 设置请求ID
            requestId?.let { context = context.put(ContextKeys.REQUEST_ID, it) }

            // 设置租户ID
            tenantId?.let { context = context.put(ContextKeys.TENANT_ID, it) }

            // 设置追踪ID
            traceId?.let { context = context.put(ContextKeys.TRACE_ID, it) }

            block().contextWrite(context).then()
        }
    }
}