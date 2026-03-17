package com.task.infrastructure.adapter

import com.task.domain.service.EmailService
import jakarta.mail.internet.InternetAddress
import org.slf4j.LoggerFactory
import org.springframework.beans.factory.annotation.Value
import org.springframework.data.redis.core.ReactiveStringRedisTemplate
import org.springframework.mail.MailAuthenticationException
import org.springframework.mail.MailSendException
import org.springframework.mail.javamail.JavaMailSender
import org.springframework.mail.javamail.MimeMessageHelper
import org.springframework.stereotype.Component
import com.task.shared.exceptions.EmailSendException
import reactor.core.publisher.Mono
import reactor.core.scheduler.Schedulers
import java.time.Duration
import java.util.concurrent.ThreadLocalRandom

/**
 * 邮件服务适配器
 * 实现邮件发送和验证码管理功能
 */
@Component
class EmailAdapter(
    private val mailSender: JavaMailSender,
    private val redisTemplate: ReactiveStringRedisTemplate
) : EmailService {

    private val log = LoggerFactory.getLogger(this::class.java)
    
    @Value("\${spring.mail.username}")
    private lateinit var sender: String
    
    @Value("\${app.email.verification-code.expire-minutes:5}")
    private var expireMinutes: Long = 5
    
    @Value("\${app.email.verification-code.subject:验证码}")
    private lateinit var subject: String

    /**
     * Redis中存储验证码的key前缀
     */
    private val CODE_KEY_PREFIX = "email:verification:code:"
    
    /**
     * 发送验证码邮件
     */
    override fun sendVerificationCode(email: String, code: String, type: String): Mono<Void> {
        log.info("开始发送邮件验证码，邮箱：{}，类型：{}", email, type)
        
        // 使用Mono.fromCallable包装阻塞的邮件发送操作，并指定在单独的调度器上执行
        return Mono.fromCallable {
            try {
                val message = mailSender.createMimeMessage()
                // 指定UTF-8编码，解决中文乱码问题
                val helper = MimeMessageHelper(message, true, "UTF-8")
                
                // 设置发件人名称和邮箱
                helper.setFrom(InternetAddress(sender, "TaskArk 团队", "UTF-8"))
                helper.setTo(email)
                helper.setSubject(subject)
                
                // 根据不同的验证码类型构建不同的邮件内容
                val content = when(type) {
                    "register" -> {
                        // 使用三引号字符串，避免换行问题
                        """
                        <!DOCTYPE html>
                        <html lang="zh-CN">
                        <head>
                            <meta charset="UTF-8">
                            <meta name="viewport" content="width=device-width, initial-scale=1.0">
                            <title>账号注册验证</title>
                        </head>
                        <body style="margin: 0; padding: 0; background-color: #F5F5F7; -webkit-font-smoothing: antialiased;">
                            <div style="max-width: 500px; margin: 40px auto; background-color: #FFFFFF; border-radius: 18px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.06); font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif;">
                                <div style="padding: 40px 30px 0; text-align: center;">
                                    <h1 style="color: #1D1D1F; margin: 0; padding: 0; font-size: 22px; font-weight: 600; letter-spacing: -0.01em;">TaskArk</h1>
                                </div>
                                
                                <div style="padding: 30px 35px 40px;">
                                    <h2 style="color: #1D1D1F; margin: 0 0 15px 0; font-size: 20px; font-weight: 600; letter-spacing: -0.01em; text-align: center;">验证您的邮箱</h2>
                                    
                                    <p style="color: #86868B; font-size: 15px; line-height: 1.5; margin: 25px 0 30px; font-weight: 400; text-align: center;">您好，请使用以下验证码完成邮箱验证</p>
                                    
                                    <div style="background-color: #F5F5F7; border-radius: 12px; padding: 20px; margin: 30px 0; text-align: center;">
                                        <span style="font-size: 28px; letter-spacing: 4px; color: #1D1D1F; font-weight: 600; font-family: 'SF Mono', SFMono-Regular, Menlo, Monaco, Consolas, monospace;">$code</span>
                                    </div>
                                    
                                    <p style="color: #86868B; font-size: 14px; text-align: center; margin: 25px 0 0;">验证码有效期 <span style="color: #1D1D1F; font-weight: 500;">${expireMinutes}分钟</span></p>
                                </div>
                                
                                <div style="background-color: #F5F5F7; padding: 20px 35px; border-top: 1px solid #E5E5E5;">
                                    <p style="color: #86868B; font-size: 12px; line-height: 1.5; margin: 0; font-weight: 400;">
                                        注意：该验证码仅供注册账号使用，请勿将验证码告知他人。如非您本人操作，请忽略此邮件。
                                    </p>
                                </div>
                                
                                <div style="text-align: center; padding: 20px 30px; color: #86868B; font-size: 11px;">
                                    <p style="margin: 0;">© ${java.time.LocalDate.now().year} TaskArk. 保留所有权利。</p>
                                </div>
                            </div>
                        </body>
                        </html>
                        """
                    }
                    else -> "您的验证码为：<b>$code</b>，有效期${expireMinutes}分钟，请勿泄露给他人。"
                }
                
                helper.setText(content, true)
                
                // 发送邮件
                mailSender.send(message)
                log.info("邮件验证码发送成功，邮箱：{}", email)
                true
            } catch (e: MailAuthenticationException) {
                log.error("邮件认证失败，邮箱：{}", email, e)
                throw EmailSendException("邮件服务认证失败，请联系管理员检查邮箱配置", e)
            } catch (e: MailSendException) {
                log.error("邮件投递失败，邮箱：{}", email, e)
                throw EmailSendException("邮件发送失败，请检查收件地址或稍后重试", e)
            } catch (e: Exception) {
                log.error("邮件验证码发送失败，邮箱：{}", email, e)
                throw EmailSendException(cause = e)
            }
        }.subscribeOn(Schedulers.boundedElastic())
        .then()
    }

    /**
     * 验证验证码是否有效
     */
    override fun verifyCode(email: String, code: String, type: String): Mono<Boolean> {
        val key = getRedisKey(email, type)
        return redisTemplate.opsForValue().get(key)
            .map { savedCode -> 
                val isValid = savedCode == code
                if (isValid) {
                    // 验证成功后删除验证码，防止重复使用
                    redisTemplate.delete(key).subscribe()
                    log.info("验证码验证成功，邮箱：{}，类型：{}", email, type)
                } else {
                    log.info("验证码验证失败，邮箱：{}，类型：{}，提交的验证码：{}", email, type, code)
                }
                isValid
            }
            .defaultIfEmpty(false)
    }

    /**
     * 生成验证码
     */
    override fun generateCode(email: String, type: String): Mono<String> {
        // 生成6位随机数字验证码
        val code = ThreadLocalRandom.current().nextInt(100000, 1000000).toString()
        val key = getRedisKey(email, type)
        
        log.info("生成验证码，邮箱：{}，类型：{}", email, type)
        
        // 将验证码保存到Redis，设置过期时间
        return redisTemplate.opsForValue().set(key, code, Duration.ofMinutes(expireMinutes))
            .thenReturn(code)
    }
    
    /**
     * 获取Redis中存储验证码的key
     */
    private fun getRedisKey(email: String, type: String): String {
        return "$CODE_KEY_PREFIX$type:$email"
    }
}
