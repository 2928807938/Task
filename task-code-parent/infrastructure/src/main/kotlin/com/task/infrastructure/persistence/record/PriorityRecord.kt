package com.task.infrastructure.persistence.record

import com.task.infrastructure.persistence.base.BaseRecord
import org.springframework.data.relational.core.mapping.Table

/**
 * 优先级表记录类
 * 映射到数据库中的t_priority表，存储通用优先级信息
 */
@Table("t_priority")
data class PriorityRecord(

    /**
     * 项目id
     */
    val projectId: Long,

    /**
     * 优先级名称
     */
    val name: String,

    /**
     * 优先级等级，数字越小优先级越高
     */
    val level: Int,
    
    /**
     * 优先级百分制分数（0-100），用于标准化不同优先级系统
     * 分数越高表示优先级越高
     */
    val score: Int = 0,
    
    /**
     * 优先级颜色，用于UI显示
     * 格式为十六进制颜色代码，例如 "#FF0000" 表示红色
     */
    val color: String

) : BaseRecord()