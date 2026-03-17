package com.task.infrastructure.config

import org.springframework.beans.factory.annotation.Value
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.mail.javamail.JavaMailSender
import org.springframework.mail.javamail.JavaMailSenderImpl
import java.util.Properties

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

    @Value("\${spring.mail.protocol:smtp}")
    private lateinit var protocol: String

    @Value("\${spring.mail.properties.mail.smtp.auth:true}")
    private var auth: Boolean = true

    @Value("\${spring.mail.properties.mail.smtp.starttls.enable:false}")
    private var starttlsEnable: Boolean = false

    @Value("\${spring.mail.properties.mail.smtp.starttls.required:false}")
    private var starttlsRequired: Boolean = false

    @Value("\${spring.mail.properties.mail.smtp.ssl.enable:false}")
    private var sslEnable: Boolean = false

    @Value("\${spring.mail.properties.mail.smtp.ssl.trust:}")
    private lateinit var sslTrust: String

    @Value("\${spring.mail.properties.mail.smtp.connectiontimeout:5000}")
    private var connectionTimeout: String = "5000"

    @Value("\${spring.mail.properties.mail.smtp.timeout:5000}")
    private var timeout: String = "5000"

    @Value("\${spring.mail.properties.mail.smtp.writetimeout:5000}")
    private var writeTimeout: String = "5000"

    @Value("\${spring.mail.properties.mail.debug:false}")
    private var debug: Boolean = false

    @Bean
    fun javaMailSender(): JavaMailSender {
        val mailSender = JavaMailSenderImpl()
        mailSender.host = host
        mailSender.port = port
        mailSender.username = username
        mailSender.password = password
        mailSender.protocol = protocol

        mailSender.javaMailProperties = Properties().apply {
            put("mail.transport.protocol", protocol)
            put("mail.smtp.auth", auth.toString())
            put("mail.smtp.starttls.enable", starttlsEnable.toString())
            put("mail.smtp.starttls.required", starttlsRequired.toString())
            put("mail.smtp.ssl.enable", sslEnable.toString())
            if (sslTrust.isNotBlank()) {
                put("mail.smtp.ssl.trust", sslTrust)
            }
            put("mail.smtp.connectiontimeout", connectionTimeout)
            put("mail.smtp.timeout", timeout)
            put("mail.smtp.writetimeout", writeTimeout)
            put("mail.debug", debug.toString())
        }

        return mailSender
    }
}
