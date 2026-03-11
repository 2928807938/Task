package com.task.application.request

import jakarta.validation.constraints.Min
import jakarta.validation.constraints.NotBlank
import jakarta.validation.constraints.Pattern
import jakarta.validation.constraints.Size

/**
 * 优先级项
 * 用于自定义项目优先级体系
 */
data class PriorityItem(
    /**
     * 优先级项ID
     */
    @field:NotBlank(message = "优先级项ID不能为空")
    val id: String,
    
    /**
     * 优先级名称
     */
    @field:NotBlank(message = "优先级名称不能为空")
    @field:Size(min = 1, max = 50, message = "优先级名称长度必须在1-50个字符之间")
    val name: String,
    
    /**
     * 优先级颜色（十六进制颜色码）
     */
    @field:NotBlank(message = "优先级颜色不能为空")
    @field:Pattern(regexp = "^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$", message = "颜色代码格式不正确，应为十六进制颜色码")
    val color: String,
    
    /**
     * 优先级排序号
     * 数值越小表示优先级越高，从1开始
     * 用于在UI中显示优先级的排序
     */
    @field:Min(value = 1, message = "排序号必须大于等于1")
    val order: Int = 1
)

/**
 * 状态项
 * 用于自定义项目状态流程
 */
data class StatusItem(
    /**
     * 状态项ID
     */
    @field:NotBlank(message = "状态项ID不能为空")
    val id: String,
    
    /**
     * 状态名称
     */
    @field:NotBlank(message = "状态名称不能为空")
    @field:Size(min = 1, max = 50, message = "状态名称长度必须在1-50个字符之间")
    val name: String,
    
    /**
     * 状态颜色（十六进制颜色码）
     */
    @field:NotBlank(message = "状态颜色不能为空")
    @field:Pattern(regexp = "^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$", message = "颜色代码格式不正确，应为十六进制颜色码")
    val color: String
)

/**
 * 状态转换规则
 * 定义状态之间的转换关系
 */
data class StatusTransitionRule(
    /**
     * 源状态ID
     */
    @field:NotBlank(message = "源状态ID不能为空")
    val fromStatusId: String,
    
    /**
     * 目标状态ID
     */
    @field:NotBlank(message = "目标状态ID不能为空")
    val toStatusId: String
)
