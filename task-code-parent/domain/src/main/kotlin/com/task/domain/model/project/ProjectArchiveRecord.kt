package com.task.domain.model.project

import com.task.domain.model.user.User
import java.time.OffsetDateTime

/**
 * 项目归档记录领域模型
 * 记录项目的归档和取消归档历史
 */
data class ProjectArchiveRecord(
    /**
     * 记录唯一标识
     */
    val id: Long? = null,
    
    /**
     * 项目ID
     */
    val projectId: Long,
    
    /**
     * 操作类型：归档或取消归档
     */
    val operationType: ProjectArchiveOperationType,
    
    /**
     * 操作人ID
     */
    val operatorId: Long,
    
    /**
     * 操作人
     */
    val operator: User? = null,
    
    /**
     * 操作原因
     */
    val reason: String? = null,
    
    /**
     * 操作时间
     */
    val operatedAt: OffsetDateTime = OffsetDateTime.now(),
    
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
