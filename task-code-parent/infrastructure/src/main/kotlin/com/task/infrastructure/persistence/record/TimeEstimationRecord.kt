package com.task.infrastructure.persistence.record

import com.task.infrastructure.persistence.base.BaseRecord
import org.springframework.data.relational.core.mapping.Table

/**
 * 时间估计记录类
 * 映射到数据库中的t_time_estimation表，存储任务时间估计信息
 */
@Table("t_time_estimation")
data class TimeEstimationRecord(
    /**
     * 关联的任务ID
     */
    val taskId: Long,

    /**
     * 预计完成所需的小时数
     */
    val estimatedHours: Double,

    /**
     * 估计创建者ID
     */
    val createdById: Long,

    /**
     * 基线类型代码
     */
    val baselineType: Int,

    /**
     * 估计理由，记录为什么做出这样的估计
     */
    val justification: String? = null

) : BaseRecord()
