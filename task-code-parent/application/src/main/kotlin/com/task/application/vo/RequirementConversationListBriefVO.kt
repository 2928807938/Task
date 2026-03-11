package com.task.application.vo

import com.task.domain.model.task.requirementcategory.RequirementCategory
import com.task.domain.model.task.requirementconversationlist.RequirementConversation
import java.time.OffsetDateTime

/**
 * 需求对话列表简化视图对象
 * 只包含id, title, requirementCategoryId, tags, colors和创建时间等基本信息
 */
data class RequirementConversationListBriefVO(
    /**
     * 唯一标识
     */
    val id: Long,
    
    /**
     * 对话列表标题
     */
    val title: String,
    
    /**
     * 需求分类ID
     */
    val requirementCategoryId: Long?,
    
    /**
     * 标签数组
     */
    val tags: List<String> = emptyList(),
    
    /**
     * 颜色数组
     */
    val colors: List<String> = emptyList(),
    
    /**
     * 创建时间
     */
    val createdAt: OffsetDateTime
) {
    companion object {
        /**
         * 从领域模型转换为简化视图对象
         */
        fun fromDomain(
            conversationList: RequirementConversation,
            category: RequirementCategory? = null
        ): RequirementConversationListBriefVO {
            return RequirementConversationListBriefVO(
                id = conversationList.id!!,
                title = conversationList.title,
                requirementCategoryId = conversationList.requirementCategoryId,
                tags = category?.tags ?: emptyList(),
                colors = category?.colors ?: emptyList(),
                createdAt = conversationList.createdAt
            )
        }
    }
}

