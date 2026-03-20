package com.task.web.client.controller

import com.task.application.request.CreateRequirementConversationListRequest
import com.task.application.service.RequirementConversationListApplicationService
import com.task.shared.api.response.ApiResponse
import jakarta.validation.Valid
import org.springframework.web.bind.annotation.RequestBody
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
     * 创建需求对话列表基础记录
     * 必须传入项目ID
     *
     * @return 新创建记录的ID
     */
    @PostMapping("/create")
    fun create(
        @RequestBody @Valid request: CreateRequirementConversationListRequest
    ): Mono<ApiResponse<String>> {
        return requirementConversationListApplicationService.create(request.projectId)
            .map { id -> ApiResponse.success(id.toString()) }
    }
}
