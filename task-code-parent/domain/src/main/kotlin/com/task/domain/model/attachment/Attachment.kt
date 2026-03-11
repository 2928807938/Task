package com.task.domain.model.attachment

import com.task.domain.model.user.User
import java.time.OffsetDateTime

/**
 * 附件领域模型
 * 代表系统中的一个文件附件
 */
data class Attachment(
    /**
     * 附件唯一标识
     */
    val id: Long,
    
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
     * 实体类型
     */
    val entityType: EntityTypeEnum,
    
    /**
     * 实体ID，根据entityType关联到不同的对象
     */
    val entityId: Long,
    
    /**
     * 上传者ID
     */
    val uploadedById: Long,
    
    /**
     * 上传者
     */
    val uploadedBy: User? = null,
    
    /**
     * 文件描述
     */
    val description: String? = null,
    
    /**
     * 是否公开可见
     * 对于私密文件可能需要额外的访问权限
     */
    val isPublic: Boolean = true,
    
    /**
     * 创建时间
     */
    val createdAt: OffsetDateTime?,
    
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
     * 获取文件扩展名
     */
    fun getExtension(): String? {
        return fileName.substringAfterLast('.', "")
            .takeIf { it.isNotEmpty() }
    }
    
    /**
     * 判断是否为图片类型
     */
    fun isImage(): Boolean {
        return fileType?.startsWith("image/") ?: false
    }
    
    /**
     * 判断是否为文档类型
     */
    fun isDocument(): Boolean {
        val docTypes = listOf("application/pdf", "application/msword", 
            "application/vnd.openxmlformats-officedocument")
        return fileType?.let { type -> docTypes.any { type.startsWith(it) } } ?: false
    }
}
