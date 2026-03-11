package com.task.domain.model.invite

/**
 * 邀请结果
 */
data class InviteResult(
    val success: Boolean,
    val message: String,
    val inviteLink: InviteLink? = null
)