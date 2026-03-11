package com.task.domain.model.task.requirementcompleteness

/**
 * 完整度方面值对象
 * 表示需求完整度检查的各个方面及其完整度评估
 */
data class Aspect(
    /**
     * 方面名称
     */
    val name: String,
    
    /**
     * 完整度评估
     * 可以是百分比或描述性评估
     */
    val completeness: String
) 