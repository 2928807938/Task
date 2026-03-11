package com.task.infrastructure.persistence.record

import com.task.infrastructure.persistence.base.BaseRecord
import org.springframework.data.relational.core.mapping.Table

/**
 * 标签分类记录类
 * 映射到数据库中的t_tag_category表，存储标签分类信息
 */
@Table("t_tag_category")
data class TagCategoryRecord(
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
    val teamId: Long? = null
) : BaseRecord()
