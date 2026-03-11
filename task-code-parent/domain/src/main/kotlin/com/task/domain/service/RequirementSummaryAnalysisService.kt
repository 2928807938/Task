package com.task.domain.service

import com.task.domain.model.task.requirementconversationlist.RequirementConversation
import com.task.domain.model.task.requirementsummaryanalysis.RequirementSummaryAnalysis
import com.task.domain.model.task.requirementsummaryanalysis.Summary
import com.task.domain.model.task.requirementsummaryanalysis.TaskArrangement
import com.task.domain.repository.RequirementConversationRepository
import com.task.domain.repository.RequirementSummaryAnalysisRepository
import org.slf4j.LoggerFactory
import org.springframework.stereotype.Service
import reactor.core.publisher.Mono

/**
 * 需求摘要分析服务
 * 负责处理需求摘要分析领域模型的业务逻辑
 */
@Service
class RequirementSummaryAnalysisService(
    private val requirementSummaryAnalysisRepository: RequirementSummaryAnalysisRepository,
    private val requirementConversationRepository: RequirementConversationRepository
) {
    private val log = LoggerFactory.getLogger(this::class.java)

    /**
     * 根据ID获取需求摘要分析
     */
    fun getById(id: Long): Mono<RequirementSummaryAnalysis> {
        log.info("根据ID获取需求摘要分析, id={}", id)
        return requirementSummaryAnalysisRepository.findById(id)
    }

    /**
     * 创建需求摘要分析
     * 
     * @param summary 摘要信息
     * @param taskArrangement 任务安排
     * @param conversationList 需要关联的对话列表，若为null则不关联
     * @return 根据conversationList参数，返回创建的需求摘要分析或更新后的对话列表
     */
    fun create(
        summary: Summary,
        taskArrangement: TaskArrangement,
        conversationList: RequirementConversation? = null
    ): Mono<Any> {
        // 创建需求摘要分析
        val requirementSummaryAnalysis = RequirementSummaryAnalysis.create(
            summary,
            taskArrangement
        )
        
        // 如果没有提供对话列表，则只保存并返回需求摘要分析
        if (conversationList == null) {
            return requirementSummaryAnalysisRepository.save(requirementSummaryAnalysis) .map { it as Any }
        }
        
        // 如果提供了对话列表，则关联需求摘要分析到对话列表
        log.info("创建需求摘要分析并关联到对话列表, conversationListId={}",
            conversationList.id)
        
        return requirementSummaryAnalysisRepository.save(requirementSummaryAnalysis)
            .flatMap { savedSummaryAnalysis ->
                log.info("已创建需求摘要分析，id={}", savedSummaryAnalysis.id)
                val updatedList = conversationList.linkRequirementSummaryAnalysis(savedSummaryAnalysis.id!!)
                requirementConversationRepository.update(updatedList)
            } .map { it as Any }
    }

   /**
     * 更新需求摘要分析
     *
     * @param id 需求摘要分析ID
     * @param summary 摘要信息
     * @param taskArrangement 任务安排
     * @param conversationList 需要关联的对话列表，若为null则不关联
     * @return 根据conversationList参数，返回更新的需求摘要分析或更新后的对话列表
     */
    fun update(
        id: Long,
        summary: Summary,
        taskArrangement: TaskArrangement,
        conversationList: RequirementConversation? = null
    ): Mono<Any> {
        log.info("更新需求摘要分析, id={}", id)
        return requirementSummaryAnalysisRepository.findById(id)
            .flatMap { requirementSummaryAnalysis ->
                val updated = requirementSummaryAnalysis.update(summary, taskArrangement)
                // 如果没有提供对话列表，则只更新并返回需求摘要分析
                if (conversationList == null) {
                    return@flatMap requirementSummaryAnalysisRepository.update(updated) .map { it as Any }
                }

                // 如果提供了对话列表，则关联需求摘要分析到对话列表
                log.info("更新需求摘要分析并关联到对话列表, conversationListId={}", conversationList.id)
                requirementSummaryAnalysisRepository.update(updated)
                    .flatMap { updatedSummaryAnalysis ->
                        log.info("已更新需求摘要分析，id={}", updatedSummaryAnalysis.id)
                        val updatedList = conversationList.linkRequirementSummaryAnalysis(updatedSummaryAnalysis.id!!)
                        requirementConversationRepository.update(updatedList)
                    } .map { it as Any }
            }
    }

    /**
     * 删除需求摘要分析
     */
    fun delete(id: Long): Mono<Void> {
        log.info("删除需求摘要分析, id={}", id)
        return requirementSummaryAnalysisRepository.delete(id)
    }
} 