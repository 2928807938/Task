package com.task.domain.service

import com.task.domain.model.common.ComparisonOperator
import com.task.domain.model.common.asc
import com.task.domain.model.common.fieldOf
import com.task.domain.model.task.requirementconversationlist.RequirementConversationTurn
import com.task.domain.repository.RequirementConversationTurnRepository
import org.slf4j.LoggerFactory
import org.springframework.stereotype.Service
import reactor.core.publisher.Flux

/**
 * 需求会话回合服务
 */
@Service
class RequirementConversationTurnService(
    private val requirementConversationTurnRepository: RequirementConversationTurnRepository
) {
    private val log = LoggerFactory.getLogger(this::class.java)

    /**
     * 查询会话下的全部回合记录
     */
    fun listByConversationListId(conversationListId: Long): Flux<RequirementConversationTurn> {
        log.info("查询需求会话回合列表, conversationListId={}", conversationListId)
        return requirementConversationTurnRepository.list<RequirementConversationTurn> {
            fieldOf(RequirementConversationTurn::conversationListId, ComparisonOperator.EQUALS, conversationListId)
            orderBy(asc(RequirementConversationTurn::turnNo))
        }
    }
}
