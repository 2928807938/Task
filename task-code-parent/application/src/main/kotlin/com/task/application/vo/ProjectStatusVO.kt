package com.task.application.vo

/**
 * 项目状态视图对象
 * 用于前端展示项目状态信息
 */
data class ProjectStatusVO(
    /**
     * 项目状态唯一标识
     */
    val id: Long,

    /**
     * 项目状态名称，如：规划中、进行中、已完成、已暂停等
     */
    val name: String,

    /**
     * 状态颜色，用于UI显示，格式为十六进制颜色码
     */
    val color: String?,

    /**
     * 优先级排序号
     * 数值越小表示优先级越高，从1开始
     * 用于在UI中显示优先级的排序
     */
    val order: Int
)
