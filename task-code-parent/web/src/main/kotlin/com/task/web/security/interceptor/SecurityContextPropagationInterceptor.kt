package com.task.web.security.interceptor

import com.task.application.utils.SecurityUtils
import com.task.infrastructure.security.jwt.TaskUserDetails
import org.slf4j.LoggerFactory
import org.springframework.core.annotation.Order
import org.springframework.security.core.context.ReactiveSecurityContextHolder
import org.springframework.stereotype.Component
import org.springframework.web.server.ServerWebExchange
import org.springframework.web.server.WebFilter
import org.springframework.web.server.WebFilterChain
import reactor.core.publisher.Mono

/**
 * 安全上下文传播拦截器
 * 确保每个请求都正确设置用户上下文，并在每个请求完成后清理上下文
 * 增强系统的用户数据隔离能力
 * 通过请求标识机制确保每个请求的用户ID隔离，防止线程复用导致的用户ID混淆
 */
@Component
@Order(0) // 确保最先执行，在其他所有过滤器之前清理和设置用户上下文
class SecurityContextPropagationInterceptor(
    private val securityUtils: SecurityUtils
) : WebFilter {
    private val log = LoggerFactory.getLogger(this::class.java)

    override fun filter(exchange: ServerWebExchange, chain: WebFilterChain): Mono<Void> {
        val requestPath = exchange.request.path.value()
        val requestId = exchange.request.id
        val currentThread = Thread.currentThread().name
        
        // 每个请求开始时，无论是什么路径，都清理之前的用户ID缓存
        // 这确保了线程被复用时不会使用上一个请求的用户ID
        securityUtils.clearAllUserIdCache()
        log.debug("请求开始 [{}] 路径[{}] 线程[{}] - 已清理用户ID缓存", 
                  requestId, requestPath, currentThread)
        
        // 如果是公开路径，则直接继续过滤器链，但确保请求结束时清理缓存
        if (isPublicPath(requestPath)) {
            return chain.filter(exchange)
                .doFinally { signal -> 
                    log.debug("公开路径请求结束 [{}] 路径[{}] 信号={}", requestId, requestPath, signal)
                    securityUtils.clearAllUserIdCache()
                }
        }

        // 尝试从安全上下文中提取用户ID
        return ReactiveSecurityContextHolder.getContext()
            .doOnNext { context ->
                val authentication = context.authentication
                val principal = authentication?.principal
                
                if (principal is TaskUserDetails) {
                    log.info("请求[{}] 线程[{}] 的用户上下文：用户ID={}, 用户名={}",
                        requestId, currentThread, principal.userId, principal.username)
                } else {
                    log.warn("请求[{}] 线程[{}] 无法识别的用户主体类型: {}", 
                        requestId, currentThread, principal?.javaClass?.name ?: "null")
                }
            }
            .flatMap { context ->
                val authentication = context.authentication
                if (authentication != null) {
                    val principal = authentication.principal
                    if (principal is TaskUserDetails) {
                        val userId = principal.userId
                        
                        // 在当前线程本地存储中设置用户ID，确保非响应式代码也能获取到用户ID
                        securityUtils.setCurrentThreadUserId(userId)
                        
                        log.info("当前请求[{}] 路径[{}] 线程[{}] 用户ID={}", 
                                 requestId, requestPath, currentThread, userId)
                        
                        // 继续过滤器链并在Reactor上下文中传播用户ID
                        chain.filter(exchange)
                            .contextWrite { ctx -> 
                                // 使用SecurityUtils中定义的常量，确保键名一致
                                ctx.put(securityUtils.USER_ID_KEY, userId.toString()) 
                            }
                            .doFinally { signal ->
                                // 不管请求如何结束，都要清理用户ID缓存
                                log.debug("请求结束 [{}] 路径[{}] 用户ID={} 信号={}", 
                                         requestId, requestPath, userId, signal)
                                // 使用clearAllUserIdCache而非clearCurrentThreadUserId，确保彻底清理
                                securityUtils.clearAllUserIdCache()
                            }
                    } else {
                        log.warn("请求[{}] 无法从认证主体中提取用户ID，主体类型: {}", 
                            requestId, principal?.javaClass?.name ?: "null")
                        chain.filter(exchange)
                            .doFinally { signal -> 
                                log.debug("请求结束（无法识别主体） [{}] 信号={}", requestId, signal)
                                securityUtils.clearAllUserIdCache()
                            }
                    }
                } else {
                    log.warn("请求[{}] 没有认证信息", requestId)
                    chain.filter(exchange)
                        .doFinally { signal -> 
                            log.debug("请求结束（无认证信息） [{}] 信号={}", requestId, signal)
                            securityUtils.clearAllUserIdCache()
                        }
                }
            }
            .switchIfEmpty(
                Mono.defer {
                    log.warn("请求[{}] 无法获取安全上下文", requestId)
                    chain.filter(exchange)
                        .doFinally { signal -> 
                            log.debug("请求结束（无安全上下文） [{}] 信号={}", requestId, signal)
                            securityUtils.clearAllUserIdCache()
                        }
                }
            )
    }
    
    /**
     * 判断是否是公开路径
     */
    private fun isPublicPath(path: String): Boolean {
        val publicPaths = listOf(
            "/api/client/user/register",
            "/api/client/user/login",
            "/api/client/user/send-email-verification-code",
            "/api/client/user/change-password",
            "/actuator/health"
        )
        
        return publicPaths.any { path.startsWith(it) }
    }
}
