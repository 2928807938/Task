package com.task.domain.model.audit

import com.task.domain.model.attachment.EntityTypeEnum
import java.time.OffsetDateTime

/**
 * 变更历史领域模型
 * 记录实体对象的变更历史
 */
data class ChangeLog(
    /**
     * 变更历史唯一标识
     */
    val id: Long,

    /**
     * 实体类型
     */
    val entityType: EntityTypeEnum,

    /**
     * 实体ID
     */
    val entityId: Long,

    /**
     * 变更类型
     */
    val changeType: ChangeTypeEnum,

    /**
     * 变更字段名
     */
    val fieldName: String? = null,

    /**
     * 字段旧值
     */
    val oldValue: String? = null,

    /**
     * 字段新值
     */
    val newValue: String? = null,

    /**
     * 变更说明
     */
    val description: String? = null,

    /**
     * 操作用户ID
     */
    val userId: Long,

    /**
     * 创建时间
     */
    val createdAt: OffsetDateTime?,

    /**
     * 乐观锁版本号，用于并发控制
     */
    var version: Int
)
