package com.task.domain.service

import reactor.core.publisher.Mono

/**
 * 邮件服务接口
 */
interface EmailService {
    /**
     * 发送验证码邮件
     *
     * @param email 收件人邮箱
     * @param code 验证码
     * @param type 验证码类型
     * @return 发送结果
     */
    fun sendVerificationCode(email: String, code: String, type: String): Mono<Void>
    
    /**
     * 验证验证码是否有效
     *
     * @param email 邮箱地址
     * @param code 验证码
     * @param type 验证码类型
     * @return 验证结果，true为有效，false为无效
     */
    fun verifyCode(email: String, code: String, type: String): Mono<Boolean>
    
    /**
     * 生成验证码
     *
     * @param email 邮箱地址
     * @param type 验证码类型
     * @return 生成的验证码
     */
    fun generateCode(email: String, type: String): Mono<String>
}
