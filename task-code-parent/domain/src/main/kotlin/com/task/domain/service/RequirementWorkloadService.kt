package com.task.domain.service

import com.task.domain.model.task.requirementconversationlist.RequirementConversation
import com.task.domain.model.task.requirementworkload.RequirementWorkload
import com.task.domain.repository.RequirementConversationRepository
import com.task.domain.repository.RequirementWorkloadRepository
import org.slf4j.LoggerFactory
import org.springframework.stereotype.Service
import reactor.core.publisher.Mono

/**
 * 需求工作量服务
 * 负责处理需求工作量领域模型的业务逻辑
 */
@Service
class RequirementWorkloadService(
    private val requirementWorkloadRepository: RequirementWorkloadRepository,
    private val requirementConversationRepository: RequirementConversationRepository
) {
    private val log = LoggerFactory.getLogger(this::class.java)

    /**
     * 根据ID获取需求工作量
     */
    fun getById(id: Long): Mono<RequirementWorkload> {
        log.info("根据ID获取需求工作量, id={}", id)
        return requirementWorkloadRepository.findById(id)
    }

    /**
     * 创建需求工作量
     * 
     * @param optimistic 乐观估计工作量
     * @param mostLikely 最可能工作量
     * @param pessimistic 悲观估计工作量
     * @param conversationList 需要关联的对话列表，若为null则不关联
     * @return 根据conversationList参数，返回创建的需求工作量或更新后的对话列表
     */
    fun create(
        optimistic: String,
        mostLikely: String,
        pessimistic: String,
        expected: String,
        standardDeviation: String,
        conversationList: RequirementConversation? = null
    ): Mono<Any> {
        // 创建需求工作量
        val requirementWorkload = RequirementWorkload.create(
            optimistic,
            mostLikely,
            pessimistic,
            expected,
            standardDeviation
        )
        
        // 如果没有提供对话列表，则只保存并返回需求工作量
        if (conversationList == null) {
            return requirementWorkloadRepository.save(requirementWorkload) .map { it as Any }
        }
        
        // 如果提供了对话列表，则关联需求工作量到对话列表
        log.info("创建需求工作量并关联到对话列表, conversationListId={}",
            conversationList.id)
        
        return requirementWorkloadRepository.save(requirementWorkload)
            .flatMap { savedWorkload ->
                log.info("已创建需求工作量，id={}", savedWorkload.id)
                val updatedList = conversationList.linkRequirementWorkload(savedWorkload.id!!)
                requirementConversationRepository.update(updatedList)
            } .map { it as Any }
    }

   /**
     * 更新需求工作量
     *
     * @param id 需求工作量ID
     * @param optimistic 乐观估计工作量
     * @param mostLikely 最可能工作量
     * @param pessimistic 悲观估计工作量
     * @param conversationList 需要关联的对话列表，若为null则不关联
     * @return 根据conversationList参数，返回更新的需求工作量或更新后的对话列表
     */
    fun update(
        id: Long,
        optimistic: String,
        mostLikely: String,
        pessimistic: String,
        expected: String,
        standardDeviation: String,
        conversationList: RequirementConversation? = null
    ): Mono<Any> {
        log.info("更新需求工作量, id={}", id)
        return requirementWorkloadRepository.findById(id)
            .flatMap { requirementWorkload ->
                val updated = requirementWorkload.update(
                    optimistic,
                    mostLikely,
                    pessimistic,
                    expected,
                    standardDeviation
                )
                // 如果没有提供对话列表，则只更新并返回需求工作量
                if (conversationList == null) {
                    return@flatMap requirementWorkloadRepository.update(updated) .map { it as Any }
                }

                // 如果提供了对话列表，则关联需求工作量到对话列表
                log.info("更新需求工作量并关联到对话列表, conversationListId={}", conversationList.id)
                requirementWorkloadRepository.update(updated)
                    .flatMap { updatedWorkload ->
                        log.info("已更新需求工作量，id={}", updatedWorkload.id)
                        val updatedList = conversationList.linkRequirementWorkload(updatedWorkload.id!!)
                        requirementConversationRepository.update(updatedList)
                    } .map { it as Any }
            }
    }

    /**
     * 删除需求工作量
     */
    fun delete(id: Long): Mono<Void> {
        log.info("删除需求工作量, id={}", id)
        return requirementWorkloadRepository.delete(id)
    }
} 