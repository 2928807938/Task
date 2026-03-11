package com.task.domain.model.project

import java.time.OffsetDateTime

/**
 * 项目状态转换模型
 * 
 * 定义项目状态之间的合法转换规则
 */
data class ProjectStatusTransition(

    /**
     * 项目状态转换唯一标识
     */
    var id: Long,
    
    /**
     * 项目ID
     * 指定该转换规则所属的项目
     */
    val projectId: Long,
    
    /**
     * 起始状态ID
     */
    val fromStatusId: Long,
    
    /**
     * 目标状态ID
     */
    val toStatusId: Long,
    
    /**
     * 事件代码
     */
    val eventCode: String,
    
    /**
     * 转换条件代码
     * 可选，用于定义状态转换的条件
     */
    val guardCondition: String? = null,
    
    /**
     * 转换动作代码
     * 可选，用于定义状态转换时执行的动作
     */
    val actionCode: String? = null,
    
    /**
     * 是否启用
     * 可用于临时禁用某些转换规则
     */
    val isEnabled: Boolean = true,

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
