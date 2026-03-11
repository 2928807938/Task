package com.task.domain.model.task.requirementsummaryanalysis

/**
 * 风险管理值对象
 * 表示风险识别和管理建议
 */
data class RiskManagement(
    /**
     * 风险描述
     */
    val risk: List<String>,
    
    /**
     * 影响评估
     */
    val impact: List<String>,
    
    /**
     * 缓解措施
     */
    val mitigation: List<String>
) 