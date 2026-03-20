package com.task.domain.model.task.requirementconversationlist

import java.time.OffsetDateTime

/**
 * 需求对话列表基础领域模型
 * 对应 t_requirement_conversation_list 表，仅包含基础审计字段
 */
data class RequirementConversationList(
    /**
     * 唯一标识
     */
    val id: Long?,

    /**
     * 所属项目ID
     */
    val projectId: Long? = null,

    /**
     * 逻辑删除标记
     */
    val deleted: Int = 0,

    /**
     * 创建时间
     */
    val createdAt: OffsetDateTime,

    /**
     * 更新时间
     */
    val updatedAt: OffsetDateTime?,

    /**
     * 乐观锁版本
     */
    val version: Int = 0
) {
    companion object {
        /**
         * 创建新的需求对话列表基础记录
         */
        fun create(projectId: Long? = null): RequirementConversationList {
            val now = OffsetDateTime.now()
            return RequirementConversationList(
                id = null,
                projectId = projectId,
                deleted = 0,
                createdAt = now,
                updatedAt = now,
                version = 0
            )
        }
    }
}
