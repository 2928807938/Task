package com.task.domain.model.task.requirementsummaryanalysis

/**
 * 任务安排值对象
 * 包含任务的阶段划分、资源推荐和风险管理
 */
data class TaskArrangement(
    /**
     * 阶段列表
     */
    val phases: List<Phase>,
    
    /**
     * 资源推荐
     */
    val resourceRecommendations: ResourceRecommendation,
    
    /**
     * 风险管理
     */
    val riskManagement: RiskManagement
) 