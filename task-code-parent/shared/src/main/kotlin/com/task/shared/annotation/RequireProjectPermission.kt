package com.task.shared.annotation

/**
 * 项目权限校验注解
 * 用于方法级别的声明式权限控制，支持非入侵式权限校验
 * 
 * 使用方式：
 * ```kotlin
 * @RequireProjectPermission(
 *     permission = ProjectPermissions.PROJECT_VIEW,
 *     projectIdParam = "projectId"
 * )
 * fun getProjectInfo(projectId: Long): Mono<Project>
 * ```
 */
@Target(AnnotationTarget.FUNCTION)
@Retention(AnnotationRetention.RUNTIME)
annotation class RequireProjectPermission(
    /**
     * 需要的权限代码
     * 对应 ProjectPermissions 中定义的权限常量
     */
    val permission: String,
    
    /**
     * 项目ID参数名称
     * 指定方法参数中项目ID的参数名，默认为 "projectId"
     */
    val projectIdParam: String = "projectId",
    
    /**
     * 错误消息
     * 权限校验失败时的提示信息
     */
    val message: String = "用户无权限执行此操作"
)