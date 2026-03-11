package com.task.domain.model.versioning

import java.time.OffsetDateTime

/**
 * 版本控制领域模型
 * 支持文档类任务的版本控制
 */
data class DocumentVersion(
    /**
     * 版本唯一标识
     */
    val id: Long,

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
     * 版本类型
     */
    val versionType: VersionTypeEnum = VersionTypeEnum.MINOR,

    /**
     * 创建时间
     */
    val createdAt: OffsetDateTime?,

    /**
     * 更新时间
     */
    val updatedAt: OffsetDateTime? = null
) {
    /**
     * 判断是否为主版本
     * 向后兼容原isMajorVersion属性
     */
    val isMajorVersion: Boolean
        get() = versionType == VersionTypeEnum.MAJOR
}