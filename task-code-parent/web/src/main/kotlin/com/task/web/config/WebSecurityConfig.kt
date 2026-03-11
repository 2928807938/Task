package com.task.web.config

import com.task.infrastructure.security.jwt.JwtTokenProvider
import com.task.web.context.RequestContextFilter
import com.task.web.security.filter.JwtAuthenticationFilter
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.context.annotation.Import
import org.springframework.security.config.annotation.web.reactive.EnableWebFluxSecurity
import org.springframework.security.config.web.server.SecurityWebFiltersOrder
import org.springframework.security.config.web.server.ServerHttpSecurity
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder
import org.springframework.security.crypto.password.PasswordEncoder
import org.springframework.security.web.server.SecurityWebFilterChain
import org.springframework.web.cors.CorsConfiguration
import org.springframework.web.cors.reactive.CorsConfigurationSource
import org.springframework.web.cors.reactive.UrlBasedCorsConfigurationSource

@Configuration
@EnableWebFluxSecurity
@Import(JwtTokenProvider::class)
class WebSecurityConfig(
    private val jwtAuthenticationFilter: JwtAuthenticationFilter,
    private val requestContextFilter: RequestContextFilter
) {

    @Bean
    fun securityWebFilterChain(http: ServerHttpSecurity): SecurityWebFilterChain {
        return http
            // 启用CORS并使用自定义配置
            .cors { it.configurationSource(corsConfigurationSource()) }
            // 禁用CSRF保护（API场景通常不需要）
            .csrf { it.disable() }
            // 配置路径访问权限
            .authorizeExchange { exchanges ->
                exchanges
                    .pathMatchers("/api/client/user/register",
                        "/api/client/user/login",
                        "/api/client/user/send-email-verification-code",
                        "/api/client/user/change-password",
                        "/actuator/health"  // 自定义健康检查路径
                        )
                    .permitAll()
                    .anyExchange().authenticated()
            }
            // 先添加请求上下文过滤器
            .addFilterBefore(requestContextFilter, SecurityWebFiltersOrder.AUTHENTICATION)
            // 配置JWT认证
            .addFilterAt(jwtAuthenticationFilter, SecurityWebFiltersOrder.HTTP_BASIC)
            // 禁用默认的登录表单（API通常使用其他认证方式）
            .formLogin { it.disable() }
            // 禁用HTTP Basic认证（除非您需要）
            .httpBasic { it.disable() }
            .build()
    }

    @Bean
    fun corsConfigurationSource(): CorsConfigurationSource {
        val configuration = CorsConfiguration()
        configuration.allowedOriginPatterns = listOf("*")
        configuration.allowedMethods = listOf("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH")
        configuration.allowedHeaders = listOf("*")
        configuration.allowCredentials = true
        configuration.maxAge = 3600L
        
        val source = UrlBasedCorsConfigurationSource()
        source.registerCorsConfiguration("/**", configuration)
        return source
    }

    @Bean
    fun passwordEncoder(): PasswordEncoder {
        return BCryptPasswordEncoder()
    }
}