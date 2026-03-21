package com.task.application.service

import com.task.application.request.LlmPromptHitLogPageRequest
import com.task.application.request.LlmPromptPageRequest
import com.task.application.request.LlmPromptPreviewRequest
import com.task.application.request.SaveLlmPromptRequest
import com.task.application.utils.SecurityUtils
import com.task.application.vo.LlmPromptConfigVO
import com.task.application.vo.LlmPromptHitLogVO
import com.task.application.vo.LlmPromptMatchedItemVO
import com.task.application.vo.LlmPromptPreviewVO
import com.task.domain.constants.ProjectPermissions
import com.task.domain.model.common.PageRequest
import com.task.domain.model.common.PageResult
import com.task.domain.model.llm.prompt.LlmPromptScopeTypeEnum
import com.task.domain.model.llm.prompt.LlmPromptStatusEnum
import com.task.domain.model.llm.prompt.NormalizedPrompt
import com.task.domain.model.llm.prompt.ResolvedPromptContext
import com.task.domain.service.LlmPromptContextService
import com.task.domain.service.LlmPromptService
import com.task.shared.annotation.RequireProjectPermission
import com.task.shared.api.response.PageData
import org.springframework.stereotype.Service
import reactor.core.publisher.Mono

/**
 * LLM提示词应用服务。
 * 负责组合当前用户上下文、项目权限校验、领域服务调用与VO转换。
 */
