package com.task.domain.event.task

import com.task.domain.model.task.Task
import java.time.OffsetDateTime

/**
 * 任务事件基类
 * 所有任务相关事件的父类
 */
sealed class TaskEvent(
    /**
     * 任务ID
     */
    open val taskId: Long,
    
    /**
     * 事件发生时间
     */
    open val occurredAt: OffsetDateTime = OffsetDateTime.now()
)

/**
 * 任务修改事件
 * 当任务被修改时触发
 */
data class TaskModifiedEvent(
    override val taskId: Long,
    
    /**
     * 原始任务对象
     */
    val originalTask: Task,
    
    /**
     * 修改后的任务对象
     */
    val modifiedTask: Task,
    
    /**
     * 修改人ID
     */
    val userId: Long,
    
    /**
     * 任务类型，主任务或子任务
     */
    val taskType: TaskType,
    
    /**
     * 修改的字段列表
     */
    val modifiedFields: List<String>,
    
    override val occurredAt: OffsetDateTime = OffsetDateTime.now()
) : TaskEvent(taskId, occurredAt)

/**
 * 任务状态变更事件
 * 当任务状态发生变化时触发
 */
data class TaskStatusChangedEvent(
    override val taskId: Long,
    
    /**
     * 原始状态ID
     */
    val oldStatusId: Long,
    
    /**
     * 新状态ID
     */
    val newStatusId: Long,
    
    /**
     * 修改人ID
     */
    val userId: Long,
    
    /**
     * 任务类型，主任务或子任务
     */
    val taskType: TaskType,
    
    /**
     * 状态变更原因
     */
    val reason: String? = null,
    
    override val occurredAt: OffsetDateTime = OffsetDateTime.now()
) : TaskEvent(taskId, occurredAt)

/**
 * 任务类型枚举
 */
enum class TaskType {
    /**
     * 主任务
     */
    MAIN_TASK,
    
    /**
     * 子任务
     */
    SUB_TASK
}
