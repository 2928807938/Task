package com.task.domain.model.task.requirementpriority

/**
 * 因素信息值对象
 * 包含难度、资源匹配和依赖关系
 */
data class Factors(
    /**
     * 实施难度分析
     */
    val difficulty: String,
    
    /**
     * 资源匹配情况
     */
    val resourceMatch: String,
    
    /**
     * 依赖关系分析
     */
    val dependencies: String
) 