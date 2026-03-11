package com.task.domain.model.task

import java.time.OffsetDateTime

/**
 * 标签领域模型
 * 代表系统中的一个标签，可用于任务分类
 */
data class Tag(
    /**
     * 标签唯一标识
     */
    val id: Long,

    /**
     * 标签名称
     */
    val name: String,

    /**
     * 标签颜色，用于UI显示，格式为十六进制颜色码
     */
    val color: String? = null,

    /**
     * 标签描述
     */
    val description: String? = null,

    /**
     * 所属项目ID，如果为空则表示是全局标签
     */
    val projectId: Long? = null,

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
