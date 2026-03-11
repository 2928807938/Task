package com.task.domain.model.project.config

/**
 * 项目配置类
 * 用于定义项目的各种配置参数
 */
data class ProjectConfig(
    /**
     * 优先级体系类型
     * 可选值：standard(标准)、advanced(高级)、custom(自定义)
     */
    val prioritySystem: String = "standard",
    
    /**
     * 自定义优先级项
     * 当prioritySystem为custom时使用
     */
    val customPriorityItems: List<CustomPriorityItem> = emptyList(),
    
    /**
     * 状态体系类型
     * 可选值：standard(标准)、extended(扩展)、custom(自定义)
     */
    val statusSystem: String = "standard",
    
    /**
     * 自定义状态项
     * 当statusSystem为custom时使用
     */
    val customStatusItems: List<CustomStatusItem> = emptyList(),
    
    /**
     * 自定义状态转换规则
     * 当statusSystem为custom时使用
     */
    val customStatusTransitions: List<StatusTransitionRule> = emptyList()
)

/**
 * 自定义优先级项
 */
data class CustomPriorityItem(
    /**
     * 优先级ID
     * 唯一标识符，格式如"priority-1746433383333"
     */
    val id: String = "",
    
    /**
     * 优先级名称
     */
    val name: String,
    
    /**
     * 优先级颜色
     * 格式：十六进制颜色代码，例如 "#FF0000"
     */
    val color: String,
    
    /**
     * 优先级顺序
     * 数值越小表示优先级越高，从1开始
     */
    val order: Int = 1
)

