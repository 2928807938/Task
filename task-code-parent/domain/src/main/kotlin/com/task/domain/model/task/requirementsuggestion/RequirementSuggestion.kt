package com.task.domain.model.task.requirementsuggestion

import java.time.OffsetDateTime

/**
 * 需求智能建议领域模型
 * 存储系统为需求提供的智能建议
 */
data class RequirementSuggestion(
    /**
     * 唯一标识
     */
    val id: Long?,
    
    /**
     * 关联到需求的ID
     */
    val requirementId: Long?,
    
    /**
     * 建议列表，存储为JSON格式
     */
    val suggestions: List<Suggestion>,
    
    /**
     * 是否删除
     */
    val deleted: Int = 0,
    
    /**
     * 创建时间
     */
    val createdAt: OffsetDateTime,
    
    /**
     * 最后更新时间
     */
    val updatedAt: OffsetDateTime?,
    
    /**
     * 乐观锁版本号
     */
    val version: Int = 0
) {
    companion object {
        /**
         * 创建新的需求智能建议
         */
        fun create(
            suggestions: List<Suggestion> = emptyList()
        ): RequirementSuggestion {
            val now = OffsetDateTime.now()
            return RequirementSuggestion(
                id = null,
                requirementId = null,
                suggestions = suggestions,
                deleted = 0,
                createdAt = now,
                updatedAt = now,
                version = 0
            )
        }
    }
    
    /**
     * 更新建议列表
     */
    fun update(suggestions: List<Suggestion>): RequirementSuggestion {
        return this.copy(
            suggestions = suggestions,
            updatedAt = OffsetDateTime.now()
        )
    }
    
    /**
     * 添加建议
     */
    fun addSuggestion(suggestion: Suggestion): RequirementSuggestion {
        val updatedSuggestions = this.suggestions.toMutableList()
        updatedSuggestions.add(suggestion)
        
        return this.copy(
            suggestions = updatedSuggestions,
            updatedAt = OffsetDateTime.now()
        )
    }
    
    /**
     * 移除建议
     */
    fun removeSuggestionByType(type: String): RequirementSuggestion {
        val updatedSuggestions = this.suggestions.filter { it.type != type }
        
        return this.copy(
            suggestions = updatedSuggestions,
            updatedAt = OffsetDateTime.now()
        )
    }
} 