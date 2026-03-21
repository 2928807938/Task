package com.task.domain.service

import com.task.domain.model.common.ComparisonOperator
import com.task.domain.model.common.PageRequest
import com.task.domain.model.common.PageResult
import com.task.domain.model.common.desc
import com.task.domain.model.common.fieldOf
import com.task.domain.model.llm.prompt.LlmPromptConfig
import com.task.domain.model.llm.prompt.LlmPromptHitLog
import com.task.domain.model.llm.prompt.LlmPromptScopeTypeEnum
import com.task.domain.model.llm.prompt.LlmPromptStatusEnum
import com.task.domain.repository.LlmPromptConfigRepository
import com.task.domain.repository.LlmPromptHitLogRepository
import org.slf4j.LoggerFactory
import org.springframework.stereotype.Service
import reactor.core.publisher.Mono

/**
 * LLM提示词领域服务。
 * 负责提示词配置的查询、保存、删除，以及提示词命中日志的查询。
 */
@Service
class LlmPromptService(
    private val llmPromptConfigRepository: LlmPromptConfigRepository,
    private val llmPromptHitLogRepository: LlmPromptHitLogRepository
) {

    companion object {
        private const val MIN_PRIORITY = 0
        private const val MAX_PRIORITY = 100
    }

    private val log = LoggerFactory.getLogger(this::class.java)

    /**
     * 分页查询指定作用域下的提示词配置。
     *
     * @param scopeType 作用域类型
     * @param scopeObjectId 作用域对象ID
     * @param pageRequest 分页请求
     * @param promptName 提示词名称筛选条件
     * @param status 提示词状态筛选条件
     * @return 提示词分页结果
     */
    fun pagePrompts(
        scopeType: LlmPromptScopeTypeEnum,
        scopeObjectId: Long,
        pageRequest: PageRequest,
        promptName: String? = null,
        status: LlmPromptStatusEnum? = null
    ): Mono<PageResult<LlmPromptConfig>> {
        return llmPromptConfigRepository.page<LlmPromptConfig>(pageRequest) {
            fieldOf(LlmPromptConfig::scopeType, ComparisonOperator.EQUALS, scopeType)
            fieldOf(LlmPromptConfig::scopeObjectId, ComparisonOperator.EQUALS, scopeObjectId)
            promptName?.trim()?.takeIf { it.isNotBlank() }?.let {
                fieldOf(LlmPromptConfig::promptName, ComparisonOperator.LIKE, "%$it%")
            }
            status?.let {
                fieldOf(LlmPromptConfig::status, ComparisonOperator.EQUALS, it)
            }
            orderBy(
                desc(LlmPromptConfig::priority),
                desc(LlmPromptConfig::updatedAt),
                desc(LlmPromptConfig::createdAt)
            )
        }
    }

    /**
     * 保存提示词配置。
     * 创建时写入新记录，更新时仅允许修改当前作用域下已有记录。
     *
     * @param existingId 已存在的提示词ID，创建时为空
     * @param scopeType 作用域类型
     * @param scopeObjectId 作用域对象ID
     * @param promptName 提示词名称
     * @param promptContent 提示词内容
     * @param allSceneEnabled 是否全场景启用
     * @param sceneKeys 生效场景列表
     * @param status 提示词状态
     * @param priority 提示词优先级
     * @return 保存后的提示词配置
     */
    fun savePrompt(
        existingId: Long?,
        scopeType: LlmPromptScopeTypeEnum,
        scopeObjectId: Long,
        promptName: String,
        promptContent: String,
        allSceneEnabled: Boolean,
        sceneKeys: List<String>,
        status: LlmPromptStatusEnum,
        priority: Int
    ): Mono<LlmPromptConfig> {
        val normalizedPromptName = promptName.trim()
        val normalizedPromptContent = promptContent.trim()
        val normalizedSceneKeys = normalizeSceneKeys(sceneKeys)

        validatePrompt(normalizedPromptName, normalizedPromptContent, allSceneEnabled, normalizedSceneKeys, priority)

        return ensurePromptNameUnique(
            existingId = existingId,
            scopeType = scopeType,
            scopeObjectId = scopeObjectId,
            promptName = normalizedPromptName
        ).then(
            if (existingId == null) {
                llmPromptConfigRepository.save(
                    LlmPromptConfig.create(
                        scopeType = scopeType,
                        scopeObjectId = scopeObjectId,
                        promptName = normalizedPromptName,
                        promptContent = normalizedPromptContent,
                        allSceneEnabled = if (allSceneEnabled) 1 else 0,
                        sceneKeys = normalizedSceneKeys,
                        status = status,
                        priority = priority
                    )
                )
            } else {
                loadOwnedPrompt(existingId, scopeType, scopeObjectId)
                    .flatMap { existing ->
                        llmPromptConfigRepository.update(
                            existing.copy(
                                promptName = normalizedPromptName,
                                promptContent = normalizedPromptContent,
                                allSceneEnabled = if (allSceneEnabled) 1 else 0,
                                sceneKeys = normalizedSceneKeys,
                                status = status,
                                priority = priority
                            )
                        )
                    }
            }
        ).doOnNext {
            log.info(
                "保存LLM提示词成功: scopeType={}, scopeObjectId={}, promptName={}, id={}",
                scopeType,
                scopeObjectId,
                it.promptName,
                it.id
            )
        }
    }

    /**
     * 删除指定作用域下的提示词配置。
     *
     * @param id 提示词ID
     * @param scopeType 作用域类型
     * @param scopeObjectId 作用域对象ID
     * @return 删除结果
     */
    fun deletePrompt(id: Long, scopeType: LlmPromptScopeTypeEnum, scopeObjectId: Long): Mono<Void> {
        return loadOwnedPrompt(id, scopeType, scopeObjectId)
            .flatMap { llmPromptConfigRepository.delete(id) }
    }

    /**
     * 分页查询用户维度的提示词命中日志。
     *
     * @param userId 用户ID
     * @param pageRequest 分页请求
     * @param sceneKey 场景标识筛选条件
     * @param analysisRequestId 分析请求ID筛选条件
     * @return 命中日志分页结果
     */
    fun pageUserHitLogs(
        userId: Long,
        pageRequest: PageRequest,
        sceneKey: String? = null,
        analysisRequestId: String? = null
    ): Mono<PageResult<LlmPromptHitLog>> {
        return llmPromptHitLogRepository.page<LlmPromptHitLog>(pageRequest) {
            fieldOf(LlmPromptHitLog::userId, ComparisonOperator.EQUALS, userId)
            sceneKey?.trim()?.takeIf { it.isNotBlank() }?.let {
                fieldOf(LlmPromptHitLog::sceneKey, ComparisonOperator.EQUALS, it)
            }
            analysisRequestId?.trim()?.takeIf { it.isNotBlank() }?.let {
                fieldOf(LlmPromptHitLog::analysisRequestId, ComparisonOperator.EQUALS, it)
            }
            orderBy(desc(LlmPromptHitLog::createdAt))
        }
    }

    /**
     * 分页查询项目维度的提示词命中日志。
     *
     * @param projectId 项目ID
     * @param pageRequest 分页请求
     * @param sceneKey 场景标识筛选条件
     * @param analysisRequestId 分析请求ID筛选条件
     * @return 命中日志分页结果
     */
    fun pageProjectHitLogs(
        projectId: Long,
        pageRequest: PageRequest,
        sceneKey: String? = null,
        analysisRequestId: String? = null
    ): Mono<PageResult<LlmPromptHitLog>> {
        return llmPromptHitLogRepository.page<LlmPromptHitLog>(pageRequest) {
            fieldOf(LlmPromptHitLog::projectId, ComparisonOperator.EQUALS, projectId)
            sceneKey?.trim()?.takeIf { it.isNotBlank() }?.let {
                fieldOf(LlmPromptHitLog::sceneKey, ComparisonOperator.EQUALS, it)
            }
            analysisRequestId?.trim()?.takeIf { it.isNotBlank() }?.let {
                fieldOf(LlmPromptHitLog::analysisRequestId, ComparisonOperator.EQUALS, it)
            }
            orderBy(desc(LlmPromptHitLog::createdAt))
        }
    }

    /**
     * 校验同一作用域下提示词名称是否唯一。
     *
     * @param existingId 已存在的提示词ID，创建时为空
     * @param scopeType 作用域类型
     * @param scopeObjectId 作用域对象ID
     * @param promptName 提示词名称
     * @return 校验结果
     */
    private fun ensurePromptNameUnique(
        existingId: Long?,
        scopeType: LlmPromptScopeTypeEnum,
        scopeObjectId: Long,
        promptName: String
    ): Mono<Void> {
        return llmPromptConfigRepository.list<LlmPromptConfig> {
            fieldOf(LlmPromptConfig::scopeType, ComparisonOperator.EQUALS, scopeType)
            fieldOf(LlmPromptConfig::scopeObjectId, ComparisonOperator.EQUALS, scopeObjectId)
            fieldOf(LlmPromptConfig::promptName, ComparisonOperator.EQUALS, promptName)
        }.collectList().flatMap { prompts ->
            val duplicated = prompts.any { existing -> existingId == null || existing.id != existingId }
            if (duplicated) {
                Mono.error<Void>(IllegalArgumentException("同一作用域下已存在同名提示词: $promptName"))
            } else {
                Mono.empty<Void>()
            }
        }
    }

    /**
     * 加载并校验提示词是否属于指定作用域。
     *
     * @param id 提示词ID
     * @param scopeType 作用域类型
     * @param scopeObjectId 作用域对象ID
     * @return 当前作用域下的提示词配置
     */
    private fun loadOwnedPrompt(
        id: Long,
        scopeType: LlmPromptScopeTypeEnum,
        scopeObjectId: Long
    ): Mono<LlmPromptConfig> {
        return llmPromptConfigRepository.findById(id)
            .switchIfEmpty(Mono.error(IllegalArgumentException("提示词不存在: id=$id")))
            .flatMap { prompt ->
                if (prompt.scopeType != scopeType || prompt.scopeObjectId != scopeObjectId) {
                    Mono.error(IllegalArgumentException("提示词不属于当前作用域: id=$id"))
                } else {
                    Mono.just(prompt)
                }
            }
    }

    /**
     * 校验提示词基础参数。
     *
     * @param promptName 提示词名称
     * @param promptContent 提示词内容
     * @param allSceneEnabled 是否全场景启用
     * @param sceneKeys 生效场景列表
     */
    private fun validatePrompt(
        promptName: String,
        promptContent: String,
        allSceneEnabled: Boolean,
        sceneKeys: List<String>,
        priority: Int
    ) {
        if (promptName.isBlank()) {
            throw IllegalArgumentException("提示词名称不能为空")
        }
        if (promptContent.isBlank()) {
            throw IllegalArgumentException("提示词内容不能为空")
        }
        if (!allSceneEnabled && sceneKeys.isEmpty()) {
            throw IllegalArgumentException("未开启全场景时，sceneKeys 不能为空")
        }
        if (priority !in MIN_PRIORITY..MAX_PRIORITY) {
            throw IllegalArgumentException("提示词优先级必须在$MIN_PRIORITY-$MAX_PRIORITY之间")
        }
    }

    /**
     * 标准化场景标识列表。
     *
     * @param sceneKeys 原始场景标识列表
     * @return 去空、去重后的场景标识列表
     */
    private fun normalizeSceneKeys(sceneKeys: List<String>): List<String> {
        return sceneKeys
            .map { it.trim() }
            .filter { it.isNotBlank() }
            .distinct()
    }
}
