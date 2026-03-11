package com.task.infrastructure.persistence.record

import com.task.infrastructure.persistence.base.BaseRecord
import org.springframework.data.relational.core.mapping.Table

/**
 * 项目状态表记录类
 * 映射到数据库中的t_project_status表，存储项目状态信息
 */
@Table("t_project_status")
data class ProjectStatusRecord(

    /**
     * 状态名称
     */
    var name: String,

    /**
     * 项目状态描述
     */
    var description: String? = null,

    /**
     * 状态颜色，用于UI显示，格式为十六进制颜色码
     */
    var color: String,

    /**
     * 排序顺序
     */
    var displayOrder: Int = 0,

    /**
     * 是否为系统默认状态
     */
    var isDefault: Boolean = false,

    /**
     * 是否为终止状态（如已完成、已取消等）
     */
    var isTerminal: Boolean = false

) : BaseRecord()
