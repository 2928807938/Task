package com.task.domain.model.task.requirementsummaryanalysis

/**
 * 任务安排任务值对象
 * 表示任务安排中的具体任务
 */
data class ArrangementTask(
    /**
     * 任务名称
     */
    val name: String,
    
    /**
     * 优先级
     */
    val priority: String,
    
    /**
     * 估计工作量
     */
    val estimatedWorkload: String,
    
    /**
     * 依赖关系列表
     */
    val dependencies: List<String>,
    
    /**
     * 分配建议
     */
    val assignmentSuggestion: String
) 