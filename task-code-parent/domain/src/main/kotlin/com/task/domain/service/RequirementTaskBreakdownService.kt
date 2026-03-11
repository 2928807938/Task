package com.task.domain.service

import com.task.domain.model.task.requirementconversationlist.RequirementConversation
import com.task.domain.model.task.requirementtaskbreakdown.RequirementTaskBreakdown
import com.task.domain.model.task.requirementtaskbreakdown.SubTask
import com.task.domain.repository.RequirementConversationRepository
import com.task.domain.repository.RequirementTaskBreakdownRepository
import org.slf4j.LoggerFactory
import org.springframework.stereotype.Service
import reactor.core.publisher.Mono

/**
 * 需求任务拆分服务
 * 负责处理需求任务拆分领域模型的业务逻辑
 */
@Service
class RequirementTaskBreakdownService(
    private val requirementTaskBreakdownRepository: RequirementTaskBreakdownRepository,
    private val requirementConversationRepository: RequirementConversationRepository
) {
    private val log = LoggerFactory.getLogger(this::class.java)

    /**
     * 根据ID获取需求任务拆分
     */
    fun getById(id: Long): Mono<RequirementTaskBreakdown> {
        log.info("根据ID获取需求任务拆分, id={}", id)
        return requirementTaskBreakdownRepository.findById(id)
    }

    /**
     * 创建需求任务拆分
     * 
     * @param mainTask 主任务描述
     * @param subTasks 子任务列表
     * @param parallelismScore 并行度评分
     * @param parallelExecutionTips 并行执行提示
     * @param conversationList 需要关联的对话列表，若为null则不关联
     * @return 根据conversationList参数，返回创建的需求任务拆分或更新后的对话列表
     */
    fun create(
        mainTask: String,
        subTasks: List<SubTask>,
        parallelismScore: Int?,
        parallelExecutionTips: String?,
        conversationList: RequirementConversation? = null
    ): Mono<Any> {
        // 创建需求任务拆分
        val requirementTaskBreakdown = RequirementTaskBreakdown.create(
            mainTask,
            subTasks,
            parallelismScore,
            parallelExecutionTips
        )
        
        // 如果没有提供对话列表，则只保存并返回需求任务拆分
        if (conversationList == null) {
            log.info("创建需求任务拆分, mainTask={}", mainTask)
            return requirementTaskBreakdownRepository.save(requirementTaskBreakdown) .map { it as Any }
        }
        
        // 如果提供了对话列表，则关联需求任务拆分到对话列表
        log.info("创建需求任务拆分并关联到对话列表, conversationListId={}",
            conversationList.id)
        
        return requirementTaskBreakdownRepository.save(requirementTaskBreakdown)
            .flatMap { savedTaskBreakdown ->
                log.info("已创建任务拆分，id={}", savedTaskBreakdown.id)
                val updatedList = conversationList.linkRequirementTaskBreakdown(savedTaskBreakdown.id!!)
                requirementConversationRepository.update(updatedList)
            } .map { it as Any }
    }

   /**
     * 更新需求任务拆分
     *
     * @param id 需求任务拆分ID
     * @param mainTask 主任务描述
     * @param subTasks 子任务列表
     * @param parallelismScore 并行度评分
     * @param parallelExecutionTips 并行执行提示
     * @param conversationList 需要关联的对话列表，若为null则不关联
     * @return 根据conversationList参数，返回更新的需求任务拆分或更新后的对话列表
     */
    fun update(
        id: Long,
        mainTask: String,
        subTasks: List<SubTask>,
        parallelismScore: Int?,
        parallelExecutionTips: String?,
        conversationList: RequirementConversation? = null
    ): Mono<Any> {
        log.info("更新需求任务拆分, id={}, mainTask={}", id, mainTask)
        return requirementTaskBreakdownRepository.findById(id)
            .flatMap { requirementTaskBreakdown ->
                val updated = requirementTaskBreakdown.update(
                    mainTask,
                    subTasks,
                    parallelismScore,
                    parallelExecutionTips
                )
                // 如果没有提供对话列表，则只更新并返回需求任务拆分
                if (conversationList == null) {
                    return@flatMap requirementTaskBreakdownRepository.update(updated) .map { it as Any }
                }

                // 如果提供了对话列表，则关联需求任务拆分到对话列表
                log.info("更新需求任务拆分并关联到对话列表, conversationListId={}", conversationList.id)
                requirementTaskBreakdownRepository.update(updated)
                    .flatMap { updatedTaskBreakdown ->
                        log.info("已更新需求任务拆分，id={}", updatedTaskBreakdown.id)
                        val updatedList = conversationList.linkRequirementTaskBreakdown(updatedTaskBreakdown.id!!)
                        requirementConversationRepository.update(updatedList)
                    } .map { it as Any }
            }
    }

    /**
     * 删除需求任务拆分
     */
    fun delete(id: Long): Mono<Void> {
        log.info("删除需求任务拆分, id={}", id)
        return requirementTaskBreakdownRepository.delete(id)
    }
} 