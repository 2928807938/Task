package com.task.infrastructure.persistence.record

import com.task.infrastructure.persistence.base.BaseRecord
import org.springframework.data.relational.core.mapping.Table

/**
 * 总结分析分析记录类
 * 映射到数据库中的t_requirement_summary_analysis表，存储需求摘要分析信息
 */
@Table("t_requirement_summary_analysis")
data class RequirementSummaryAnalysisRecord(
    /**
     * 关联到需求的ID
     */
    val requirementId: Long?,
    
    /**
     * 需求摘要，存储为JSON格式
     */
    val summaryJson: String,
    
    /**
     * 任务安排，存储为JSON格式
     */
    val taskArrangementJson: String

) : BaseRecord() 