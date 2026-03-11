package com.task.application.request

import jakarta.validation.constraints.NotNull

/**
 * 更新任务状态请求
 * 用于修改任务的状态
 */
data class UpdateTaskStatusRequest(
    /**
     * 目标状态ID
     * 任务将被更新到的新状态ID
     */
    @field:NotNull(message = "状态ID不能为空")
    val statusId: Long
)
