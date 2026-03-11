package com.task.application.service

import com.task.application.vo.CreateInviteLinkRequest
import com.task.application.vo.InviteLinkVO
import com.task.application.vo.InvitePermissionVO
import com.task.application.vo.InviteResultVO
import com.task.domain.model.invite.InviteLink
import com.task.domain.model.invite.InvitePermission
import com.task.domain.model.invite.TargetType
import com.task.domain.service.InviteService
import org.springframework.stereotype.Service
import reactor.core.publisher.Mono

/**
 * 邀请应用服务
 */
@Service
class InviteApplicationService(
    private val inviteService: InviteService
) {

    /**
     * 创建邀请链接
     */
    fun createInviteLink(userId: Long, request: CreateInviteLinkRequest): Mono<InviteLinkVO> {

        val permissions = request.permissions.map {
            InvitePermission(
                targetId = it.targetId,
                targetType = TargetType.valueOf(it.targetType),
                roleId = it.roleId,
                roleName = it.roleName
            )
        }

        return inviteService.createInviteLink(
            creatorId = userId,
            projectId = request.projectId,
            validDays = request.validDays,
            maxUsageCount = request.maxUsageCount,
            permissions = permissions
        ).map { convertToInviteLinkVO(it) }
    }

    /**
     * 验证并使用邀请链接
     */
    fun validateAndUseInviteLink(code: String): Mono<InviteResultVO> {

        return inviteService.validateAndUseInviteLink(code)
            .map { result ->
                InviteResultVO(
                    success = result.success,
                    message = result.message,
                    inviteLink = result.inviteLink?.let { convertToInviteLinkVO(it) }
                )
            }
    }

    /**
     * 获取用户创建的所有邀请链接
     */
    fun getInviteLinksByCreator(userId: Long): Mono<InviteLinkVO> {

        return inviteService.getInviteLinksByCreator(userId)
            .map { convertToInviteLinkVO(it) }
    }

    /**
     * 获取项目的所有邀请链接
     */
    fun getInviteLinksByProject(projectId: Long): Mono<InviteLinkVO> {

        return inviteService.getInviteLinksByProject(projectId)
            .map { convertToInviteLinkVO(it) }
    }

    /**
     * 禁用邀请链接
     */
    fun disableInviteLink(id: Long): Mono<Void> {

        return inviteService.disableInviteLink(id)
    }

    /**
     * 转换为邀请链接视图对象
     */
    private fun convertToInviteLinkVO(inviteLink: InviteLink): InviteLinkVO {
        return InviteLinkVO(
            id = inviteLink.id,
            code = inviteLink.code,
            url = inviteLink.code,
            expireAt = inviteLink.expireAt,
            maxUsageCount = inviteLink.maxUsageCount,
            usedCount = inviteLink.usedCount,
            permissions = inviteLink.permissions.map {
                InvitePermissionVO(
                    targetId = it.targetId,
                    targetType = it.targetType.name,
                    roleId = it.roleId,
                    roleName = it.roleName
                )
            },
            createdAt = inviteLink.createdAt
        )
    }
}