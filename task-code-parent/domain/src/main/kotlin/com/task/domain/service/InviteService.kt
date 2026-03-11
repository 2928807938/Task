package com.task.domain.service

import com.task.domain.model.common.ComparisonOperator
import com.task.domain.model.common.fieldOf
import com.task.domain.model.invite.InviteLink
import com.task.domain.model.invite.InvitePermission
import com.task.domain.model.invite.InviteResult
import com.task.domain.repository.InviteLinkRepository
import org.slf4j.LoggerFactory
import org.springframework.stereotype.Service
import reactor.core.publisher.Mono
import java.util.*

/**
 * 邀请领域服务
 */
@Service
class InviteService(
    private val inviteLinkRepository: InviteLinkRepository
) {
    
    private val logger = LoggerFactory.getLogger(InviteService::class.java)

    fun createInviteLink(creatorId: Long, projectId: Long?, validDays: Int,
                                  maxUsageCount: Int?, permissions: List<InvitePermission>): Mono<InviteLink> {

        // 生成唯一代码
        val code = UUID.randomUUID().toString().replace("-", "").substring(0, 8)

        val inviteLink = if (validDays == 7 && maxUsageCount == null) {
            InviteLink.createStandard(code, creatorId, projectId, permissions)
        } else {
            InviteLink.createCustom(code, creatorId, projectId, validDays, maxUsageCount, permissions)
        }

        return inviteLinkRepository.save(inviteLink)
    }

    fun validateAndUseInviteLink(code: String): Mono<InviteResult> {

        return inviteLinkRepository.findOne {
            fieldOf(InviteLink::code, ComparisonOperator.EQUALS, code)
        }
            .switchIfEmpty(Mono.just(InviteResult(
                success = false,
                message = "邀请链接不存在"
            )).flatMap { Mono.error(IllegalArgumentException("邀请链接不存在")) })
            .flatMap { inviteLink ->
                if (!inviteLink.isValid()) {
                    logger.warn("Invite link is invalid: $code")
                    return@flatMap Mono.just(InviteResult(
                        success = false,
                        message = "邀请链接已过期或已达到使用上限"
                    ))
                }

                val updatedInviteLink = inviteLink.use()
                inviteLinkRepository.save(updatedInviteLink)
                    .map { savedLink ->
                        InviteResult(
                            success = true,
                            message = "邀请链接使用成功",
                            inviteLink = savedLink
                        )
                    }
            }
            .onErrorResume { e ->
                logger.error("Error validating invite link: ${e.message}")
                Mono.just(InviteResult(
                    success = false,
                    message = "邀请链接验证失败: ${e.message}"
                ))
            }
    }

    fun getInviteLinksByCreator(creatorId: Long): Mono<InviteLink> {
        return inviteLinkRepository.findOne{
            fieldOf(InviteLink::creatorId, ComparisonOperator.EQUALS, creatorId)
        }
    }

    fun getInviteLinksByProject(projectId: Long): Mono<InviteLink> {
        return inviteLinkRepository.findOne{
            fieldOf(InviteLink::projectId, ComparisonOperator.EQUALS, projectId)
        }
    }

    fun disableInviteLink(id: Long): Mono<Void> {
        return inviteLinkRepository.delete(id)
    }
}