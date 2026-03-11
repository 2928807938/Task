package com.task.infrastructure.persistence.record

import com.task.infrastructure.persistence.base.BaseRecord
import org.springframework.data.relational.core.mapping.Table

/**
 * 项目状态转换表记录类
 * 映射到数据库中的t_project_status_transition表，存储项目状态之间的合法转换规则
 */
@Table("t_project_status_transition")
data class ProjectStatusTransitionRecord(

    /**
     * 项目ID
     * 指定该转换规则所属的项目
     */
    val projectId: Long,

    /**
     * 起始状态ID
     */
    var fromStatusId: Long,
    
    /**
     * 目标状态ID
     */
    var toStatusId: Long,
    
    /**
     * 事件代码
     */
    var eventCode: String,
    
    /**
     * 转换条件代码
     * 可选，用于定义状态转换的条件
     */
    var guardCondition: String? = null,
    
    /**
     * 转换动作代码
     * 可选，用于定义状态转换时执行的动作
     */
    var actionCode: String? = null,
    
    /**
     * 是否启用
     * 可用于临时禁用某些转换规则
     */
    var isEnabled: Boolean = true

) : BaseRecord()
