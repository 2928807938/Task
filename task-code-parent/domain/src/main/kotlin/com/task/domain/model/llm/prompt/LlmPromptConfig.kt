package com.task.domain.model.llm.prompt

import java.time.OffsetDateTime

/**
 * LLM自定义提示词配置。
 * 用于描述用户级或项目级的提示词定义、适用场景与启用状态。
 *
 * @property id 提示词配置ID
 * @property scopeType 提示词作用域类型
 * @property scopeObjectId 作用域对象ID，例如项目ID或用户ID
 * @property promptName 提示词名称
 * @property promptContent 提示词内容
 * @property allSceneEnabled 是否对全部场景生效，1表示是，0表示否
 * @property sceneKeys 指定生效场景列表
 * @property status 提示词状态
 * @property priority 提示词优先级，值越大优先级越高
 * @property deleted 逻辑删除标记，1表示已删除，0表示未删除
 * @property createdAt 创建时间
 * @property updatedAt 更新时间
 * @property version 乐观锁版本号
 */
data class LlmPromptConfig(
    val id: Long?,
    val scopeType: LlmPromptScopeTypeEnum,
    val scopeObjectId: Long,
    val promptName: String,
    val promptContent: String,
    val allSceneEnabled: Int = 0,
    val sceneKeys: List<String> = emptyList(),
    val status: LlmPromptStatusEnum = LlmPromptStatusEnum.ENABLED,
    val priority: Int = 0,
    val deleted: Int = 0,
    val createdAt: OffsetDateTime,
    val updatedAt: OffsetDateTime?,
    val version: Int = 0
) {
    companion object {
        /**
         * 创建新的提示词配置。
         *
         * @param scopeType 提示词作用域类型
         * @param scopeObjectId 作用域对象ID
         * @param promptName 提示词名称
         * @param promptContent 提示词内容
         * @param allSceneEnabled 是否全场景启用
         * @param sceneKeys 生效场景列表
         * @param status 提示词状态
         * @param priority 提示词优先级
         * @return 新创建的提示词配置
         */
        fun create(
            scopeType: LlmPromptScopeTypeEnum,
            scopeObjectId: Long,
            promptName: String,
            promptContent: String,
            allSceneEnabled: Int = 0,
            sceneKeys: List<String> = emptyList(),
            status: LlmPromptStatusEnum = LlmPromptStatusEnum.ENABLED,
            priority: Int = 0
        ): LlmPromptConfig {
            val now = OffsetDateTime.now()
            return LlmPromptConfig(
                id = null,
                scopeType = scopeType,
                scopeObjectId = scopeObjectId,
                promptName = promptName,
                promptContent = promptContent,
                allSceneEnabled = allSceneEnabled,
                sceneKeys = sceneKeys,
                status = status,
                priority = priority,
                deleted = 0,
                createdAt = now,
                updatedAt = now,
                version = 0
            )
        }
    }
}
