package com.task.domain.service

import com.task.domain.model.common.ComparisonOperator
import com.task.domain.model.common.desc
import com.task.domain.model.common.fieldOf
import com.task.domain.model.task.requirementconversationlist.RequirementConversationList
import com.task.domain.repository.RequirementConversationListRepository
import reactor.core.publisher.Flux
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
    fun create(projectId: Long? = null): Mono<Long> {
        log.info("创建需求对话列表基础记录, projectId={}", projectId)
        return requirementConversationListRepository.save(RequirementConversationList.create(projectId))
            .map { saved ->
                saved.id ?: throw IllegalStateException("创建需求对话列表基础记录失败：ID为空")
            }
    }

    /**
     * 根据ID获取基础会话记录
     */
    fun getById(id: Long): Mono<RequirementConversationList> {
        return requirementConversationListRepository.findById(id)
    }

    /**
     * 查询项目下的全部会话锚点
     */
    fun listByProjectId(projectId: Long): Flux<RequirementConversationList> {
        log.info("查询项目会话列表, projectId={}", projectId)
        return requirementConversationListRepository.list<RequirementConversationList> {
            fieldOf(RequirementConversationList::projectId, ComparisonOperator.EQUALS, projectId)
            orderBy(desc(RequirementConversationList::createdAt))
        }
    }
}
