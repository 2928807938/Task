package com.task.domain.model.task.requirementsummaryanalysis

/**
 * 资源推荐值对象
 * 表示推荐的资源配置
 */
data class ResourceRecommendation(
    /**
     * 人员配置建议
     */
    val personnel: List<String>,
    
    /**
     * 技能要求
     */
    val skills: List<String>,
    
    /**
     * 工具建议
     */
    val tools: List<String>
) 