package com.task.infrastructure.security.jwt

import com.task.domain.operator.TokenOperator
import io.jsonwebtoken.Claims
import io.jsonwebtoken.JwtException
import io.jsonwebtoken.Jwts
import io.jsonwebtoken.security.Keys
import org.slf4j.LoggerFactory
import org.springframework.beans.factory.annotation.Value
import org.springframework.data.redis.core.ReactiveRedisTemplate
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken
import org.springframework.security.core.Authentication
import org.springframework.security.core.authority.SimpleGrantedAuthority
import org.springframework.security.core.userdetails.UserDetails
import org.springframework.stereotype.Component
import reactor.core.publisher.Mono
import java.security.MessageDigest
import java.time.Duration
import java.util.*
import javax.crypto.SecretKey

/**
 * JWT令牌提供者
 * 负责JWT令牌的生成、解析和验证
 */
@Component
class JwtTokenProvider(

    @Value("\${jwt.secret:defaultSecretKeyForDevelopmentOnly}")
    private val secretKeyString: String,

    @Value("\${jwt.expiration:86400}")
    private val validityInSeconds: Long,

    private val redisTemplate: ReactiveRedisTemplate<String, Any>

) : TokenOperator {

    private val logger = LoggerFactory.getLogger(this::class.java)

    private val blacklistKeyPrefix = "token:blacklist:"


    private val secretKey: SecretKey by lazy {
        val keyBytes = if (secretKeyString.length < 32) {
            // 如果密钥长度不足，使用SHA-256哈希扩展密钥
            MessageDigest.getInstance("SHA-256")
                .digest(secretKeyString.toByteArray())
        } else {
            secretKeyString.toByteArray()
        }

        try {
            val key = Keys.hmacShaKeyFor(keyBytes)

            // 在开发环境中检查是否使用了默认密钥
            if (secretKeyString == "defaultSecretKeyForDevelopmentOnly") {
                logger.warn("警告：正在使用默认JWT密钥。在生产环境中，请设置自定义密钥。")
            }

            key
        } catch (e: Exception) {
            logger.error("初始化JWT密钥失败", e)
            throw IllegalStateException("无法初始化JWT密钥", e)
        }
    }

    /**
     * 创建JWT令牌
     *
     * @param userId 用户ID
     * @param username 用户名
     * @param authorities 用户权限列表
     * @return 生成的JWT令牌
     */
    override fun createToken(userId: Long, username: String, authorities: List<String>): String {
        val now = Date()
        val validity = Date(now.time + validityInSeconds * 1000)
        
        val claims = Jwts.claims()
            .subject(username)
            .add("userId", userId)
            .add("authorities", authorities)
            .build()
        
        return Jwts.builder()
            .claims(claims)
            .issuedAt(now)
            .expiration(validity)
            .signWith(secretKey)
            .compact()
    }
    
    /**
     * 从JWT令牌中获取认证信息
     *
     * @param token JWT令牌
     * @return 认证对象
     */
    fun getAuthentication(token: String): Authentication {
        val claims = getClaims(token)
        val username = claims.subject
        val userId = when (val userIdClaim = claims["userId"]) {
            is Long -> userIdClaim
            is Number -> userIdClaim.toLong()
            is String -> userIdClaim.toLong()
            else -> throw IllegalArgumentException("无法解析userId: $userIdClaim")
        }
        val authorities = (claims["authorities"] as List<*>).filterIsInstance<String>()
            .map { SimpleGrantedAuthority(it) }
        
        val principal = TaskUserDetails(userId, username, "", authorities)
        return UsernamePasswordAuthenticationToken(principal, token, authorities)
    }
    
    /**
     * 从JWT令牌中提取用户ID
     *
     * @param token JWT令牌
     * @return 用户ID
     */
    override fun getUserId(token: String): Long {
        return when (val userIdClaim = getClaims(token)["userId"]) {
            is Long -> userIdClaim
            is Number -> userIdClaim.toLong()
            is String -> userIdClaim.toLong()
            else -> throw IllegalArgumentException("无法解析userId: $userIdClaim")
        }
    }
    
    /**
     * 从JWT令牌中提取用户名
     *
     * @param token JWT令牌
     * @return 用户名
     */
    fun getUsername(token: String): String {
        return getClaims(token).subject
    }
    
    /**
     * 验证JWT令牌的有效性
     *
     * @param token JWT令牌
     * @return 如果令牌有效则返回true，否则返回false
     */
    fun validateToken(token: String): Boolean {
        try {
            val claims = getClaims(token)
            
            // 检查令牌是否过期
            if (claims.expiration.before(Date())) {
                return false
            }
            
            // 检查令牌是否在黑名单中（同步方式）
            val isBlacklisted = isBlacklisted(token).block()
            if (isBlacklisted == true) {
                logger.warn("令牌已被注销: {}", token)
                return false
            }
            
            return true
        } catch (e: JwtException) {
            logger.error("无效的JWT令牌")
            return false
        } catch (e: IllegalArgumentException) {
            logger.error("JWT令牌为空或无效")
            return false
        }
    }
    
    /**
     * 获取JWT令牌中的声明
     *
     * @param token JWT令牌
     * @return 声明对象
     */
    private fun getClaims(token: String): Claims {
        return Jwts.parser()
            .verifyWith(secretKey)
            .build()
            .parseSignedClaims(token)
            .payload
    }
    
    /**
     * 获取令牌过期时间（秒）
     *
     * @return 令牌过期时间
     */
    override fun getTokenExpirationTime(): Long {
        return validityInSeconds
    }

    /**
     * 将令牌添加到黑名单
     *
     * @param token 要添加的令牌
     * @param expirationTimeSeconds 令牌的过期时间（秒）
     * @return 操作结果
     */
    override fun addToBlacklist(token: String, expirationTimeSeconds: Long): Mono<Void> {
        val key = blacklistKeyPrefix + token
        val value = "revoked"

        logger.info("添加令牌到黑名单: {}, 过期时间: {}秒", token, expirationTimeSeconds)

        return redisTemplate.opsForValue()
            .set(key, value, Duration.ofSeconds(expirationTimeSeconds))
            .doOnSuccess { logger.debug("令牌已成功添加到黑名单: {}", token) }
            .doOnError { e -> logger.error("添加令牌到黑名单失败: {}", token, e) }
            .then()
    }

    /**
     * 检查令牌是否在黑名单中
     *
     * @param token 要检查的令牌
     * @return 如果令牌在黑名单中则返回true，否则返回false
     */
    override fun isBlacklisted(token: String): Mono<Boolean> {
        val key = blacklistKeyPrefix + token

        return redisTemplate.hasKey(key)
            .doOnSuccess { exists ->
                if (exists) {
                    logger.debug("令牌在黑名单中: {}", token)
                }
            }
    }
    
    /**
     * 异步验证JWT令牌的有效性
     *
     * @param token JWT令牌
     * @return 如果令牌有效则返回true，否则返回false
     */
    fun validateTokenAsync(token: String): Mono<Boolean> {
        return try {
            val claims = getClaims(token)
            
            // 检查令牌是否过期
            if (claims.expiration.before(Date())) {
                Mono.just(false)
            } else {
                // 检查令牌是否在黑名单中
                isBlacklisted(token)
                    .map { isBlacklisted -> !isBlacklisted }
            }
        } catch (e: JwtException) {
            logger.error("无效的JWT令牌")
            Mono.just(false)
        } catch (e: IllegalArgumentException) {
            logger.error("JWT令牌为空或无效")
            Mono.just(false)
        }
    }
}

/**
 * 自定义用户详情类
 * 用于存储认证用户的信息
 */
data class TaskUserDetails(
    val userId: Long,
    private val username: String,
    private val password: String,
    private val authorities: Collection<SimpleGrantedAuthority>
) : UserDetails {
    
    override fun getAuthorities(): Collection<SimpleGrantedAuthority> = authorities
    
    override fun getPassword(): String = password
    
    override fun getUsername(): String = username
    
    override fun isAccountNonExpired(): Boolean = true
    
    override fun isAccountNonLocked(): Boolean = true
    
    override fun isCredentialsNonExpired(): Boolean = true
    
    override fun isEnabled(): Boolean = true
}
