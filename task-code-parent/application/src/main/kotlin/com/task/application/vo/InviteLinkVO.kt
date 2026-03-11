package com.task.application.vo

import java.time.OffsetDateTime

/**
 * 邀请链接视图对象
 */
data class InviteLinkVO(
    val id: Long?,
    val code: String,
    val url: String,
    val expireAt: OffsetDateTime,
    val maxUsageCount: Int?,
    val usedCount: Int,
    val permissions: List<InvitePermissionVO>,
    val createdAt: OffsetDateTime
)

/**
 * 邀请权限视图对象
 */
data class InvitePermissionVO(
    val targetId: Long,
    val targetType: String,
    val roleId: Long,
    val roleName: String
)

/**
 * 创建邀请链接请求
 */
data class CreateInviteLinkRequest(
    val projectId: Long? = null,
    val validDays: Int = 7,
    val maxUsageCount: Int? = null,
    val permissions: List<InvitePermissionRequest> = emptyList()
)

/**
 * 邀请权限请求
 */
data class InvitePermissionRequest(
    val targetId: Long,
    val targetType: String,
    val roleId: Long,
    val roleName: String
)

/**
 * 邀请结果视图对象
 */
data class InviteResultVO(
    val success: Boolean,
    val message: String,
    val inviteLink: InviteLinkVO? = null
)