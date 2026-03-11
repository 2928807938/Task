package com.task.application.request

import jakarta.validation.constraints.NotBlank
import jakarta.validation.constraints.NotNull

/**
 * 任务分配请求
 * 用于接收任务分配的描述信息
 */
data class TaskAssignmentRequest(

    /**
     * 项目ID
     */
    @NotNull(message = "项目id不能为空")
    val projectId: Long,

    /**
     * 任务分配描述
     * 包含任务分配的相关信息，可以是自然语言描述
     */
    @field:NotBlank(message = "任务分配描述不能为空")
    val description: String
)
