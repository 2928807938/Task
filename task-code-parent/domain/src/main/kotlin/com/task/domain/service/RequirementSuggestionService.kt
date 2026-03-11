package com.task.domain.service

import com.task.domain.model.task.requirementconversationlist.RequirementConversation
import com.task.domain.model.task.requirementsuggestion.RequirementSuggestion
import com.task.domain.model.task.requirementsuggestion.Suggestion
import com.task.domain.repository.RequirementConversationRepository
import com.task.domain.repository.RequirementSuggestionRepository
import org.slf4j.LoggerFactory
import org.springframework.stereotype.Service
import reactor.core.publisher.Mono

/**
 * 需求智能建议服务
 * 负责处理需求智能建议领域模型的业务逻辑
 */
@Service
class RequirementSuggestionService(
    private val requirementSuggestionRepository: RequirementSuggestionRepository,
    private val requirementConversationRepository: RequirementConversationRepository
) {
    private val log = LoggerFactory.getLogger(this::class.java)

    /**
     * 根据ID获取需求智能建议
     */
    fun getById(id: Long): Mono<RequirementSuggestion> {
        log.info("根据ID获取需求智能建议, id={}", id)
        return requirementSuggestionRepository.findById(id)
    }

    /**
     * 创建需求智能建议
     * 
     * @param suggestions 建议列表
     * @param conversationList 需要关联的对话列表，若为null则不关联
     * @return 根据conversationList参数，返回创建的需求智能建议或更新后的对话列表
     */
    fun create(
        suggestions: List<Suggestion>,
        conversationList: RequirementConversation? = null
    ): Mono<Any> {
        // 创建需求智能建议
        val requirementSuggestion = RequirementSuggestion.create(suggestions)
        
        // 如果没有提供对话列表，则只保存并返回需求智能建议
        if (conversationList == null) {
            return requirementSuggestionRepository.save(requirementSuggestion) .map { it as Any }
        }
        
        // 如果提供了对话列表，则关联需求智能建议到对话列表
        log.info("创建需求智能建议并关联到对话列表, conversationListId={}",
            conversationList.id)
        
        return requirementSuggestionRepository.save(requirementSuggestion)
            .flatMap { savedSuggestion ->
                log.info("已创建需求智能建议，id={}", savedSuggestion.id)
                val updatedList = conversationList.linkRequirementSuggestion(savedSuggestion.id!!)
                requirementConversationRepository.update(updatedList)
            } .map { it as Any }
    }

   /**
     * 更新需求智能建议
     *
     * @param id 需求智能建议ID
     * @param suggestions 建议列表
     * @param conversationList 需要关联的对话列表，若为null则不关联
     * @return 根据conversationList参数，返回更新的需求智能建议或更新后的对话列表
     */
    fun update(
        id: Long,
        suggestions: List<Suggestion>,
        conversationList: RequirementConversation? = null
    ): Mono<Any> {
        log.info("更新需求智能建议, id={}", id)
        return requirementSuggestionRepository.findById(id)
            .flatMap { requirementSuggestion ->
                val updated = requirementSuggestion.update(suggestions)
                // 如果没有提供对话列表，则只更新并返回需求智能建议
                if (conversationList == null) {
                    return@flatMap requirementSuggestionRepository.update(updated) .map { it as Any }
                }

                // 如果提供了对话列表，则关联需求智能建议到对话列表
                log.info("更新需求智能建议并关联到对话列表, conversationListId={}", conversationList.id)
                requirementSuggestionRepository.update(updated)
                    .flatMap { updatedSuggestion ->
                        log.info("已更新需求智能建议，id={}", updatedSuggestion.id)
                        val updatedList = conversationList.linkRequirementSuggestion(updatedSuggestion.id!!)
                        requirementConversationRepository.update(updatedList)
                    } .map { it as Any }
            }
    }

    /**
     * 删除需求智能建议
     */
    fun delete(id: Long): Mono<Void> {
        log.info("删除需求智能建议, id={}", id)
        return requirementSuggestionRepository.delete(id)
    }
} 