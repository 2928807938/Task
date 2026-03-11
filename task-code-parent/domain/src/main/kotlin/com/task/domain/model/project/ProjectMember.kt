package com.task.domain.model.project

import com.task.domain.model.user.User
import java.time.OffsetDateTime

/**
 * 项目成员领域模型
 * 代表项目中的一个成员
 */
data class ProjectMember(
    /**
     * 项目成员唯一标识
     */
    val id: Long,

    /**
     * 所属项目ID
     */
    val projectId: Long,

    /**
     * 所属项目
     */
    val project: Project? = null,

    /**
     * 用户ID
     */
    val userId: Long,

    /**
     * 用户
     */
    val user: User? = null,

    /**
     * 项目角色ID
     */
    val roleId: Long,

    /**
     * 项目角色
     */
    val role: ProjectRole? = null,

    /**
     * 加入时间
     */
    val joinedAt: OffsetDateTime,

    /**
     * 逻辑删除标志，0表示未删除，1表示已删除
     */
    val deleted: Int = 0,

    /**
     * 创建时间
     */
    val createdAt: OffsetDateTime? = null,

    /**
     * 更新时间
     */
    val updatedAt: OffsetDateTime? = null,

    /**
     * 乐观锁版本号，用于并发控制
     */
    var version: Int
) {
    /**
     * 判断成员是否已被删除
     */
    fun isDeleted(): Boolean = deleted != 0
    
    /**
     * 判断成员是否有效（未被删除）
     */
    fun isActive(): Boolean = deleted == 0
}
