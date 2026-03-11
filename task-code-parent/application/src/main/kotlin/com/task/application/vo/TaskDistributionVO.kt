package com.task.application.vo

/**
 * 任务分布视图对象
 * 用于展示项目任务的优先级和状态分布情况
 */
data class TaskDistributionVO(

    /**
     * 任务完成度
     */
    val taskCompletion: TaskCompletionVO,

    /**
     * 优先级分布
     */
    val priorityDistribution: PriorityDistributionVO,
    
    /**
     * 状态分布
     */
    val statusDistribution: StatusDistributionVO
)

/**
 * 优先级分布视图对象
 */
data class PriorityDistributionVO(
    /**
     * 优先级列表
     * 包含项目中所有优先级的详细信息和对应的任务数量
     */
    val items: List<PriorityItemVO> = emptyList(),

    /**
     * 总任务数量
     */
    val totalCount: Int = 0
)

/**
 * 优先级项目视图对象
 */
data class PriorityItemVO(
    /**
     * 优先级ID
     */
    val id: Long,
    
    /**
     * 优先级名称
     */
    val name: String,
    
    /**
     * 优先级颜色
     */
    val color: String,
    
    /**
     * 优先级等级
     */
    val level: Int,
    
    /**
     * 优先级分数(0-100)
     */
    val score: Int,
    
    /**
     * 任务数量
     */
    val count: Int,
    
    /**
     * 任务占比(百分比)
     */
    val percent: Int
)

/**
 * 状态分布视图对象
 */
data class StatusDistributionVO(
    /**
     * 状态列表
     * 包含项目中所有状态的详细信息和对应的任务数量
     */
    val items: List<StatusItemVO> = emptyList(),

    /**
     * 总任务数量
     */
    val totalCount: Int = 0
)

/**
 * 状态项目视图对象
 */
data class StatusItemVO(
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
    val color: String,
    
    /**
     * 是否为终止状态
     */
    val isTerminal: Boolean,
    
    /**
     * 任务数量
     */
    val count: Int,
    
    /**
     * 任务占比(百分比)
     */
    val percent: Int
)

/**
 * 任务完成度视图对象
 */
data class TaskCompletionVO(
    /**
     * 完成度百分比
     */
    val completionPercent: Int,
    
    /**
     * 已完成任务数
     */
    val completed: Int,
    
    /**
     * 总任务数
     */
    val total: Int
)
