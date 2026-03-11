package com.task.infrastructure.config

import org.springframework.beans.factory.annotation.Value
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.mail.javamail.JavaMailSender
import org.springframework.mail.javamail.JavaMailSenderImpl

/**
 * 邮件服务配置类
 * 显式配置JavaMailSender确保它能被正确注入
 */
@Configuration
class MailConfig {

    @Value("\${spring.mail.host}")
    private lateinit var host: String

    @Value("\${spring.mail.port}")
    private var port: Int = 0

    @Value("\${spring.mail.username}")
    private lateinit var username: String

    @Value("\${spring.mail.password}")
    private lateinit var password: String

    @Bean
    fun javaMailSender(): JavaMailSender {
        val mailSender = JavaMailSenderImpl()
        mailSender.host = host
        mailSender.port = port
        mailSender.username = username
        mailSender.password = password

        val props = mailSender.javaMailProperties
        props.put("mail.transport.protocol", "smtp")
        props.put("mail.smtp.auth", "true")
        props.put("mail.smtp.starttls.enable", "true")
        props.put("mail.smtp.ssl.trust", host)
        
        // QQ邮箱需要SSL连接
        props.put("mail.smtp.ssl.enable", "true")
        
        // 超时设置
        props.put("mail.smtp.connectiontimeout", "5000")
        props.put("mail.smtp.timeout", "5000")
        props.put("mail.smtp.writetimeout", "5000")
        
        // 调试模式
        props.put("mail.debug", "true")

        return mailSender
    }
}
