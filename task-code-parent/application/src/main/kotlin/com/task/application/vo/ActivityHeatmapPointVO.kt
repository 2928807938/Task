package com.task.application.vo

/**
 * 活跃度热力图数据点
 * 表示热力图中的一个数据点
 */
data class ActivityHeatmapPointVO(
    // 星期几（1-7，1表示周一）
    val dayOfWeek: Int,
    // 小时（0-23）
    val hour: Int,
    // 活跃度值（活动数量）
    val value: Int
)