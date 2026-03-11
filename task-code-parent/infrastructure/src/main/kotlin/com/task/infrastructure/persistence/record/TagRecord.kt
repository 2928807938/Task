package com.task.infrastructure.persistence.record

import com.task.infrastructure.persistence.base.BaseRecord
import org.springframework.data.relational.core.mapping.Table

/**
 * 标签表记录类
 * 映射到数据库中的t_tag表，存储标签信息
 */
@Table("t_tag")
data class TagRecord(

    /**
     * 标签名称
     */
    val name: String,

    /**
     * 标签颜色，十六进制颜色代码
     */
    val color: String = "#FFFFFF",

    /**
     * 标签描述
     */
    val description: String? = null,

    /**
     * 所属项目ID，如果为空则表示是全局标签
     */
    val projectId: Long? = null

) : BaseRecord()
