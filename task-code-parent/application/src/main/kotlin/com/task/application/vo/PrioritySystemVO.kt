package com.task.application.vo

/**
 * 优先级体系视图对象
 */
data class PrioritySystemVO(
    /**
     * 优先级ID
     */
    val id: Long,

    /**
     * 优先级名称
     */
    val name: String,

    /**
     * 优先级颜色
     */
    val color: String,

    /**
     * 优先级等级
     */
    val level: Int,

    /**
     * 优先级分数(0-100)
     */
    val score: Int
)