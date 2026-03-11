package com.task.infrastructure.persistence.record

import com.task.infrastructure.persistence.base.BaseRecord
import org.springframework.data.relational.core.mapping.Table

/**
 * 需求优先级记录类
 * 映射到数据库中的t_requirement_priority表，存储需求优先级信息
 */
@Table("t_requirement_priority")
data class RequirementPriorityRecord(
    /**
     * 关联到需求的ID
     */
    val requirementId: Long?,
    
    /**
     * 优先级详情，JSON格式存储
     */
    val priorityJson: String? = null,
    
    /**
     * 排期信息，JSON格式存储
     */
    val schedulingJson: String? = null,
    
    /**
     * 因素信息，JSON格式存储
     */
    val factorsJson: String? = null,
    
    /**
     * 排期建议理由
     */
    val justification: String?

) : BaseRecord() 