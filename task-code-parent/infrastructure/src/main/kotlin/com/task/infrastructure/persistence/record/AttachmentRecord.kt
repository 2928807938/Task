package com.task.infrastructure.persistence.record

import com.task.infrastructure.persistence.base.BaseRecord
import org.springframework.data.relational.core.mapping.Table

/**
 * 附件表记录类
 * 映射到数据库中的t_attachment表，存储文件附件信息
 */
@Table("t_attachment")
data class AttachmentRecord(
    /**
     * 文件名
     */
    val fileName: String,

    /**
     * 文件大小（字节）
     */
    val fileSize: Long,

    /**
     * 文件类型/MIME类型
     */
    val fileType: String?,

    /**
     * 存储路径
     */
    val storagePath: String,

    /**
     * 实体类型，存储枚举的整数代码
     */
    val entityType: Int,

    /**
     * 实体ID，根据entityType关联到不同的表
     */
    val entityId: Long,

    /**
     * 上传者ID，关联t_users表
     */
    val uploadedById: Long,

    /**
     * 文件描述
     */
    val description: String? = null,

    /**
     * 是否公开可见
     * 对于私密文件可能需要额外的访问权限
     */
    val isPublic: Boolean = true,
) : BaseRecord()