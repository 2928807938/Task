package com.task.domain.model.task

/**
 * 任务统计数据
 */
data class TaskStatisticsData(
    /**
     * 当前任务状态分布
     */
    val currentTaskStats: TaskStatusStats,

    /**
     * 任务优先级分布
     */
    val taskPriorityStats: TaskPriorityStats,

    /**
     * 任务完成趋势（最近30天）
     */
    val taskCompletionTrend: List<DailyTaskStats>,

    /**
     * 任务效率指标
     */
    val taskEfficiencyMetrics: TaskEfficiencyMetrics
)

/**
 * 任务状态统计
 */
data class TaskStatusStats(
    /**
     * 总任务数
     */
    val total: Int,

    /**
     * 已完成任务数
     */
    val completed: Int,

    /**
     * 进行中任务数
     */
    val inProgress: Int,

    /**
     * 待处理任务数
     */
    val pending: Int,
    
    /**
     * 按状态ID分组的任务数量映射
     * 键为状态ID，值为该状态下的任务数量
     */
    val statusCounts: Map<Long, Int> = emptyMap()
)

/**
 * 任务优先级统计
 */
data class TaskPriorityStats(
    /**
     * 紧急任务数
     */
    val urgent: Int,

    /**
     * 重要任务数
     */
    val important: Int,

    /**
     * 普通任务数
     */
    val normal: Int,
    
    /**
     * 各优先级ID对应的任务数量
     */
    val priorityCounts: Map<Long, Int> = emptyMap(),
    
    /**
     * 项目中所有优先级的详细信息
     */
    val priorities: List<Priority> = emptyList()
)

/**
 * 每日任务统计
 */
data class DailyTaskStats(
    /**
     * 日期（格式：yyyy-MM-dd）
     */
    val date: String,

    /**
     * 当天完成的任务数
     */
    val completedTasks: Int,

    /**
     * 当天创建的任务数
     */
    val createdTasks: Int
)

/**
 * 任务效率指标
 */
data class TaskEfficiencyMetrics(
    /**
     * 任务平均完成时间（小时）
     */
    val averageCompletionTime: Double,

    /**
     * 项目完成度（百分比）
     */
    val projectCompletionRate: Double,

    /**
     * 任务完成速率（每天完成的任务数）
     */
    val taskCompletionRate: Double
)