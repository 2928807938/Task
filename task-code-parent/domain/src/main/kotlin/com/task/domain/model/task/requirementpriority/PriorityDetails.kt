package com.task.domain.model.task.requirementpriority

/**
 * 优先级详情值对象
 * 包含优先级的级别、分数和分析
 */
data class PriorityDetails(
    /**
     * 优先级级别
     */
    val level: String,
    
    /**
     * 优先级分数
     */
    val score: Int,
    
    /**
     * 优先级分析
     */
    val analysis: String
) 