package com.task.domain.service

import com.task.domain.model.task.requirementcompleteness.Aspect
import com.task.domain.model.task.requirementcompleteness.OptimizationSuggestion
import com.task.domain.model.task.requirementcompleteness.RequirementCompleteness
import com.task.domain.model.task.requirementconversationlist.RequirementConversation
import com.task.domain.repository.RequirementCompletenessRepository
import com.task.domain.repository.RequirementConversationRepository
import org.slf4j.LoggerFactory
import org.springframework.stereotype.Service
import reactor.core.publisher.Mono

/**
 * 需求完整度检查服务
 * 负责处理需求完整度检查领域模型的业务逻辑
 */
@Service
class RequirementCompletenessService(
    private val requirementCompletenessRepository: RequirementCompletenessRepository,
    private val requirementConversationRepository: RequirementConversationRepository
) {
    private val log = LoggerFactory.getLogger(this::class.java)

    /**
     * 根据ID获取需求完整度检查
     */
    fun getById(id: Long): Mono<RequirementCompleteness> {
        log.info("根据ID获取需求完整度检查, id={}", id)
        return requirementCompletenessRepository.findById(id)
    }

    /**
     * 创建需求完整度检查
     * 
     * @param overallCompleteness 总体完整度
     * @param aspects 各方面完整度
     * @param optimizationSuggestions 优化建议
     * @param conversationList 需要关联的对话列表，若为null则不关联
     * @return 根据conversationList参数，返回创建的完整度检查或更新后的对话列表
     */
    fun create(
        overallCompleteness: String,
        aspects: List<Aspect>?,
        optimizationSuggestions: List<OptimizationSuggestion>?,
        conversationList: RequirementConversation? = null
    ): Mono<Any> {
        // 创建需求完整度检查
        val completeness = RequirementCompleteness.create(
            overallCompleteness,
            aspects,
            optimizationSuggestions
        )
        
        // 如果没有提供对话列表，则只保存并返回需求完整度检查
        if (conversationList == null) {
            log.info("创建需求完整度检查， overallCompleteness={}", overallCompleteness)
            return requirementCompletenessRepository.save(completeness).map { it as Any }
        }
        
        // 如果提供了对话列表，则关联需求完整度检查到对话列表
        log.info("创建需求完整度检查并关联到对话列表, conversationListId={}",
            conversationList.id)
        
        return requirementCompletenessRepository.save(completeness)
            .flatMap { savedCompleteness ->
                log.info("已创建需求完整度检查，id={}", savedCompleteness.id)
                val updatedList = conversationList.linkRequirementCompleteness(savedCompleteness.id!!)
                requirementConversationRepository.update(updatedList)
            }
            .map { it as Any }
    }

/**
 * 更新需求完整度检查
 * 
 * @param id 需求完整度检查ID
 * @param overallCompleteness 总体完整度
 * @param aspects 各方面完整度
 * @param optimizationSuggestions 优化建议
 * @param conversationList 需要关联的对话列表，若为null则不关联
 * @return 根据conversationList参数，返回更新的需求完整度检查或更新后的对话列表
 */
fun update(
    id: Long,
    overallCompleteness: String,
    aspects: List<Aspect>?,
    optimizationSuggestions: List<OptimizationSuggestion>?,
    conversationList: RequirementConversation? = null
): Mono<Any> {
    log.info("更新需求完整度检查, id={}, overallCompleteness={}", id, overallCompleteness)
    return requirementCompletenessRepository.findById(id)
        .flatMap { completeness ->
            val updated = completeness.update(
                overallCompleteness,
                aspects,
                optimizationSuggestions
            )
            // 如果没有提供对话列表，则只更新并返回需求完整度检查
            if (conversationList == null) {
                return@flatMap requirementCompletenessRepository.update(updated) .map { it as Any }
            }
            
            // 如果提供了对话列表，则关联需求完整度检查到对话列表
            log.info("更新需求完整度检查并关联到对话列表, conversationListId={}", conversationList.id)
            requirementCompletenessRepository.update(updated)
                .flatMap { updatedCompleteness ->
                    log.info("已更新需求完整度检查，id={}", updatedCompleteness.id)
                    val updatedList = conversationList.linkRequirementCompleteness(updatedCompleteness.id!!)
                    requirementConversationRepository.update(updatedList)
                }
                .map { it as Any }
        }
}

    /**
     * 删除需求完整度检查
     */
    fun delete(id: Long): Mono<Void> {
        log.info("删除需求完整度检查, id={}", id)
        return requirementCompletenessRepository.delete(id)
    }
} 