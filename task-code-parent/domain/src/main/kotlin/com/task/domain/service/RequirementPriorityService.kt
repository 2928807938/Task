package com.task.domain.service

import com.task.domain.model.task.requirementconversationlist.RequirementConversation
import com.task.domain.model.task.requirementpriority.Factors
import com.task.domain.model.task.requirementpriority.PriorityDetails
import com.task.domain.model.task.requirementpriority.RequirementPriority
import com.task.domain.model.task.requirementpriority.Scheduling
import com.task.domain.repository.RequirementConversationRepository
import com.task.domain.repository.RequirementPriorityRepository
import org.slf4j.LoggerFactory
import org.springframework.stereotype.Service
import reactor.core.publisher.Mono

/**
 * 需求优先级服务
 * 负责处理需求优先级领域模型的业务逻辑
 */
@Service
class RequirementPriorityService(
    private val requirementPriorityRepository: RequirementPriorityRepository,
    private val requirementConversationRepository: RequirementConversationRepository
) {
    private val log = LoggerFactory.getLogger(this::class.java)

    /**
     * 根据ID获取需求优先级
     */
    fun getById(id: Long): Mono<RequirementPriority> {
        log.info("根据ID获取需求优先级, id={}", id)
        return requirementPriorityRepository.findById(id)
    }

    /**
     * 创建需求优先级
     * 
     * @param priority 优先级详情
     * @param scheduling 排期信息
     * @param factors 因素信息
     * @param justification 优先级理由
     * @param conversationList 需要关联的对话列表，若为null则不关联
     * @return 根据conversationList参数，返回创建的需求优先级或更新后的对话列表
     */
    fun create(
        priority: PriorityDetails,
        scheduling: Scheduling,
        factors: Factors,
        justification: String?,
        conversationList: RequirementConversation? = null
    ): Mono<Any> {
        // 创建需求优先级
        val requirementPriority = RequirementPriority.create(
            priority,
            scheduling,
            factors,
            justification
        )
        
        // 如果没有提供对话列表，则只保存并返回需求优先级
        if (conversationList == null) {
            return requirementPriorityRepository.save(requirementPriority) .map { it as Any }
        }
        
        // 如果提供了对话列表，则关联需求优先级到对话列表
        log.info("创建需求优先级并关联到对话列表, conversationListId={}",
            conversationList.id)
        
        return requirementPriorityRepository.save(requirementPriority)
            .flatMap { savedPriority ->
                log.info("已创建需求优先级，id={}", savedPriority.id)
                val updatedList = conversationList.linkRequirementPriority(savedPriority.id!!)
                requirementConversationRepository.update(updatedList)
            } .map { it as Any }
    }

   /**
     * 更新需求优先级
     *
     * @param id 需求优先级ID
     * @param priority 优先级详情
     * @param scheduling 排期信息
     * @param factors 因素信息
     * @param justification 优先级理由
     * @param conversationList 需要关联的对话列表，若为null则不关联
     * @return 根据conversationList参数，返回更新的需求优先级或更新后的对话列表
     */
    @Suppress("UNCHECKED_CAST")
    fun update(
        id: Long,
        priority: PriorityDetails,
        scheduling: Scheduling,
        factors: Factors,
        justification: String?,
        conversationList: RequirementConversation? = null
    ): Mono<Any> {
        log.info("更新需求优先级, id={}", id)
        return requirementPriorityRepository.findById(id)
            .flatMap { requirementPriority ->
                val updated = requirementPriority.update(
                    priority,
                    scheduling,
                    factors,
                    justification
                )
                // 如果没有提供对话列表，则只更新并返回需求优先级
                if (conversationList == null) {
                    return@flatMap requirementPriorityRepository.update(updated) as Mono<Any>
                }

                // 如果提供了对话列表，则关联需求优先级到对话列表
                log.info("更新需求优先级并关联到对话列表, conversationListId={}", conversationList.id)
                requirementPriorityRepository.update(updated)
                    .flatMap { updatedPriority ->
                        log.info("已更新需求优先级，id={}", updatedPriority.id)
                        val updatedList = conversationList.linkRequirementPriority(updatedPriority.id!!)
                        requirementConversationRepository.update(updatedList)
                    } as Mono<Any>
            }
    }

    /**
     * 删除需求优先级
     */
    fun delete(id: Long): Mono<Void> {
        log.info("删除需求优先级, id={}", id)
        return requirementPriorityRepository.delete(id)
    }
} 