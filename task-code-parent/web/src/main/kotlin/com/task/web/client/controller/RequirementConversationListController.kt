package com.task.web.client.controller

import com.task.application.service.RequirementConversationListApplicationService
import com.task.shared.api.response.ApiResponse
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController
import reactor.core.publisher.Mono

/**
 * 需求对话列表基础控制器
 * 提供仅创建ID的接口
 */
@RestController
@RequestMapping("/api/client/requirement-conversation-list")
class RequirementConversationListController(
    private val requirementConversationListApplicationService: RequirementConversationListApplicationService
) {
    /**
     * 创建需求对话列表基础记录（无请求体）
     *
     * @return 新创建记录的ID
     */
    @PostMapping("/create")
    fun create(): Mono<ApiResponse<String>> {
        return requirementConversationListApplicationService.create()
            .map { id -> ApiResponse.success(id.toString()) }
    }
}
