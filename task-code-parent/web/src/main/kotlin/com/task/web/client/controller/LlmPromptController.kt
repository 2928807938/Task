package com.task.web.client.controller

import com.task.application.request.LlmPromptHitLogPageRequest
import com.task.application.request.LlmPromptPageRequest
import com.task.application.request.LlmPromptConflictCheckRequest
import com.task.application.request.LlmPromptPreviewRequest
import com.task.application.request.SaveLlmPromptRequest
import com.task.application.service.LlmPromptApplicationService
import com.task.application.vo.LlmPromptConfigVO
import com.task.application.vo.LlmPromptConflictCheckVO
import com.task.application.vo.LlmPromptHitLogVO
import com.task.application.vo.LlmPromptPreviewVO
import com.task.shared.api.response.ApiResponse
import com.task.shared.api.response.PageData
import jakarta.validation.Valid
import org.springframework.validation.annotation.Validated
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController
import reactor.core.publisher.Mono

/**
 * LLM提示词管理控制器。
 * 提供用户级与项目级提示词配置、预览与命中日志查询接口。
 */
@RestController
@RequestMapping("/api/client/llm-prompt")
class LlmPromptController(
    private val llmPromptApplicationService: LlmPromptApplicationService
) {

    /**
     * 分页查询当前用户的提示词配置。
     *
     * @param request 分页与筛选条件
     * @return 当前用户提示词分页结果
     */
    @GetMapping("/user/page")
    fun pageCurrentUserPrompts(@Validated request: LlmPromptPageRequest): Mono<ApiResponse<PageData<LlmPromptConfigVO>>> {
        return llmPromptApplicationService.pageCurrentUserPrompts(request)
            .map { ApiResponse.success(it) }
    }

    /**
     * 创建当前用户的提示词配置。
     *
     * @param request 提示词保存请求
     * @return 创建后的提示词配置
     */
    @PostMapping("/user/create")
    fun createCurrentUserPrompt(@RequestBody @Valid request: SaveLlmPromptRequest): Mono<ApiResponse<LlmPromptConfigVO>> {
        return llmPromptApplicationService.createCurrentUserPrompt(request)
            .map { ApiResponse.success(it) }
    }

    /**
     * 更新当前用户的提示词配置。
     *
     * @param id 提示词ID
     * @param request 提示词保存请求
     * @return 更新后的提示词配置
     */
    @PostMapping("/user/update/{id}")
    fun updateCurrentUserPrompt(
        @PathVariable id: Long,
        @RequestBody @Valid request: SaveLlmPromptRequest
    ): Mono<ApiResponse<LlmPromptConfigVO>> {
        return llmPromptApplicationService.updateCurrentUserPrompt(id, request)
            .map { ApiResponse.success(it) }
    }

    /**
     * 删除当前用户的提示词配置。
     *
     * @param id 提示词ID
     * @return 删除结果
     */
    @PostMapping("/user/delete/{id}")
    fun deleteCurrentUserPrompt(@PathVariable id: Long): Mono<ApiResponse<Void>> {
        return llmPromptApplicationService.deleteCurrentUserPrompt(id)
            .thenReturn(ApiResponse.success())
    }

    /**
     * 预览当前用户在指定场景下的生效提示词内容。
     *
     * @param request 提示词预览请求
     * @return 提示词预览结果
     */
    @PostMapping("/user/preview")
    fun previewCurrentUserPrompt(@RequestBody @Valid request: LlmPromptPreviewRequest): Mono<ApiResponse<LlmPromptPreviewVO>> {
        return llmPromptApplicationService.previewCurrentUserPrompt(request)
            .map { ApiResponse.success(it) }
    }

    /**
     * 检测当前用户在指定场景下的提示词冲突。
     *
     * @param request 冲突检测请求
     * @return 冲突检测结果
     */
    @PostMapping("/user/conflicts")
    fun inspectCurrentUserPromptConflicts(
        @RequestBody @Valid request: LlmPromptConflictCheckRequest
    ): Mono<ApiResponse<LlmPromptConflictCheckVO>> {
        return llmPromptApplicationService.inspectCurrentUserPromptConflicts(request)
            .map { ApiResponse.success(it) }
    }

    /**
     * 分页查询当前用户的提示词命中日志。
     *
     * @param request 分页与筛选条件
     * @return 当前用户提示词命中日志分页结果
     */
    @GetMapping("/user/hit-log/page")
    fun pageCurrentUserHitLogs(
        @Validated request: LlmPromptHitLogPageRequest
    ): Mono<ApiResponse<PageData<LlmPromptHitLogVO>>> {
        return llmPromptApplicationService.pageCurrentUserHitLogs(request)
            .map { ApiResponse.success(it) }
    }

    /**
     * 分页查询项目下的提示词配置。
     *
     * @param projectId 项目ID
     * @param request 分页与筛选条件
     * @return 项目提示词分页结果
     */
    @GetMapping("/project/{projectId}/page")
    fun pageProjectPrompts(
        @PathVariable projectId: Long,
        @Validated request: LlmPromptPageRequest
    ): Mono<ApiResponse<PageData<LlmPromptConfigVO>>> {
        return llmPromptApplicationService.pageProjectPrompts(projectId, request)
            .map { ApiResponse.success(it) }
    }

    /**
     * 创建项目级提示词配置。
     *
     * @param projectId 项目ID
     * @param request 提示词保存请求
     * @return 创建后的提示词配置
     */
    @PostMapping("/project/{projectId}/create")
    fun createProjectPrompt(
        @PathVariable projectId: Long,
        @RequestBody @Valid request: SaveLlmPromptRequest
    ): Mono<ApiResponse<LlmPromptConfigVO>> {
        return llmPromptApplicationService.createProjectPrompt(projectId, request)
            .map { ApiResponse.success(it) }
    }

    /**
     * 更新项目级提示词配置。
     *
     * @param projectId 项目ID
     * @param id 提示词ID
     * @param request 提示词保存请求
     * @return 更新后的提示词配置
     */
    @PostMapping("/project/{projectId}/update/{id}")
    fun updateProjectPrompt(
        @PathVariable projectId: Long,
        @PathVariable id: Long,
        @RequestBody @Valid request: SaveLlmPromptRequest
    ): Mono<ApiResponse<LlmPromptConfigVO>> {
        return llmPromptApplicationService.updateProjectPrompt(projectId, id, request)
            .map { ApiResponse.success(it) }
    }

    /**
     * 删除项目级提示词配置。
     *
     * @param projectId 项目ID
     * @param id 提示词ID
     * @return 删除结果
     */
    @PostMapping("/project/{projectId}/delete/{id}")
    fun deleteProjectPrompt(
        @PathVariable projectId: Long,
        @PathVariable id: Long
    ): Mono<ApiResponse<Void>> {
        return llmPromptApplicationService.deleteProjectPrompt(projectId, id)
            .thenReturn(ApiResponse.success())
    }

    /**
     * 预览项目在指定场景下的生效提示词内容。
     *
     * @param projectId 项目ID
     * @param request 提示词预览请求
     * @return 提示词预览结果
     */
    @PostMapping("/project/{projectId}/preview")
    fun previewProjectPrompt(
        @PathVariable projectId: Long,
        @RequestBody @Valid request: LlmPromptPreviewRequest
    ): Mono<ApiResponse<LlmPromptPreviewVO>> {
        return llmPromptApplicationService.previewProjectPrompt(projectId, request)
            .map { ApiResponse.success(it) }
    }

    /**
     * 检测项目级提示词之间的冲突。
     *
     * @param projectId 项目ID
     * @param request 冲突检测请求
     * @return 冲突检测结果
     */
    @PostMapping("/project/{projectId}/conflicts")
    fun inspectProjectPromptConflicts(
        @PathVariable projectId: Long,
        @RequestBody @Valid request: LlmPromptConflictCheckRequest
    ): Mono<ApiResponse<LlmPromptConflictCheckVO>> {
        return llmPromptApplicationService.inspectProjectPromptConflicts(projectId, request)
            .map { ApiResponse.success(it) }
    }

    /**
     * 分页查询项目下的提示词命中日志。
     *
     * @param projectId 项目ID
     * @param request 分页与筛选条件
     * @return 项目提示词命中日志分页结果
     */
    @GetMapping("/project/{projectId}/hit-log/page")
    fun pageProjectHitLogs(
        @PathVariable projectId: Long,
        @Validated request: LlmPromptHitLogPageRequest
    ): Mono<ApiResponse<PageData<LlmPromptHitLogVO>>> {
        return llmPromptApplicationService.pageProjectHitLogs(projectId, request)
            .map { ApiResponse.success(it) }
    }
}
