package com.task.infrastructure.persistence.record

import com.task.infrastructure.persistence.base.BaseRecord
import org.springframework.data.relational.core.mapping.Table

/**
 * 需求建议记录类
 * 映射到数据库中的t_requirement_suggestion表，存储需求建议信息
 */
@Table("t_requirement_suggestion")
data class RequirementSuggestionRecord(
    /**
     * 关联到需求的ID
     */
    val requirementId: Long?,
    
    /**
     * 建议列表，存储为JSON格式
     */
    val suggestionsJson: String? = null // JSON字符串，存储List<Suggestion>

) : BaseRecord() 