package com.task.domain.aspect

import com.task.domain.service.AccessControlService
import com.task.domain.service.TaskService
import com.task.shared.annotation.RequireProjectPermission
import com.task.shared.annotation.RequireTaskPermission
import com.task.shared.context.RequestContextHolder
import com.task.shared.exceptions.PermissionDeniedException
import org.aspectj.lang.ProceedingJoinPoint
import org.aspectj.lang.annotation.Around
import org.aspectj.lang.annotation.Aspect
import org.aspectj.lang.reflect.MethodSignature
import org.slf4j.LoggerFactory
import org.springframework.core.annotation.Order
import org.springframework.stereotype.Component
import reactor.core.publisher.Flux
import reactor.core.publisher.Mono

/**
 * 权限校验切面
 * 处理基于注解的声明式权限控制
 */
@Aspect
@Component
@Order(1) // 确保权限检查在其他切面之前执行
class PermissionAspect(
    private val accessControlService: AccessControlService,
    private val taskService: TaskService
) {
    
    private val log = LoggerFactory.getLogger(this::class.java)

    /**
     * 拦截项目权限注解
     */
    @Around("@annotation(requireProjectPermission)")
    fun checkProjectPermission(joinPoint: ProceedingJoinPoint, requireProjectPermission: RequireProjectPermission): Any? {
        log.debug("开始项目权限校验: {}", requireProjectPermission.permission)
        
        // 提取项目ID
        val projectId = extractParameterValue(joinPoint, requireProjectPermission.projectIdParam) as? Long
            ?: throw IllegalArgumentException("无法从方法参数中提取项目ID: ${requireProjectPermission.projectIdParam}")
        
        // 执行原方法
        return when (val result = joinPoint.proceed()) {
            is Mono<*> -> {
                // 在响应式流中进行权限检查
                Mono.deferContextual { ctx ->
                    val userIdStr = ctx.getOrEmpty<String>("userId").orElse(null)
                    val currentUserId = userIdStr?.toLongOrNull()
                        ?: throw IllegalStateException("无法获取当前用户ID，请确保用户已登录")
                    
                    log.debug("从响应式上下文获取到用户ID: {}", currentUserId)
                    
                    accessControlService.hasProjectPermission(currentUserId, projectId, requireProjectPermission.permission)
                        .flatMap { hasPermission ->
                            if (hasPermission) {
                                result
                            } else {
                                Mono.error(PermissionDeniedException(
                                    requireProjectPermission.message,
                                    requireProjectPermission.permission
                                ))
                            }
                        }
                }
            }
            is Flux<*> -> {
                // 在响应式流中进行权限检查
                Mono.deferContextual { ctx ->
                    val userIdStr = ctx.getOrEmpty<String>("userId").orElse(null)
                    val currentUserId = userIdStr?.toLongOrNull()
                        ?: throw IllegalStateException("无法获取当前用户ID，请确保用户已登录")
                    
                    log.debug("从响应式上下文获取到用户ID: {}", currentUserId)
                    
                    accessControlService.hasProjectPermission(currentUserId, projectId, requireProjectPermission.permission)
                        .flatMap { hasPermission ->
                            if (hasPermission) {
                                Mono.just(hasPermission)
                            } else {
                                Mono.error(PermissionDeniedException(
                                    requireProjectPermission.message,
                                    requireProjectPermission.permission
                                ))
                            }
                        }
                }.thenMany(result)
            }
            else -> {
                // 对于非响应式返回类型，需要转换为响应式处理
                Mono.deferContextual { ctx ->
                    val userIdStr = ctx.getOrEmpty<String>("userId").orElse(null)
                    val currentUserId = userIdStr?.toLongOrNull()
                        ?: throw IllegalStateException("无法获取当前用户ID，请确保用户已登录")
                    
                    log.debug("从响应式上下文获取到用户ID: {}", currentUserId)
                    
                    accessControlService.hasProjectPermission(currentUserId, projectId, requireProjectPermission.permission)
                        .flatMap { hasPermission ->
                            if (hasPermission) {
                                Mono.just(result)
                            } else {
                                Mono.error(PermissionDeniedException(
                                    requireProjectPermission.message,
                                    requireProjectPermission.permission
                                ))
                            }
                        }
                }.block()
            }
        }
    }

    /**
     * 拦截任务权限注解
     */
    @Around("@annotation(requireTaskPermission)")
    fun checkTaskPermission(joinPoint: ProceedingJoinPoint, requireTaskPermission: RequireTaskPermission): Any? {
        log.debug("开始任务权限校验: {}", requireTaskPermission.permission)
        
        // 提取任务ID
        val taskId = extractParameterValue(joinPoint, requireTaskPermission.taskIdParam) as? Long
            ?: throw IllegalArgumentException("无法从方法参数中提取任务ID: ${requireTaskPermission.taskIdParam}")
        
        // 执行原方法
        return when (val result = joinPoint.proceed()) {
            is Mono<*> -> {
                // 在响应式流中进行权限检查
                Mono.deferContextual { ctx ->
                    val userIdStr = ctx.getOrEmpty<String>("userId").orElse(null)
                    val currentUserId = userIdStr?.toLongOrNull()
                        ?: throw IllegalStateException("无法获取当前用户ID，请确保用户已登录")
                    
                    log.debug("从响应式上下文获取到用户ID: {}", currentUserId)
                    
                    // 通过任务ID获取项目ID，然后执行权限校验
                    taskService.findTaskById(taskId)
                        .flatMap { task ->
                            accessControlService.hasProjectPermission(currentUserId, task.projectId, requireTaskPermission.permission)
                                .flatMap { hasPermission ->
                                    if (hasPermission) {
                                        result
                                    } else {
                                        // 检查是否是任务创建者或分配者（具有特殊访问权限）
                                        if (task.creatorId == currentUserId || task.assigneeId == currentUserId) {
                                            result
                                        } else {
                                            Mono.error(PermissionDeniedException(
                                                requireTaskPermission.message,
                                                requireTaskPermission.permission
                                            ))
                                        }
                                    }
                                }
                        }
                }
            }
            is Flux<*> -> {
                // 在响应式流中进行权限检查
                Mono.deferContextual { ctx ->
                    val userIdStr = ctx.getOrEmpty<String>("userId").orElse(null)
                    val currentUserId = userIdStr?.toLongOrNull()
                        ?: throw IllegalStateException("无法获取当前用户ID，请确保用户已登录")
                    
                    log.debug("从响应式上下文获取到用户ID: {}", currentUserId)
                    
                    // 通过任务ID获取项目ID，然后执行权限校验
                    taskService.findTaskById(taskId)
                        .flatMap { task ->
                            accessControlService.hasProjectPermission(currentUserId, task.projectId, requireTaskPermission.permission)
                                .flatMap { hasPermission ->
                                    if (hasPermission) {
                                        Mono.just(hasPermission)
                                    } else {
                                        // 检查是否是任务创建者或分配者（具有特殊访问权限）
                                        if (task.creatorId == currentUserId || task.assigneeId == currentUserId) {
                                            Mono.just(true)
                                        } else {
                                            Mono.error(PermissionDeniedException(
                                                requireTaskPermission.message,
                                                requireTaskPermission.permission
                                            ))
                                        }
                                    }
                                }
                        }
                }.thenMany(result)
            }
            else -> {
                // 对于非响应式返回类型，需要转换为响应式处理
                Mono.deferContextual { ctx ->
                    val userIdStr = ctx.getOrEmpty<String>("userId").orElse(null)
                    val currentUserId = userIdStr?.toLongOrNull()
                        ?: throw IllegalStateException("无法获取当前用户ID，请确保用户已登录")
                    
                    log.debug("从响应式上下文获取到用户ID: {}", currentUserId)
                    
                    // 通过任务ID获取项目ID，然后执行权限校验
                    taskService.findTaskById(taskId)
                        .flatMap { task ->
                            accessControlService.hasProjectPermission(currentUserId, task.projectId, requireTaskPermission.permission)
                                .flatMap { hasPermission ->
                                    if (hasPermission) {
                                        Mono.just(result)
                                    } else {
                                        // 检查是否是任务创建者或分配者（具有特殊访问权限）
                                        if (task.creatorId == currentUserId || task.assigneeId == currentUserId) {
                                            Mono.just(result)
                                        } else {
                                            Mono.error(PermissionDeniedException(
                                                requireTaskPermission.message,
                                                requireTaskPermission.permission
                                            ))
                                        }
                                    }
                                }
                        }
                }.block()
            }
        }
    }

    /**
     * 从方法参数中提取指定参数的值
     * 支持简单参数名（如 "projectId"）和复合参数名（如 "request.projectId"）
     */
    private fun extractParameterValue(joinPoint: ProceedingJoinPoint, paramName: String): Any? {
        val method = (joinPoint.signature as MethodSignature).method
        val parameterNames = method.parameters.map { it.name }
        
        // 检查是否是复合参数名（如 "request.projectId"）
        if (paramName.contains('.')) {
            val parts = paramName.split('.')
            val objectParamName = parts[0] // "request"
            val fieldName = parts[1] // "projectId"
            
            val paramIndex = parameterNames.indexOf(objectParamName)
            if (paramIndex != -1) {
                val paramObject = joinPoint.args[paramIndex]
                if (paramObject != null) {
                    // 通过反射获取对象的字段值
                    return try {
                        val field = paramObject.javaClass.getDeclaredField(fieldName)
                        field.isAccessible = true
                        field.get(paramObject)
                    } catch (e: Exception) {
                        log.warn("无法从对象 {} 中获取字段 {}: {}", objectParamName, fieldName, e.message)
                        null
                    }
                }
            }
            throw IllegalArgumentException("无法从方法参数中提取复合参数: $paramName")
        }
        
        // 处理简单参数名
        val paramIndex = parameterNames.indexOf(paramName)
        
        if (paramIndex == -1) {
            // 如果找不到参数名，尝试按类型查找 Long 类型的第一个参数
            val longParamIndex = method.parameterTypes.indexOfFirst { it == Long::class.javaPrimitiveType || it == Long::class.java }
            if (longParamIndex != -1) {
                return joinPoint.args[longParamIndex]
            }
            throw IllegalArgumentException("无法在方法参数中找到参数: $paramName")
        }
        
        return joinPoint.args[paramIndex]
    }

}