package com.task.domain.config

import org.springframework.context.annotation.Configuration
import org.springframework.context.annotation.EnableAspectJAutoProxy

/**
 * AOP 配置类
 * 启用AspectJ自动代理，支持基于注解的权限控制
 */
@Configuration
@EnableAspectJAutoProxy(proxyTargetClass = true)
class AspectConfig