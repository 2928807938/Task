package com.task.web.security.filter

import com.task.infrastructure.security.jwt.JwtTokenProvider
import com.task.infrastructure.security.jwt.TaskUserDetails
import org.slf4j.LoggerFactory
import org.springframework.http.HttpHeaders
import org.springframework.http.HttpStatus
import org.springframework.http.server.reactive.ServerHttpRequest
import org.springframework.security.core.context.ReactiveSecurityContextHolder
import org.springframework.stereotype.Component
import org.springframework.web.server.ResponseStatusException
import org.springframework.web.server.ServerWebExchange
import org.springframework.web.server.WebFilter
import org.springframework.web.server.WebFilterChain
import reactor.core.publisher.Mono

/**
 * JWT认证过滤器
 * 负责从HTTP请求中提取JWT令牌，验证其有效性，并设置安全上下文
 */
@Component
class JwtAuthenticationFilter(
    private val jwtTokenProvider: JwtTokenProvider
) : WebFilter {

    private val log = LoggerFactory.getLogger(this::class.java)
    
    /**
     * 过滤HTTP请求，提取并验证JWT令牌
     *
     * @param exchange 服务器Web交换对象
     * @param chain Web过滤器链
     * @return Mono<Void> 处理结果
     */
    override fun filter(exchange: ServerWebExchange, chain: WebFilterChain): Mono<Void> {
        val path = exchange.request.path.value()
        log.info("JWT认证过滤器处理请求: {}", path)
        
        try {
            // 从请求中提取令牌
            val token = extractToken(exchange.request)
            log.info("从请求中提取到的token: {}", if (token != null) "存在" else "不存在")
            
            // 如果找到有效令牌，设置安全上下文
            if (token != null) {
                log.info("找到JWT token，开始验证...")
                return validateAndSetContext(token, exchange, chain)
            }
            
            // 没有令牌，继续过滤器链
            log.warn("未找到JWT token，继续过滤器链")
            return chain.filter(exchange)
        } catch (ex: Exception) {
            log.error("JWT认证过程中发生错误: {}", ex.message, ex)
            return Mono.error(ResponseStatusException(HttpStatus.UNAUTHORIZED, "认证失败：${ex.message}"))
        }
    }
    
    /**
     * 验证令牌并设置安全上下文
     *
     * @param token JWT令牌
     * @param exchange 服务器Web交换对象
     * @param chain Web过滤器链
     * @return Mono<Void> 处理结果
     */
    private fun validateAndSetContext(token: String, exchange: ServerWebExchange, chain: WebFilterChain): Mono<Void> {
        return jwtTokenProvider.validateTokenAsync(token)
            .flatMap { valid ->
                if (valid) {
                    val authentication = jwtTokenProvider.getAuthentication(token)
                    
                    // 从认证对象中提取用户ID
                    val principal = authentication.principal
                    val userId = when (principal) {
                        is TaskUserDetails -> {
                            log.info("用户认证成功，用户ID={}, 用户名={}", principal.userId, principal.username)
                            principal.userId
                        }
                        else -> {
                            log.warn("无法从认证对象中提取用户ID, principal类型: {}", principal?.javaClass?.name)
                            return@flatMap Mono.error(ResponseStatusException(HttpStatus.UNAUTHORIZED, "无效的用户信息"))
                        }
                    }
                    
                    // 设置安全上下文，同时在Reactor上下文中保存用户ID
                    log.info("设置响应式上下文，用户ID={}", userId)
                    chain.filter(exchange)
                        .contextWrite(ReactiveSecurityContextHolder.withAuthentication(authentication))
                        .contextWrite { ctx ->
                            log.debug("写入上下文: userId={}", userId)
                            ctx.put("userId", userId.toString())
                        }
                } else {
                    log.warn("无效的JWT令牌")
                    Mono.error(ResponseStatusException(HttpStatus.UNAUTHORIZED, "无效的令牌"))
                }
            }
            .onErrorResume { ex ->
                log.error("JWT令牌验证失败: ${ex.message}")
                Mono.error(ResponseStatusException(HttpStatus.UNAUTHORIZED, "令牌验证失败：${ex.message}"))
            }
    }
    
    /**
     * 从HTTP请求中提取JWT令牌
     *
     * @param request HTTP请求
     * @return 提取的JWT令牌，如果没有找到则返回null
     */
    private fun extractToken(request: ServerHttpRequest): String? {
        // 从Authorization头中提取
        val bearerToken = request.headers.getFirst(HttpHeaders.AUTHORIZATION)
        if (!bearerToken.isNullOrBlank() && bearerToken.startsWith("Bearer ")) {
            return bearerToken.substring(7)
        }
        
        // 从Cookie中提取（可选）
        val cookies = request.cookies["jwt-token"]
        if (!cookies.isNullOrEmpty()) {
            return cookies[0].value
        }
        
        // 从查询参数中提取（可选，不推荐用于生产环境）
        val token = request.queryParams.getFirst("token")
        if (!token.isNullOrBlank()) {
            return token
        }
        
        return null
    }
}