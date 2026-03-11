package com.task.domain.model.task.requirementcompleteness

/**
 * 优化建议值对象
 * 表示对需求完整度的优化建议
 */
data class OptimizationSuggestion(
    /**
     * 图标
     * 可用于UI展示的图标标识
     */
    val icon: String,
    
    /**
     * 建议内容
     */
    val content: String
) 