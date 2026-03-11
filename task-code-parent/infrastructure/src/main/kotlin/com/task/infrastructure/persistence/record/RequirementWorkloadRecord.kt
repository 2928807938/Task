package com.task.infrastructure.persistence.record

import com.task.infrastructure.persistence.base.BaseRecord
import org.springframework.data.relational.core.mapping.Table

/**
 * 需求工作量记录类
 * 映射到数据库中的t_requirement_workload表，存储需求工作量信息
 */
@Table("t_requirement_workload")
data class RequirementWorkloadRecord(
    /**
     * 关联到需求的ID
     */
    val requirementId: Long?,
    
    /**
     * 乐观估计工作量，JSON字符串或字符格式数字
     */
    val optimisticJson: String,
    
    /**
     * 最可能工作量，JSON字符串或字符格式数字
     */
    val mostLikelyJson: String,
    
    /**
     * 悲观估计工作量，JSON字符串或字符格式数字
     */
    val pessimisticJson: String,
    
    /**
     * 期望工作量，JSON字符串或字符格式数字
     */
    val expectedJson: String,
    
    /**
     * 标准差，JSON字符串或字符格式数字
     */
    val standardDeviationJson: String

) : BaseRecord() 