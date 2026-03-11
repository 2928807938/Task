package com.task.application.vo

import com.task.domain.model.task.requirementcategory.RequirementCategory
import java.time.OffsetDateTime

/**
 * 需求分类视图对象
 */
data class RequirementCategoryVO(
    /**
     * 唯一标识
     */
    val id: Long,
    
    /**
     * 标签数组
     */
    val tags: List<String>,
    
    /**
     * 颜色数组
     */
    val colors: List<String>,
    
    /**
     * 创建时间
     */
    val createdAt: OffsetDateTime,
    
    /**
     * 最后更新时间
     */
    val updatedAt: OffsetDateTime?
) {
    companion object {
        /**
         * 从领域模型转换为视图对象
         */
        fun fromDomain(domain: RequirementCategory): RequirementCategoryVO {
            return RequirementCategoryVO(
                id = domain.id!!,
                tags = domain.tags,
                colors = domain.colors,
                createdAt = domain.createdAt,
                updatedAt = domain.updatedAt
            )
        }
    }
} 