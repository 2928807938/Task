package com.task.domain.model.task.requirementsummaryanalysis

/**
 * 阶段值对象
 * 表示任务安排中的阶段
 */
data class Phase(
    /**
     * 阶段名称
     */
    val name: String,
    
    /**
     * 阶段描述
     */
    val description: String,
    
    /**
     * 估计工作量
     */
    val estimatedWorkload: String,
    
    /**
     * 建议时间范围
     */
    val suggestedTimeframe: String,
    
    /**
     * 任务列表
     */
    val tasks: List<ArrangementTask>
) 