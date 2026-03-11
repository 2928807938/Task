package com.task.application.service

import com.task.domain.service.RequirementConversationListService
import org.springframework.stereotype.Service
import reactor.core.publisher.Mono

/**
 * 需求对话列表基础应用服务
 */
@Service
class RequirementConversationListApplicationService(
    private val requirementConversationListService: RequirementConversationListService
) {
    /**
     * 创建基础对话列表记录，仅返回ID
     */
    fun create(): Mono<Long> {
        return requirementConversationListService.create()
    }
}
