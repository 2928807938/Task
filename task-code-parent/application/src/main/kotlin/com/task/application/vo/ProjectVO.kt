package com.task.application.vo

import java.time.OffsetDateTime

/**
 * 项目视图对象
 * 用于返回给前端的项目数据
 */
data class ProjectVO(
    /**
     * 项目ID
     */
    val id: Long,
    
    /**
     * 项目名称
     */
    val name: String,
    
    /**
     * 项目描述
     */
    val description: String?,
    
    /**
     * 项目进度（百分比）
     */
    val progress: Int,
    
    /**
     * 项目开始日期
     */
    val startDate: OffsetDateTime?,
    
    /**
     * 是否已归档
     */
    val archived: Boolean,
    
    /**
     * 项目负责人ID
     */
    val ownerId: Long,
    
    /**
     * 项目负责人姓名
     */
    val ownerName: String,
    
    /**
     * 项目成员数量
     */
    val memberCount: Int,
    
    /**
     * 创建时间
     */
    val createdAt: OffsetDateTime?,
    
    /**
     * 更新时间
     */
    val updatedAt: OffsetDateTime?
)