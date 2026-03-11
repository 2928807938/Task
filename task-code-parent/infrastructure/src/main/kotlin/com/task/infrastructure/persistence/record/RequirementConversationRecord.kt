package com.task.infrastructure.persistence.record

import com.task.infrastructure.persistence.base.BaseRecord
import org.springframework.data.relational.core.mapping.Table

/**
 * 需求对话列表记录类
 * 映射到数据库中的t_requirement_conversation表，存储需求对话列表信息
 */
@Table("t_requirement_conversation")
data class RequirementConversationRecord(
    /**
     * 关联的需求对话列表基础记录ID
     */
    val conversationListId: Long? = null,

    /**
     * 关联到需求的ID
     */
    val requirementId: Long? = null,
    
    /**
     * 对话列表标题
     */
    val title: String,
    
    /**
     * 开始状态
     */
    val startStatus: String?,
    
    /**
     * 开始分析状态
     */
    val analysisStartStatus: String?,
    
    /**
     * 分析完成状态
     */
    val analysisCompleteStatus: String?,
    
    /**
     * 需求分类ID
     */
    val requirementCategoryId: Long?,
    
    /**
     * 需求优先级ID
     */
    val requirementPriorityId: Long?,
    
    /**
     * 需求工作量ID
     */
    val requirementWorkloadId: Long?,
    
    /**
     * 任务拆分ID
     */
    val requirementTaskBreakdownId: Long?,
    
    /**
     * 需求完整度检查ID
     */
    val requirementCompletenessId: Long?,
    
    /**
     * 智能建议ID
     */
    val requirementSuggestionId: Long?,
    
    /**
     * 总结分析ID
     */
    val requirementSummaryAnalysisId: Long?,

    /**
     * 会话根主任务（仅首轮写入）
     */
    val rootMainTask: String? = null,

    /**
     * 当前轮次
     */
    val currentTurnNo: Int = 0,

    /**
     * 最新任务拆分快照
     */
    val latestTaskBreakdownJson: String? = null,

    /**
     * 需求分类分析快照
     */
    val requirementTypeJson: String? = null,

    /**
     * 优先级分析快照
     */
    val priorityJson: String? = null,

    /**
     * 工作量分析快照
     */
    val workloadJson: String? = null,

    /**
     * 完整度分析快照
     */
    val completenessJson: String? = null,

    /**
     * 智能建议快照
     */
    val suggestionJson: String? = null,

    /**
     * 分析摘要快照
     */
    val analysisSummaryJson: String? = null,

    /**
     * 分析总结快照
     */
    val finalSummaryJson: String? = null,

    /**
     * 任务规划快照
     */
    val taskPlanningJson: String? = null

) : BaseRecord() 
