package com.task.web.client.controller

import com.task.application.request.CreateRequirementConversationRequest
import com.task.application.vo.RequirementConversationHistoryBriefVO
import com.task.application.vo.RequirementConversationHistoryDetailVO
import com.task.application.service.RequirementConversationApplicationService
import com.task.application.vo.RequirementConversationListBriefVO
import com.task.application.vo.RequirementConversationListDetailedVO
import com.task.shared.api.response.ApiResponse
import jakarta.validation.Valid
import org.springframework.web.bind.annotation.*
import reactor.core.publisher.Flux
import reactor.core.publisher.Mono

/**
 * 需求对话列表控制器
 * 提供需求对话列表相关的API接口，包括需求对话列表的CRUD操作
 */
@RestController
@RequestMapping("/api/client/requirement-conversation")
class RequirementConversationController(
    private val requirementConversationApplicationService: RequirementConversationApplicationService
) {

    /**
     * 获取最近30天的需求对话列表
     *
     * @return 需求对话列表视图对象流
     */
    @GetMapping("/recent")
    fun listRecent(): Flux<RequirementConversationListBriefVO> {
        return requirementConversationApplicationService.listRecent()
    }

    /**
     * 查询项目下的历史会话列表
     */
    @GetMapping("/project/{projectId}/history")
    fun listProjectHistories(@PathVariable projectId: Long): Flux<RequirementConversationHistoryBriefVO> {
        return requirementConversationApplicationService.listProjectHistories(projectId)
    }

    /**
     * 根据会话锚点ID获取历史对话详情
     */
    @GetMapping("/history/{conversationListId}")
    fun getHistoryByConversationListId(
        @PathVariable conversationListId: Long
    ): Mono<ApiResponse<RequirementConversationHistoryDetailVO>> {
        return requirementConversationApplicationService.getHistoryByConversationListId(conversationListId)
            .map { ApiResponse.success(it) }
    }

    /**
     * 根据ID获取需求对话列表详情
     *
     * @param id 需求对话列表ID
     * @return 详细的需求对话列表视图对象
     */
    @GetMapping("/{id}")
    fun getById(@PathVariable id: Long): Mono<ApiResponse<RequirementConversationListDetailedVO>> {
        return requirementConversationApplicationService.getById(id)
            .map { ApiResponse.success(it) }
    }
    
    /**
     * 创建需求对话列表
     *
     * @param request 创建需求对话列表请求
     * @return 创建的需求对话列表ID
     */
    @PostMapping("/create")
    fun create(
        @RequestBody @Valid request: CreateRequirementConversationRequest
    ): Mono<ApiResponse<Long>> {
        return requirementConversationApplicationService.create(request)
            .map { id -> ApiResponse.success(id) }
    }
    
//    /**
//     * 更新需求对话列表
//     *
//     * @param id 需求对话列表ID
//     * @param request 更新需求对话列表请求
//     * @return 更新后的需求对话列表
//     */
//    @PostMapping("/{id}")
//    fun update(
//        @PathVariable id: Long,
//        @RequestBody @Valid request: UpdateRequirementConversationListRequest
//    ): Mono<ApiResponse<RequirementConversationListVO>> {
//        return requirementConversationApplicationService.update(id, request)
//            .then(Mono.fromCallable { ApiResponse.success() })
//    }
    
    /**
     * 删除需求对话列表
     *
     * @param id 需求对话列表ID
     * @return 无内容响应
     */
    @PostMapping("/{id}")
    fun delete(@PathVariable id: Long): Mono<ApiResponse<Void>> {
        return requirementConversationApplicationService.delete(id)
            .then(Mono.just(ApiResponse.success()))
    }
} 
