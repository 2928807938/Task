package com.task.application.service

import com.task.domain.service.ProjectService
import com.task.domain.service.RequirementConversationListService
import org.springframework.stereotype.Service
import reactor.core.publisher.Mono

/**
 * 需求对话列表基础应用服务
 */
@Service
class RequirementConversationListApplicationService(
    private val requirementConversationListService: RequirementConversationListService,
    private val projectService: ProjectService
) {
    /**
     * 创建基础对话列表记录，仅返回ID
     */
    fun create(projectId: Long): Mono<Long> {
        return projectService.findById(projectId)
            .switchIfEmpty(Mono.error(IllegalArgumentException("项目不存在，ID: $projectId")))
            .flatMap { requirementConversationListService.create(projectId) }
    }
}
