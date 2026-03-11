package com.task.domain.model.project

import java.time.OffsetDateTime

/**
 * 项目状态映射领域模型
 * 
 * 用于存储项目与状态的关联关系
 */
data class ProjectStatusMapping(
    /**
     * 记录唯一标识
     */
    val id: Long? = null,
    
    /**
     * 项目ID
     */
    val projectId: Long,
    
    /**
     * 状态ID
     */
    val statusId: Long,
    
    /**
     * 逻辑删除标志，0表示未删除，1表示已删除
     */
    val deleted: Int = 0,
    
    /**
     * 记录创建时间
     */
    val createdAt: OffsetDateTime = OffsetDateTime.now(),
    
    /**
     * 记录最后更新时间
     */
    val updatedAt: OffsetDateTime? = null,
    
    /**
     * 乐观锁版本号
     */
    val version: Int
)
