package com.task.web.config

import com.task.web.client.controller.*
import com.task.web.context.RequestContextFilter
import com.task.web.exception.GlobalExceptionHandler
import com.task.web.security.filter.JwtAuthenticationFilter
import org.springframework.context.annotation.Configuration
import org.springframework.context.annotation.Import

/**
 * Web自动配置类
 * 导入所有Web层的配置类和控制器
 */
@Configuration
@Import(
    // 配置类
    WebFluxConfig::class,
    WebSecurityConfig::class,
    JacksonConfig::class,
    
    // 过滤器
    TraceIdFilter::class,
    RequestContextFilter::class,
    JwtAuthenticationFilter::class,
    
    // 控制器
    AgreementTermController::class,
    HealthCheckController::class,
    HomePageController::class,
    InviteController::class,
    ProjectController::class,
    RequirementConversationController::class,
    RequirementConversationListController::class,
    TaskController::class,
    TeamController::class,
    UserController::class,
    ReactorConfig::class,

    // 异常处理
    GlobalExceptionHandler::class
)
class WebAutoConfiguration
