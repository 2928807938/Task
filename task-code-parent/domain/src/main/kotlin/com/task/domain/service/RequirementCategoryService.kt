package com.task.domain.service

import com.task.domain.model.task.requirementcategory.RequirementCategory
import com.task.domain.model.task.requirementconversationlist.RequirementConversation
import com.task.domain.repository.RequirementCategoryRepository
import com.task.domain.repository.RequirementConversationRepository
import org.slf4j.LoggerFactory
import org.springframework.stereotype.Service
import reactor.core.publisher.Mono

/**
 * 需求分类服务
 * 负责处理需求分类领域模型的业务逻辑
 */
@Service
class RequirementCategoryService(
    private val requirementCategoryRepository: RequirementCategoryRepository,
    private val requirementConversationRepository: RequirementConversationRepository
) {
    private val log = LoggerFactory.getLogger(this::class.java)

    /**
     * 根据ID获取需求分类
     */
    fun getById(id: Long): Mono<RequirementCategory> {
        log.info("根据ID获取需求分类, id={}", id)
        return requirementCategoryRepository.findById(id)
    }

    /**
     * 创建需求分类
     * 
     * @param tags 标签列表
     * @param colors 颜色列表
     * @param conversationList 需要关联的对话列表，若为null则不关联
     * @return 根据conversationList参数，返回创建的需求分类或更新后的对话列表
     */
    @Suppress("UNCHECKED_CAST")
    fun create(
        tags: List<String>,
        colors: List<String>,
        conversationList: RequirementConversation? = null
    ): Mono<Any> {
        // 创建需求分类
        val category = RequirementCategory.create(tags, colors)
        
        // 如果没有提供对话列表，则只保存并返回需求分类
        if (conversationList == null) {
            log.info("创建需求分类, tags={}, colors={}", tags, colors)
            return requirementCategoryRepository.save(category) as Mono<Any>
        }
        
        // 如果提供了对话列表，则关联分类到对话列表
        log.info("创建需求分类并关联到对话列表, conversationListId={}, tags={}, colors={}", 
            conversationList.id, tags, colors)
        
        return requirementCategoryRepository.save(category)
            .flatMap { savedCategory ->
                log.info("已创建需求分类，id={}", savedCategory.id)
                val updatedList = conversationList.linkRequirementCategory(savedCategory.id!!)
                requirementConversationRepository.update(updatedList)
            } as Mono<Any>
    }

    /**
     * 更新需求分类
     * 
     * @param id 需求分类ID
     * @param tags 标签列表
     * @param colors 颜色列表
     * @param conversationList 需要关联的对话列表，若为null则不关联
     * @return 根据conversationList参数，返回更新的需求分类或更新后的对话列表
     */
    @Suppress("UNCHECKED_CAST")
    fun update(
        id: Long, 
        tags: List<String>, 
        colors: List<String>, 
        conversationList: RequirementConversation? = null
    ): Mono<Any> {
        log.info("更新需求分类, id={}, tags={}, colors={}", id, tags, colors)
        return requirementCategoryRepository.findById(id)
            .flatMap { category ->
                val updated = category.update(tags, colors)
                // 如果没有提供对话列表，则只更新并返回需求分类
                if (conversationList == null) {
                    return@flatMap requirementCategoryRepository.update(updated) as Mono<Any>
                }
                
                // 如果提供了对话列表，则关联分类到对话列表
                log.info("更新需求分类并关联到对话列表, conversationListId={}", conversationList.id)
                requirementCategoryRepository.update(updated)
                    .flatMap { updatedCategory ->
                        log.info("已更新需求分类，id={}", updatedCategory.id)
                        val updatedList = conversationList.linkRequirementCategory(updatedCategory.id!!)
                        requirementConversationRepository.update(updatedList)
                    } as Mono<Any>
            }
    }

    /**
     * 删除需求分类
     */
    fun delete(id: Long): Mono<Void> {
        log.info("删除需求分类, id={}", id)
        return requirementCategoryRepository.delete(id)
    }
} 