package com.task.domain.model.llm.prompt

import java.util.UUID

/**
 * LLM提示词上下文相关键名常量。
 */
object LlmPromptContextKeys {
    /** 分析请求ID输入键。 */
    const val ANALYSIS_REQUEST_ID_INPUT_KEY = "_analysis_request_id"

    /** 项目级提示词上下文输入键。 */
    const val PROJECT_PROMPT_CONTEXT_INPUT_KEY = "project_prompt_context"

    /** 用户级提示词上下文输入键。 */
    const val USER_PROMPT_CONTEXT_INPUT_KEY = "user_prompt_context"

    /** 生效提示词画像输入键。 */
    const val EFFECTIVE_PROMPT_PROFILE_INPUT_KEY = "effective_prompt_profile"
}

/**
 * 解析后的提示词上下文。
 * 聚合了指定场景下项目级、用户级提示词及其生成的辅助上下文信息。
 *
 * @property sceneKey 场景标识
 * @property projectId 项目ID
 * @property userId 用户ID
 * @property analysisRequestId 分析请求ID
 * @property projectPrompts 命中的项目级提示词列表
 * @property userPrompts 命中的用户级提示词列表
 * @property projectPromptContext 项目级提示词上下文文本
 * @property userPromptContext 用户级提示词上下文文本
 * @property effectivePromptProfile 汇总后的有效提示词画像
 * @property hitPromptIds 命中的提示词ID列表
 * @property finalPromptPreview 最终提示词预览
 */
data class ResolvedPromptContext(
    val sceneKey: String,
    val projectId: Long?,
    val userId: Long?,
    val analysisRequestId: String,
    val projectPrompts: List<NormalizedPrompt>,
    val userPrompts: List<NormalizedPrompt>,
    val projectPromptContext: String,
    val userPromptContext: String,
    val effectivePromptProfile: String,
    val hitPromptIds: List<Long>,
    val finalPromptPreview: String?
) {
    /**
     * 转换为可传递给提示词渲染器的输入变量映射。
     *
     * @return 提示词渲染输入变量
     */
    fun toPromptVariables(): Map<String, Any> {
        return linkedMapOf<String, Any>().apply {
            put(LlmPromptContextKeys.ANALYSIS_REQUEST_ID_INPUT_KEY, analysisRequestId)
            if (projectPromptContext.isNotBlank()) {
                put(LlmPromptContextKeys.PROJECT_PROMPT_CONTEXT_INPUT_KEY, projectPromptContext)
            }
            if (userPromptContext.isNotBlank()) {
                put(LlmPromptContextKeys.USER_PROMPT_CONTEXT_INPUT_KEY, userPromptContext)
            }
            if (effectivePromptProfile.isNotBlank()) {
                put(LlmPromptContextKeys.EFFECTIVE_PROMPT_PROFILE_INPUT_KEY, effectivePromptProfile)
            }
        }
    }

    companion object {
        /**
         * 创建空的提示词上下文。
         *
         * @param sceneKey 场景标识
         * @return 空上下文对象
         */
        fun empty(sceneKey: String): ResolvedPromptContext {
            return ResolvedPromptContext(
                sceneKey = sceneKey,
                projectId = null,
                userId = null,
                analysisRequestId = UUID.randomUUID().toString(),
                projectPrompts = emptyList(),
                userPrompts = emptyList(),
                projectPromptContext = "",
                userPromptContext = "",
                effectivePromptProfile = "",
                hitPromptIds = emptyList(),
                finalPromptPreview = null
            )
        }
    }
}

/**
 * 标准化后的提示词内容。
 * 用于表达经过过滤与清洗后可参与最终拼装的提示词片段。
 *
 * @property id 原始提示词ID
 * @property scopeType 作用域类型
 * @property promptName 提示词名称
 * @property originalContent 原始提示词内容
 * @property normalizedContent 清洗后的提示词内容
 * @property filteredLines 被过滤的风险内容行
 */
data class NormalizedPrompt(
    val id: Long?,
    val scopeType: LlmPromptScopeTypeEnum,
    val scopeObjectId: Long,
    val promptName: String,
    val originalContent: String,
    val normalizedContent: String,
    val filteredLines: List<String>
)

/**
 * 提示词内容检查结果。
 *
 * @property normalizedContent 清洗后的内容
 * @property filteredLines 被过滤的风险内容行
 */
data class PromptInspectionResult(
    val normalizedContent: String,
    val filteredLines: List<String>
)

/**
 * 提示词冲突检测结果。
 * 用于描述指定场景下，当前用户与项目级提示词之间的冲突详情。
 *
 * @property sceneKey 场景标识
 * @property projectId 项目ID
 * @property userId 用户ID
 * @property userPrompts 参与检测的用户级提示词
 * @property projectPrompts 参与检测的项目级提示词
 * @property conflicts 检测到的冲突列表
 */
data class PromptConflictInspectionResult(
    val sceneKey: String,
    val projectId: Long?,
    val userId: Long?,
    val userPrompts: List<NormalizedPrompt>,
    val projectPrompts: List<NormalizedPrompt>,
    val conflicts: List<PromptConflictDetail>
)

/**
 * 单条提示词冲突明细。
 *
 * @property relationType 冲突关系类型
 * @property conflictType 冲突类型
 * @property promptA 冲突提示词A
 * @property promptB 冲突提示词B
 * @property promptAOpinion 提示词A表达的要求摘要
 * @property promptBOpinion 提示词B表达的要求摘要
 * @property reason 冲突原因
 * @property resolutionRule 冲突裁决规则说明
 * @property winnerPromptId 裁决后保留的提示词ID
 * @property loserPromptId 裁决后被压制的提示词ID
 */
data class PromptConflictDetail(
    val relationType: PromptConflictRelationType,
    val conflictType: PromptConflictType,
    val promptA: NormalizedPrompt,
    val promptB: NormalizedPrompt,
    val promptAOpinion: String,
    val promptBOpinion: String,
    val reason: String,
    val resolutionRule: String,
    val winnerPromptId: Long?,
    val loserPromptId: Long?
)

/**
 * 提示词冲突关系类型。
 */
enum class PromptConflictRelationType {
    USER_USER,
    USER_PROJECT,
    PROJECT_PROJECT
}

/**
 * 提示词冲突类型。
 */
enum class PromptConflictType {
    DETAIL_LEVEL,
    ANALYSIS_PROCESS,
    RISK_DISCLOSURE,
    OUTPUT_LENGTH,
    OUTPUT_FORMAT,
    ROLE_DEFINITION,
    ORDERING_PREFERENCE,
    EXPRESSION_STYLE
}
