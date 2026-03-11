package com.task.domain.model.project

import java.time.OffsetDateTime

/**
 * 项目归档领域模型
 * 代表项目的归档状态以及相关的归档信息
 */
data class ProjectArchive(
    /**
     * 归档唯一标识
     */
    val id: Long? = null,
    
    /**
     * 关联的项目ID
     */
    val projectId: Long,
    
    /**
     * 项目名称
     */
    val projectName: String? = null,
    
    /**
     * 归档状态
     * true表示已归档，false表示未归档
     */
    val archived: Boolean = false,
    
    /**
     * 最近一次归档操作时间
     */
    val archivedAt: OffsetDateTime? = null,
    
    /**
     * 最近一次归档操作者ID
     */
    val archivedBy: Long? = null,
    
    /**
     * 最近一次归档操作者名称
     */
    val archiverName: String? = null,
    
    /**
     * 最近一次归档操作原因
     */
    val archiveReason: String? = null,
    
    /**
     * 最近一次取消归档操作时间
     */
    val unarchivedAt: OffsetDateTime? = null,
    
    /**
     * 最近一次取消归档操作者ID
     */
    val unarchivedBy: Long? = null,
    
    /**
     * 最近一次取消归档操作者名称
     */
    val unarchiverName: String? = null,
    
    /**
     * 最近一次取消归档操作原因
     */
    val unarchiveReason: String? = null,
    
    /**
     * 归档记录列表
     */
    val records: List<ProjectArchiveRecord> = emptyList(),
    
    /**
     * 创建时间
     */
    val createdAt: OffsetDateTime? = null,
    
    /**
     * 更新时间
     */
    val updatedAt: OffsetDateTime? = null,

    /**
     * 乐观锁版本号，用于并发控制
     */
    var version: Int
)
