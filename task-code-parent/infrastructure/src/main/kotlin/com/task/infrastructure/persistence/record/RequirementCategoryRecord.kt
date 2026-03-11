package com.task.infrastructure.persistence.record

import com.task.infrastructure.persistence.base.BaseRecord
import org.springframework.data.relational.core.mapping.Table

/**
 * 需求分类记录类
 * 映射到数据库中的t_requirement_category表，存储需求分类信息
 */
@Table("t_requirement_category")
data class RequirementCategoryRecord(
    /**
     * 标签数组，存储为JSON格式
     */
    val tagsJson: String,

    /**
     * 颜色数组，存储为JSON格式
     */
    val colorsJson: String

) : BaseRecord() 