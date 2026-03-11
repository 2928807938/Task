package com.task.infrastructure.persistence.record

import com.task.infrastructure.persistence.base.BaseRecord
import org.springframework.data.relational.core.mapping.Column
import org.springframework.data.relational.core.mapping.Table
import java.time.OffsetDateTime

/**
 * 项目归档记录数据库实体
 * 对应数据库中的project_archive_record表
 */
@Table("t_project_archive_record")
data class ProjectArchiveRecordRecord(
    /**
     * 项目ID
     */
    @Column("project_id")
    val projectId: Long,

    /**
     * 操作类型：1-归档，2-取消归档
     */
    @Column("operation_type")
    val operationType: Int,

    /**
     * 操作人ID
     */
    @Column("operator_id")
    val operatorId: Long,

    /**
     * 操作原因
     */
    @Column("reason")
    val reason: String? = null,

    /**
     * 操作时间
     */
    @Column("operated_at")
    val operatedAt: OffsetDateTime = OffsetDateTime.now()
) : BaseRecord() {
    companion object {
        /**
         * 表名
         */
        const val TABLE_NAME = "project_archive_record"
        
        /**
         * 列名：ID
         */
        const val COLUMN_ID = "id"
        
        /**
         * 列名：项目ID
         */
        const val COLUMN_PROJECT_ID = "project_id"
        
        /**
         * 列名：操作类型
         */
        const val COLUMN_OPERATION_TYPE = "operation_type"
        
        /**
         * 列名：操作人ID
         */
        const val COLUMN_OPERATOR_ID = "operator_id"
        
        /**
         * 列名：操作原因
         */
        const val COLUMN_REASON = "reason"
        
        /**
         * 列名：操作时间
         */
        const val COLUMN_OPERATED_AT = "operated_at"
        
        /**
         * 列名：创建时间
         */
        const val COLUMN_CREATED_AT = "created_at"
        
        /**
         * 列名：更新时间
         */
        const val COLUMN_UPDATED_AT = "updated_at"
        
        /**
         * 列名：版本号
         */
        const val COLUMN_VERSION = "version"
        
        /**
         * 列名：逻辑删除标志
         */
        const val COLUMN_DELETED = "deleted"
    }
}
