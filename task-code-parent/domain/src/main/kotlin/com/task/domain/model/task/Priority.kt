package com.task.domain.model.task

import java.time.OffsetDateTime

/**
 * 优先级表记录类领域模型
 */
data class Priority(
    /**
     * 优先级唯一标识
     */
    val id: Long,

    /**
     * 项目id
     */
    val projectId: Long,

    /**
     * 优先级名称
     */
    val name: String,

    /**
     * 优先级等级，数字越大优先级越高
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
    val color: String,
    
    /**
     * 优先级排序号
     * 数值越小优先级越高，从1开始
     * 用于在UI中显示优先级的排序
     */
    val order: Int = 999,

    /**
     * 记录创建时间
     */
    val createdAt: OffsetDateTime?,

    /**
     * 记录最后更新时间
     */
    val updatedAt: OffsetDateTime? = null,

    /**
     * 乐观锁版本号，用于并发控制
     */
    var version: Int
)