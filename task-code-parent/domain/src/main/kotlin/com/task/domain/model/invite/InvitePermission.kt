package com.task.domain.model.invite

/**
 * 邀请权限模型
 * 定义被邀请者将获得的权限
 */
data class InvitePermission(
    /**
     * 权限ID
     */
    val id: Long? = null,

    /**
     * 邀请链接ID
     */
    val inviteLinkId: Long? = null,

    /**
     * 系统或项目ID
     */
    val targetId: Long,

    /**
     * 目标类型：SYSTEM(系统), PROJECT(项目)
     */
    val targetType: TargetType,

    /**
     * 角色ID
     */
    val roleId: Long,

    /**
     * 角色名称
     */
    val roleName: String
)

/**
 * 目标类型枚举
 */
enum class TargetType {
    SYSTEM,  // 系统级权限
    PROJECT  // 项目级权限
}