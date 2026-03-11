package com.task.domain.operator

import reactor.core.publisher.Mono

/**
 * 令牌操作接口
 * 负责令牌的生成、验证和黑名单管理
 */
interface TokenOperator {
    /**
     * 创建认证令牌
     *
     * @param userId 用户ID
     * @param username 用户名
     * @param authorities 权限列表
     * @return 生成的令牌
     */
    fun createToken(userId: Long, username: String, authorities: List<String>): String
    
    /**
     * 获取令牌过期时间（秒）
     *
     * @return 令牌过期时间
     */
    fun getTokenExpirationTime(): Long

    /**
     * 从JWT令牌中提取用户ID
     *
     * @param token JWT令牌
     * @return 用户ID
     */
    fun getUserId(token: String): Long
    
    /**
     * 将令牌添加到黑名单
     *
     * @param token 要添加的令牌
     * @param expirationTimeSeconds 令牌的过期时间（秒）
     * @return 操作结果
     */
    fun addToBlacklist(token: String, expirationTimeSeconds: Long): Mono<Void>
    
    /**
     * 检查令牌是否在黑名单中
     *
     * @param token 要检查的令牌
     * @return 如果令牌在黑名单中则返回true，否则返回false
     */
    fun isBlacklisted(token: String): Mono<Boolean>
}
