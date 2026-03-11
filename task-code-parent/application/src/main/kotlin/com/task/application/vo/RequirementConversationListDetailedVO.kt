package com.task.application.vo

import com.task.domain.model.task.requirementcategory.RequirementCategory
import com.task.domain.model.task.requirementcompleteness.RequirementCompleteness
import com.task.domain.model.task.requirementconversationlist.RequirementConversation
import com.task.domain.model.task.requirementpriority.RequirementPriority
import com.task.domain.model.task.requirementsuggestion.RequirementSuggestion
import com.task.domain.model.task.requirementsummaryanalysis.RequirementSummaryAnalysis
import com.task.domain.model.task.requirementtaskbreakdown.RequirementTaskBreakdown
import com.task.domain.model.task.requirementworkload.RequirementWorkload
import java.time.OffsetDateTime

/**
 * 需求对话列表详细视图对象
 * 包含对话列表及所有关联表的详细数据
 */
data class RequirementConversationListDetailedVO(
    /**
     * 基本信息
     */
    val id: Long,
    val title: String,
    val startStatus: String?,
    val analysisStartStatus: String?,
    val analysisCompleteStatus: String?,
    val createdAt: OffsetDateTime,
    val updatedAt: OffsetDateTime?,
    
    /**
     * 需求分类相关信息
     */
    val requirementCategoryId: Long?,
    val categoryData: RequirementCategoryVO?,
    
    /**
     * 需求优先级相关信息
     */
    val requirementPriorityId: Long?,
    val priorityData: RequirementPriorityVO?,
    
    /**
     * 需求工作量相关信息
     */
    val requirementWorkloadId: Long?,
    val workloadData: RequirementWorkloadVO?,
    
    /**
     * 需求任务拆分相关信息
     */
    val requirementTaskBreakdownId: Long?,
    val taskBreakdownData: RequirementTaskBreakdownVO?,
    
    /**
     * 需求完整度检查相关信息
     */
    val requirementCompletenessId: Long?,
    val completenessData: RequirementCompletenessVO?,
    
    /**
     * 需求智能建议相关信息
     */
    val requirementSuggestionId: Long?,
    val suggestionData: RequirementSuggestionVO?,
    
    /**
     * 需求总结分析相关信息
     */
    val requirementSummaryAnalysisId: Long?,
    val summaryAnalysisData: RequirementSummaryAnalysisVO?
) {
    companion object {
        /**
         * 从领域模型转换为详细视图对象
         */
        fun fromDomain(
            conversationList: RequirementConversation,
            category: RequirementCategory?,
            priority: RequirementPriority?,
            workload: RequirementWorkload?,
            taskBreakdown: RequirementTaskBreakdown?,
            completeness: RequirementCompleteness?,
            suggestion: RequirementSuggestion?,
            summaryAnalysis: RequirementSummaryAnalysis?
        ): RequirementConversationListDetailedVO {
            return RequirementConversationListDetailedVO(
                id = conversationList.id!!,
                title = conversationList.title,
                startStatus = conversationList.startStatus,
                analysisStartStatus = conversationList.analysisStartStatus,
                analysisCompleteStatus = conversationList.analysisCompleteStatus,
                createdAt = conversationList.createdAt,
                updatedAt = conversationList.updatedAt,
                
                requirementCategoryId = conversationList.requirementCategoryId,
                categoryData = category?.let { RequirementCategoryVO.fromDomain(it) },
                
                requirementPriorityId = conversationList.requirementPriorityId,
                priorityData = priority?.let { RequirementPriorityVO.fromDomain(it) },
                
                requirementWorkloadId = conversationList.requirementWorkloadId,
                workloadData = workload?.let { RequirementWorkloadVO.fromDomain(it) },
                
                requirementTaskBreakdownId = conversationList.requirementTaskBreakdownId,
                taskBreakdownData = taskBreakdown?.let { RequirementTaskBreakdownVO.fromDomain(it) },
                
                requirementCompletenessId = conversationList.requirementCompletenessId,
                completenessData = completeness?.let { RequirementCompletenessVO.fromDomain(it) },
                
                requirementSuggestionId = conversationList.requirementSuggestionId,
                suggestionData = suggestion?.let { RequirementSuggestionVO.fromDomain(it) },
                
                requirementSummaryAnalysisId = conversationList.requirementSummaryAnalysisId,
                summaryAnalysisData = summaryAnalysis?.let { RequirementSummaryAnalysisVO.fromDomain(it) }
            )
        }
    }
}


