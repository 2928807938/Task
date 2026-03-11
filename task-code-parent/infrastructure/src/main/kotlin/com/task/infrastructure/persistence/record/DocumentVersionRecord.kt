package com.task.infrastructure.persistence.record

import com.task.infrastructure.persistence.base.BaseRecord
import org.springframework.data.relational.core.mapping.Table

/**
 * 文档版本记录类
 * 映射到数据库中的t_document_version表，存储文档版本信息
 */
@Table("t_document_version")
data class DocumentVersionRecord(
    /**
     * 文档ID
     */
    val documentId: Long,

    /**
     * 版本号，如1.0, 1.1等
     */
    val versionNumber: String,

    /**
     * 文档内容
     */
    val content: String,

    /**
     * 版本说明
     */
    val notes: String? = null,

    /**
     * 创建用户ID
     */
    val createdById: Long,

    /**
     * 版本类型代码
     * 对应VersionTypeEnum的code值
     */
    val versionTypeCode: Int

) : BaseRecord()