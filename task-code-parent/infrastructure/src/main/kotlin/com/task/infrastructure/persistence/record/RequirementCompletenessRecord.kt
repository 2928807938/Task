package com.task.infrastructure.persistence.record

import com.task.infrastructure.persistence.base.BaseRecord
import org.springframework.data.relational.core.mapping.Table

/**
 * 需求完整度检查记录类
 * 映射到数据库中的t_requirement_completeness表，存储需求完整度检查信息
 */
@Table("t_requirement_completeness")
data class RequirementCompletenessRecord(
    /**
     * 关联到需求的ID
     */
    val requirementId: Long?,

    /**
     * 总体完整度
     * 可以是百分比或描述性评估
     */
    val overallCompleteness: String,

    /**
     * 各方面完整度，存储为JSON格式
     */
    val aspectsJson: String? = null,

    /**
     * 优化建议，存储为JSON格式
     */
    val optimizationSuggestionsJson: String? = null

) : BaseRecord() 