@Service
class LlmPromptApplicationService(
    private val llmPromptService: LlmPromptService,
    private val llmPromptContextService: LlmPromptContextService,
    private val securityUtils: SecurityUtils
) {

    /**
     * 分页查询当前用户的提示词配置。
     *
     * @param request 分页与筛选条件
     * @return 当前用户提示词分页结果
     */
    fun pageCurrentUserPrompts(request: LlmPromptPageRequest): Mono<PageData<LlmPromptConfigVO>> {
        return securityUtils.withCurrentUserId { userId ->
            llmPromptService.pagePrompts(
                scopeType = LlmPromptScopeTypeEnum.USER,
                scopeObjectId = userId,
                pageRequest = PageRequest(request.pageNumber, request.pageSize),
                promptName = request.promptName,
                status = request.status?.trim()?.takeIf { it.isNotBlank() }?.let(::parseStatus)
            ).map { it.toPageData(LlmPromptConfigVO::fromDomain) }
        }
    }

    /**
     * 创建当前用户的提示词配置。
     *
     * @param request 提示词保存请求
     * @return 创建后的提示词配置
     */
    fun createCurrentUserPrompt(request: SaveLlmPromptRequest): Mono<LlmPromptConfigVO> {
        return securityUtils.withCurrentUserId { userId ->
            savePrompt(
                existingId = null,
                scopeType = LlmPromptScopeTypeEnum.USER,
                scopeObjectId = userId,
                request = request
            )
        }
    }

    /**
     * 更新当前用户的提示词配置。
     *
     * @param id 提示词ID
     * @param request 提示词保存请求
     * @return 更新后的提示词配置
     */
    fun updateCurrentUserPrompt(id: Long, request: SaveLlmPromptRequest): Mono<LlmPromptConfigVO> {
        return securityUtils.withCurrentUserId { userId ->
            savePrompt(
                existingId = id,
                scopeType = LlmPromptScopeTypeEnum.USER,
                scopeObjectId = userId,
                request = request
            )
        }
    }

    /**
     * 删除当前用户的提示词配置。
     *
     * @param id 提示词ID
     * @return 删除结果
     */
    fun deleteCurrentUserPrompt(id: Long): Mono<Void> {
        return securityUtils.withCurrentUserId { userId ->
            llmPromptService.deletePrompt(id, LlmPromptScopeTypeEnum.USER, userId)
        }
    }

    /**
     * 预览当前用户在指定场景下的生效提示词内容。
     *
     * @param request 提示词预览请求
     * @return 提示词预览结果
     */
    fun previewCurrentUserPrompt(request: LlmPromptPreviewRequest): Mono<LlmPromptPreviewVO> {
        return securityUtils.withCurrentUserId {
            val inputs = buildMap<String, Any> {
                request.projectId?.let { put("project_id", it) }
            }
            llmPromptContextService.resolve(request.sceneKey, inputs)
                .map { it.toPreviewVO() }
        }
    }

    /**
     * 分页查询当前用户的提示词命中日志。
     *
     * @param request 分页与筛选条件
     * @return 当前用户提示词命中日志分页结果
     */
    fun pageCurrentUserHitLogs(request: LlmPromptHitLogPageRequest): Mono<PageData<LlmPromptHitLogVO>> {
        return securityUtils.withCurrentUserId { userId ->
            llmPromptService.pageUserHitLogs(
                userId = userId,
                pageRequest = PageRequest(request.pageNumber, request.pageSize),
                sceneKey = request.sceneKey,
                analysisRequestId = request.analysisRequestId
            ).map { it.toPageData(LlmPromptHitLogVO::fromDomain) }
        }
    }

    /**
     * 分页查询项目下的提示词配置。
     *
     * @param projectId 项目ID
     * @param request 分页与筛选条件
     * @return 项目提示词分页结果
     */
    @RequireProjectPermission(
        permission = ProjectPermissions.PROJECT_VIEW,
        projectIdParam = "projectId"
    )
    fun pageProjectPrompts(projectId: Long, request: LlmPromptPageRequest): Mono<PageData<LlmPromptConfigVO>> {
        return llmPromptService.pagePrompts(
            scopeType = LlmPromptScopeTypeEnum.PROJECT,
            scopeObjectId = projectId,
            pageRequest = PageRequest(request.pageNumber, request.pageSize),
            promptName = request.promptName,
            status = request.status?.trim()?.takeIf { it.isNotBlank() }?.let(::parseStatus)
        ).map { it.toPageData(LlmPromptConfigVO::fromDomain) }
    }

    /**
     * 创建项目级提示词配置。
     *
     * @param projectId 项目ID
     * @param request 提示词保存请求
     * @return 创建后的提示词配置
     */
    @RequireProjectPermission(
        permission = ProjectPermissions.PROJECT_EDIT,
        projectIdParam = "projectId"
    )
    fun createProjectPrompt(projectId: Long, request: SaveLlmPromptRequest): Mono<LlmPromptConfigVO> {
        return savePrompt(
            existingId = null,
            scopeType = LlmPromptScopeTypeEnum.PROJECT,
            scopeObjectId = projectId,
            request = request
        )
    }

    /**
     * 更新项目级提示词配置。
     *
     * @param projectId 项目ID
     * @param id 提示词ID
     * @param request 提示词保存请求
     * @return 更新后的提示词配置
     */
    @RequireProjectPermission(
        permission = ProjectPermissions.PROJECT_EDIT,
        projectIdParam = "projectId"
    )
    fun updateProjectPrompt(projectId: Long, id: Long, request: SaveLlmPromptRequest): Mono<LlmPromptConfigVO> {
        return savePrompt(
            existingId = id,
            scopeType = LlmPromptScopeTypeEnum.PROJECT,
            scopeObjectId = projectId,
            request = request
        )
    }

    /**
     * 删除项目级提示词配置。
     *
     * @param projectId 项目ID
     * @param id 提示词ID
     * @return 删除结果
     */
    @RequireProjectPermission(
        permission = ProjectPermissions.PROJECT_EDIT,
        projectIdParam = "projectId"
    )
    fun deleteProjectPrompt(projectId: Long, id: Long): Mono<Void> {
        return llmPromptService.deletePrompt(id, LlmPromptScopeTypeEnum.PROJECT, projectId)
    }

    /**
     * 预览项目在指定场景下的生效提示词内容。
     *
     * @param projectId 项目ID
     * @param request 提示词预览请求
     * @return 提示词预览结果
     */
    @RequireProjectPermission(
        permission = ProjectPermissions.PROJECT_VIEW,
        projectIdParam = "projectId"
    )
    fun previewProjectPrompt(projectId: Long, request: LlmPromptPreviewRequest): Mono<LlmPromptPreviewVO> {
        return securityUtils.withCurrentUserId {
            llmPromptContextService.resolve(
                request.sceneKey,
                mapOf("project_id" to projectId)
            ).map { it.toPreviewVO() }
        }
    }

    /**
     * 分页查询项目下的提示词命中日志。
     *
     * @param projectId 项目ID
     * @param request 分页与筛选条件
     * @return 项目提示词命中日志分页结果
     */
    @RequireProjectPermission(
        permission = ProjectPermissions.PROJECT_VIEW,
        projectIdParam = "projectId"
    )
    fun pageProjectHitLogs(projectId: Long, request: LlmPromptHitLogPageRequest): Mono<PageData<LlmPromptHitLogVO>> {
        return llmPromptService.pageProjectHitLogs(
            projectId = projectId,
            pageRequest = PageRequest(request.pageNumber, request.pageSize),
            sceneKey = request.sceneKey,
            analysisRequestId = request.analysisRequestId
        ).map { it.toPageData(LlmPromptHitLogVO::fromDomain) }
    }

    /**
     * 保存提示词配置，并在保存前执行内容安全检查。
     *
     * @param existingId 已存在的提示词ID，创建时为空
     * @param scopeType 作用域类型
     * @param scopeObjectId 作用域对象ID
     * @param request 提示词保存请求
     * @return 保存后的提示词配置
     */
    private fun savePrompt(
        existingId: Long?,
        scopeType: LlmPromptScopeTypeEnum,
        scopeObjectId: Long,
        request: SaveLlmPromptRequest
    ): Mono<LlmPromptConfigVO> {
        val inspection = llmPromptContextService.inspectContent(request.promptContent)
        if (inspection.normalizedContent.isBlank()) {
            throw IllegalArgumentException("提示词内容经过安全过滤后为空，请调整内容")
        }

        return llmPromptService.savePrompt(
            existingId = existingId,
            scopeType = scopeType,
            scopeObjectId = scopeObjectId,
            promptName = request.promptName,
            promptContent = request.promptContent,
            allSceneEnabled = request.allSceneEnabled,
            sceneKeys = request.sceneKeys,
            status = parseStatus(request.status),
            priority = request.priority
        )
            .map(LlmPromptConfigVO::fromDomain)
    }

    /**
     * 将分页领域结果转换为分页响应对象。
     *
     * @param transform 单项转换函数
     * @return 分页响应对象
     */
    private fun <T : Any, R> PageResult<T>.toPageData(transform: (T) -> R): PageData<R> {
        return PageData.of(
            items.map(transform),
            page,
            size,
            total
        )
    }

    /**
     * 解析提示词状态字符串。
     *
     * @param rawStatus 原始状态值
     * @return 状态枚举
     */
    private fun parseStatus(rawStatus: String): LlmPromptStatusEnum {
        return runCatching { LlmPromptStatusEnum.valueOf(rawStatus.trim().uppercase()) }
            .getOrElse { throw IllegalArgumentException("非法状态: $rawStatus") }
    }

    /**
     * 将提示词上下文转换为预览响应对象。
     *
     * @return 提示词预览VO
     */
    private fun ResolvedPromptContext.toPreviewVO(): LlmPromptPreviewVO {
        return LlmPromptPreviewVO(
            sceneKey = sceneKey,
            projectId = projectId,
            userId = userId,
            analysisRequestId = analysisRequestId,
            hitPromptIds = hitPromptIds,
            projectPrompts = projectPrompts.map { it.toVO() },
            userPrompts = userPrompts.map { it.toVO() },
            projectPromptContext = projectPromptContext,
            userPromptContext = userPromptContext,
            effectivePromptProfile = effectivePromptProfile,
            finalPromptPreview = finalPromptPreview
        )
    }

    /**
     * 将匹配到的标准化提示词转换为展示对象。
     *
     * @return 提示词匹配项VO
     */
    private fun NormalizedPrompt.toVO(): LlmPromptMatchedItemVO {
        return LlmPromptMatchedItemVO(
            id = id,
            scopeType = scopeType.name,
            promptName = promptName,
            originalContent = originalContent,
            normalizedContent = normalizedContent,
            filteredLines = filteredLines
        )
    }
}
