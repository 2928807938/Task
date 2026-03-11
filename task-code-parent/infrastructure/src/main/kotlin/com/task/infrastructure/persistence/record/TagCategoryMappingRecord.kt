package com.task.infrastructure.persistence.record

import com.task.infrastructure.persistence.base.BaseRecord
import org.springframework.data.relational.core.mapping.Table

/**
 * 标签与分类关联记录类
 * 映射到数据库中的t_tag_category_mapping表
 */
@Table("t_tag_category_mapping")
data class TagCategoryMappingRecord(
    /**
     * 标签ID
     */
    val tagId: Long,
    
    /**
     * 分类ID
     */
    val categoryId: Long,
    
    /**
     * 标签在分类中的排序顺序
     */
    val sortOrder: Int = 0
) : BaseRecord()