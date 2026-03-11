package com.task.application.request

import jakarta.validation.constraints.FutureOrPresent
import jakarta.validation.constraints.NotBlank
import jakarta.validation.constraints.NotNull
import java.time.OffsetDateTime

/**
 * 编辑任务请求
 */
data class EditTaskRequest(
    /**
     * 任务ID
     */
    @field:NotNull(message = "任务ID不能为空")
    val taskId: Long,

    /**
     * 任务标题
     */
    @field:NotBlank(message = "任务标题不能为空")
    val title: String,

    /**
     * 任务描述
     */
    val description: String? = null,

    /**
     * 任务状态ID
     */
    @field:NotNull(message = "任务状态ID不能为空")
    val statusId: Long,

    /**
     * 任务优先级ID
     */
    @field:NotNull(message = "任务优先级ID不能为空")
    val priorityId: Long,

    /**
     * 任务负责人ID
     */
    @field:NotNull(message = "任务负责人ID不能为空")
    val assigneeId: Long,

    /**
     * 任务截止日期
     */
    @field:FutureOrPresent(message = "截止日期不能是过去的时间")
    val dueDate: OffsetDateTime
)
