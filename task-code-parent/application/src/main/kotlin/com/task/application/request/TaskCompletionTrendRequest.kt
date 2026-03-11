package com.task.application.request

import jakarta.validation.constraints.Pattern

/**
 * 任务完成趋势请求参数
 */
data class TaskCompletionTrendRequest(
    /**
     * 时间范围：day-日, week-周, month-月
     */
    @field:Pattern(regexp = "^(day|week|month)$", message = "时间范围必须是 day, week 或 month")
    val timeRange: String = "week"
)
