package com.task.domain.model.invite

import java.time.OffsetDateTime
import java.time.temporal.ChronoUnit

/**
 * 邀请链接领域模型
 * 用于生成和管理团队成员邀请链接
 */
data class InviteLink(
    /**
     * 邀请链接唯一标识
     */
    val id: Long? = null,

    /**
     * 邀请链接的唯一代码
     */
    val code: String,

    /**
     * 创建者ID
     */
    val creatorId: Long,

    /**
     * 项目ID
     */
    val projectId: Long? = null,

    /**
     * 链接有效期截止时间
     */
    val expireAt: OffsetDateTime,

    /**
     * 最大使用次数，null表示不限制
     */
    val maxUsageCount: Int? = null,

    /**
     * 当前已使用次数
     */
    val usedCount: Int = 0,

    /**
     * 邀请权限配置
     */
    val permissions: List<InvitePermission> = emptyList(),

    /**
     * 逻辑删除标志，0表示未删除，1表示已删除
     */
    val deleted: Int = 0,

    /**
     * 记录创建时间
     */
    val createdAt: OffsetDateTime = OffsetDateTime.now(),

    /**
     * 记录最后更新时间
     */
    val updatedAt: OffsetDateTime? = null,

    /**
     * 乐观锁版本号，用于并发控制
     */
    val version: Int = 0
) {

    /**
     * 检查链接是否有效
     */
    fun isValid(): Boolean {
        val now = OffsetDateTime.now()

        // 检查是否过期
        if (now.isAfter(expireAt)) {
            return false
        }

        // 检查使用次数是否达到上限
        if (maxUsageCount != null && usedCount >= maxUsageCount) {
            return false
        }

        return true
    }

    /**
     * 使用链接，增加使用计数
     * @return 使用后的邀请链接
     */
    fun use(): InviteLink {
        return if (isValid()) {
            this.copy(usedCount = this.usedCount + 1)
        } else {
            this
        }
    }

    companion object {
        /**
         * 创建标准的7天有效期邀请链接
         */
        fun createStandard(
            code: String,
            creatorId: Long,
            projectId: Long? = null,
            permissions: List<InvitePermission> = emptyList()
        ): InviteLink {
            val expireAt = OffsetDateTime.now().plus(7, ChronoUnit.DAYS)
            return InviteLink(
                code = code,
                creatorId = creatorId,
                projectId = projectId,
                expireAt = expireAt,
                permissions = permissions
            )
        }

        /**
         * 创建自定义邀请链接
         */
        fun createCustom(
            code: String,
            creatorId: Long,
            projectId: Long? = null,
            validDays: Int,
            maxUsageCount: Int? = null,
            permissions: List<InvitePermission> = emptyList()
        ): InviteLink {
            val expireAt = OffsetDateTime.now().plus(validDays.toLong(), ChronoUnit.DAYS)
            return InviteLink(
                code = code,
                creatorId = creatorId,
                projectId = projectId,
                expireAt = expireAt,
                maxUsageCount = maxUsageCount,
                permissions = permissions
            )
        }
    }
}
