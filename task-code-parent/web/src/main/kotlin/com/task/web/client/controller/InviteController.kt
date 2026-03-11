package com.task.web.client.controller

import com.task.application.service.InviteApplicationService
import com.task.application.vo.*
import org.slf4j.LoggerFactory
import org.springframework.web.bind.annotation.*
import reactor.core.publisher.Mono

/**
 * 邀请控制器
 * TODO 待调试
 */
@RestController
@RequestMapping("/api/invites")
class InviteController(
    private val inviteApplicationService: InviteApplicationService
) {

    private val logger = LoggerFactory.getLogger(InviteController::class.java)

    /**
     * 创建邀请链接
     */
    @PostMapping
    fun createInviteLink(@RequestAttribute("userId") userId: Long,
                         @RequestBody request: CreateInviteLinkRequest): Mono<InviteLinkVO> {
        return inviteApplicationService.createInviteLink(userId, request)
    }

    /**
     * 验证并使用邀请链接
     */
    @PostMapping("/validate/{code}")
    fun validateAndUseInviteLink(@PathVariable code: String): Mono<InviteResultVO> {
        return inviteApplicationService.validateAndUseInviteLink(code)
    }

    /**
     * 获取用户创建的所有邀请链接
     */
    @GetMapping
    fun getInviteLinksByCreator(@RequestAttribute("userId") userId: Long): Mono<InviteLinkVO> {
        return inviteApplicationService.getInviteLinksByCreator(userId)
    }

    /**
     * 获取项目的所有邀请链接
     */
    @GetMapping("/project/{projectId}")
    fun getInviteLinksByProject(@PathVariable projectId: Long): Mono<InviteLinkVO> {
        return inviteApplicationService.getInviteLinksByProject(projectId)
    }

    /**
     * 禁用邀请链接
     */
    @DeleteMapping("/{id}")
    fun disableInviteLink(@PathVariable id: Long): Mono<Void> {
        return inviteApplicationService.disableInviteLink(id)
    }

    /**
     * 获取邀请链接信息（用于访问邀请链接时）
     */
    @GetMapping("/{code}")
    fun getInviteLinkInfo(@PathVariable code: String): Mono<InviteResultVO> {
        return inviteApplicationService.validateAndUseInviteLink(code)
            .map { result ->
                // 仅获取信息，不增加使用计数
                if (result.inviteLink != null) {
                    result.copy(success = true, message = "邀请链接有效")
                } else {
                    result
                }
            }
    }
}