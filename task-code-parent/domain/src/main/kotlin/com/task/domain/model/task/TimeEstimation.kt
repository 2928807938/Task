package com.task.domain.model.task

import java.time.OffsetDateTime

/**
 * 时间估计领域模型
 * 用于估计任务的计划完成时间
 */
data class TimeEstimation(
    /**
     * 时间估计唯一标识
     */
    val id: Long,

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
     * 基线类型
     */
    val baselineType: BaselineTypeEnum,

    /**
     * 估计理由，记录为什么做出这样的估计
     */
    val justification: String? = null,

    /**
     * 创建时间
     */
    val createdAt: OffsetDateTime,

    /**
     * 更新时间
     */
    val updatedAt: OffsetDateTime? = null,

    /**
     * 乐观锁版本号，用于并发控制
     */
    var version: Int
) {
    /**
     * 判断估计是否被修改过
     */
    fun isModified(): Boolean = updatedAt != null
}
