package com.task.application.request

import jakarta.validation.constraints.NotNull

/**
 * 任务趋势请求对象
 */
data class TaskTrendRequest(
    /**
     * 项目ID
     */
    @field:NotNull(message = "项目ID不能为空")
    val projectId: Long,
    
    /**
     * 时间范围
     * 可选值：LAST_3_MONTHS(近3个月)、LAST_6_MONTHS(近6个月)、THIS_YEAR(今年)、LAST_YEAR(去年)
     * 默认：LAST_6_MONTHS
     */
    val timeRange: TimeRangeEnum = TimeRangeEnum.LAST_6_MONTHS
)

/**
 * 时间范围枚举
 */
enum class TimeRangeEnum(val description: String) {
    LAST_3_MONTHS("近3个月"),
    LAST_6_MONTHS("近6个月"),
    THIS_YEAR("今年"),
    LAST_YEAR("去年")
}
