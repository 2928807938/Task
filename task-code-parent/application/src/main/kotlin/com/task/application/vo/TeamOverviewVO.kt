package com.task.application.vo

/**
 * 团队概览数据传输对象
 * 包含团队基本统计信息
 */
data class TeamOverviewVO(

    /**
     * 团队总人数
     */
    val totalMembers: Int,

    /**
     * 团队人数增长率（百分比）
     */
    val memberGrowthRate: Double,

    /**
     * 本月活跃度（百分比）
     */
    val monthlyActivityRate: Double,

    /**
     * 活跃度增长率（百分比）
     */
    val activityGrowthRate: Double,

    /**
     * 任务完成率（百分比）
     */
    val taskCompletionRate: Double,

    /**
     * 任务完成率变化（百分比）
     */
    val taskCompletionRateChange: Double
)