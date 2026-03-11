package com.task.application.vo

/**
 * 任务状态趋势视图对象
 * 用于展示项目任务在不同状态下随时间的分布趋势
 */
data class TaskStatusTrendVO(
    /**
     * 时间标签列表（例如：月份标签 "12月", "1月", "2月"等）
     */
    val timeLabels: List<String>,
    
    /**
     * 状态列表：包含所有项目状态的ID、名称和颜色
     */
    val statusList: List<StatusInfoVO>,
    
    /**
     * 状态趋势数据：key为状态ID，value为该状态在各个时间点的任务数量
     */
    val statusTrends: Map<Long, List<Int>>
)

/**
 * 状态信息视图对象
 */
data class StatusInfoVO(
    /**
     * 状态ID
     */
    val id: Long,
    
    /**
     * 状态名称
     */
    val name: String,
    
    /**
     * 状态颜色
     */
    val color: String
)
