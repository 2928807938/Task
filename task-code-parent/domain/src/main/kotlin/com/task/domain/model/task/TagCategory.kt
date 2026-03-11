package com.task.domain.model.task

import java.time.OffsetDateTime

/**
 * 标签分类领域模型
 * 用于对标签进行分类管理
 */
data class TagCategory(
    /**
     * 分类唯一标识
     */
    val id: Long,
    
    /**
     * 分类名称
     */
    val name: String,
    
    /**
     * 分类描述
     */
    val description: String? = null,
    
    /**
     * 分类颜色代码，如#FF5733
     */
    val colorCode: String? = null,
    
    /**
     * 分类图标
     */
    val icon: String? = null,
    
    /**
     * 所属团队ID，如果为null则为全局分类
     */
    val teamId: Long? = null,
    
    /**
     * 包含的标签列表
     */
    val tags: List<Tag> = emptyList(),
    
    /**
     * 创建时间
     */
    val createdAt: OffsetDateTime,
    
    /**
     * 更新时间
     */
    val updatedAt: OffsetDateTime? = null,

    /**
     * 乐观锁版本号，用于并发控制
     */
    var version: Int
)
