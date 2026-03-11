package com.task.domain.service.strategy

import com.task.domain.model.task.Task
import reactor.core.publisher.Mono
import java.time.OffsetDateTime

/**
 * 任务修改策略接口
 * 定义不同类型任务修改的通用方法
 */
interface TaskEditStrategy {
    /**
     * 验证任务修改参数
     * @param task 原始任务
     * @param title 新标题
     * @param description 新描述
     * @param statusId 新状态ID
     * @param priorityId 新优先级ID
     * @param assigneeId 新负责人ID
     * @param dueDate 新截止日期
     * @return 验证结果，成功则返回Empty，失败则返回带有错误信息的Mono
     */
    fun validateTaskEdit(
        task: Task,
        title: String?,
        description: String?,
        statusId: Long?,
        priorityId: Long?,
        assigneeId: Long?,
        startTime: OffsetDateTime?,
        dueDate: OffsetDateTime?
    ): Mono<Void>
    
    /**
     * 执行任务修改
     * @param task 原始任务
     * @param title 新标题
     * @param description 新描述
     * @param statusId 新状态ID
     * @param priorityId 新优先级ID
     * @param assigneeId 新负责人ID
     * @param dueDate 新截止日期
     * @param userId 当前操作用户ID
     * @return 更新后的任务
     */
    fun executeTaskEdit(
        task: Task,
        title: String?,
        description: String?,
        statusId: Long?,
        priorityId: Long?,
        assigneeId: Long?,
        startTime: OffsetDateTime?,
        dueDate: OffsetDateTime?,
        userId: Long
    ): Mono<Task>
    
    /**
     * 处理任务修改后的操作
     * @param originalTask 原始任务
     * @param updatedTask 更新后的任务
     * @param userId 当前操作用户ID
     * @return 最终处理后的任务
     */
    fun postTaskEdit(
        originalTask: Task,
        updatedTask: Task,
        userId: Long
    ): Mono<Task>
    
    /**
     * 判断当前策略是否适用于指定任务
     * @param task 任务
     * @return 是否适用
     */
    fun isApplicable(task: Task): Boolean
}
