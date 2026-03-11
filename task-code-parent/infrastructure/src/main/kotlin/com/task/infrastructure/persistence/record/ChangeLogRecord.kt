package com.task.infrastructure.persistence.record

import com.task.infrastructure.persistence.base.BaseRecord
import org.springframework.data.relational.core.mapping.Table

/**
 * 变更历史记录类
 * 映射到数据库中的t_change_log表，存储实体变更历史
 */
@Table("t_change_log")
data class ChangeLogRecord(
    /**
     * 实体类型代码，对应EntityTypeEnum.code
     */
    val entityType: Int,

    /**
     * 实体ID
     */
    val entityId: Long,

    /**
     * 变更类型代码，对应ChangeTypeEnum.code
     */
    val changeType: Int,

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
    val userId: Long

) : BaseRecord()
