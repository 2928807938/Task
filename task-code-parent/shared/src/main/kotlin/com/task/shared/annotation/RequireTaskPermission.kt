package com.task.shared.annotation

/**
 * 任务权限校验注解
 * 用于方法级别的任务权限控制，支持非入侵式权限校验
 * 
 * 使用方式：
 * ```kotlin
 * @RequireTaskPermission(
 *     permission = ProjectPermissions.TASK_VIEW,
 *     taskIdParam = "taskId"
 * )
 * fun getTaskDetail(taskId: Long): Mono<TaskDetailVO>
 * ```
 */
@Target(AnnotationTarget.FUNCTION)
@Retention(AnnotationRetention.RUNTIME)
annotation class RequireTaskPermission(
    /**
     * 需要的权限代码
     * 对应 ProjectPermissions 中定义的权限常量
     */
    val permission: String,
    
    /**
     * 任务ID参数名称
     * 指定方法参数中任务ID的参数名，默认为 "taskId"
     */
    val taskIdParam: String = "taskId",
    
    /**
     * 错误消息
     * 权限校验失败时的提示信息
     */
    val message: String = "用户无权限访问此任务"
)