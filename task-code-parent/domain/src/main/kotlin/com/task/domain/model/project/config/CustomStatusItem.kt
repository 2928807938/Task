package com.task.domain.model.project.config

/**
 * 自定义状态项
 * 用于定义项目状态的属性
 */
data class CustomStatusItem(
    /**
     * 状态ID
     * 唯一标识符，格式如"status-1746433383333"
     */
    val id: String = "",
    
    /**
     * 状态名称
     */
    val name: String,
    
    /**
     * 状态颜色
     * 格式：十六进制颜色代码，例如 "#00FF00"
     */
    val color: String,
    
    /**
     * 状态顺序
     * 决定状态在流程中的显示顺序
     */
    val order: Int = 1,
    
    /**
     * 是否为默认状态
     * 默认状态作为任务初始状态
     */
    val isDefault: Boolean = false,
    
    /**
     * 是否为终态
     * 终态表示任务已完成
     */
    val isTerminal: Boolean = false
)
