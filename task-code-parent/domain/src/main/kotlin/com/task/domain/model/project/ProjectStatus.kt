package com.task.domain.model.project

import java.time.OffsetDateTime

/**
 * 项目状态领域模型
 * 代表项目的各种状态
 */
data class ProjectStatus(
    
    /**
     * 项目状态唯一标识
     */
    val id: Long,

    /**
     * 项目状态名称，如：规划中、进行中、已完成、已暂停等
     */
    val name: String,

    /**
     * 项目状态描述
     */
    val description: String? = null,

    /**
     * 状态颜色，用于UI显示，格式为十六进制颜色码
     */
    val color: String,

    /**
     * 排序顺序
     */
    val displayOrder: Int = 0,

    /**
     * 是否为系统默认状态
     */
    val isDefault: Boolean = false,

    /**
     * 是否为终止状态（如已完成、已取消等）
     */
    val isTerminal: Boolean = false,

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
