package com.task.domain.model.task.requirementcategory

import java.time.OffsetDateTime

/**
 * 需求分类领域模型
 * 存储需求的分类信息，包括标签和颜色
 */
data class RequirementCategory(
    /**
     * 唯一标识
     */
    val id: Long?,
    
    /**
     * 标签数组，存储为JSON格式
     */
    val tags: List<String>,
    
    /**
     * 颜色数组，存储为JSON格式
     */
    val colors: List<String>,
    
    /**
     * 是否删除
     */
    val deleted: Int = 0,
    
    /**
     * 创建时间
     */
    val createdAt: OffsetDateTime,
    
    /**
     * 最后更新时间
     */
    val updatedAt: OffsetDateTime?,
    
    /**
     * 乐观锁版本号
     */
    val version: Int = 0
) {
    companion object {
        /**
         * 创建新的需求分类
         */
        fun create(
            tags: List<String>,
            colors: List<String>
        ): RequirementCategory {
            val now = OffsetDateTime.now()
            return RequirementCategory(
                id = null,
                tags = tags,
                colors = colors,
                deleted = 0,
                createdAt = now,
                updatedAt = now,
                version = 0
            )
        }
    }
    
    /**
     * 更新标签和颜色
     */
    fun update(tags: List<String>, colors: List<String>): RequirementCategory {
        return this.copy(
            tags = tags,
            colors = colors,
            updatedAt = OffsetDateTime.now()
        )
    }
} 