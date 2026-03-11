package com.task.domain.service

import com.task.domain.model.task.requirementconversationlist.RequirementConversationList
import com.task.domain.repository.RequirementConversationListRepository
import org.slf4j.LoggerFactory
import org.springframework.stereotype.Service
import reactor.core.publisher.Mono

/**
 * 需求对话列表基础服务
 */
@Service
class RequirementConversationListService(
    private val requirementConversationListRepository: RequirementConversationListRepository
) {
    private val log = LoggerFactory.getLogger(this::class.java)

    /**
     * 创建基础对话列表记录，仅返回ID
     */
    fun create(): Mono<Long> {
        log.info("创建需求对话列表基础记录")
        return requirementConversationListRepository.save(RequirementConversationList.create())
            .map { saved ->
                saved.id ?: throw IllegalStateException("创建需求对话列表基础记录失败：ID为空")
            }
    }
}
