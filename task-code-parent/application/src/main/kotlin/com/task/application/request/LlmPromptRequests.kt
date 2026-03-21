package com.task.application.request

import jakarta.validation.constraints.Max
import jakarta.validation.constraints.Min
import jakarta.validation.constraints.NotBlank
import jakarta.validation.constraints.Size

/**
 * LLM提示词分页查询请求。
 */
data class LlmPromptPageRequest(
    @field:Min(value = 0, message = "页码不能小于0")
    val pageNumber: Int = 0,
    @field:Min(value = 1, message = "每页大小不能小于1")
    @field:Max(value = 100, message = "每页大小不能超过100")
    val pageSize: Int = 10,
    @field:Size(max = 128, message = "提示词名称不能超过128个字符")
    val promptName: String? = null,
    val status: String? = null
)

/**
 * 保存LLM提示词请求。
 */
data class SaveLlmPromptRequest(
    @field:NotBlank(message = "提示词名称不能为空")
    @field:Size(max = 128, message = "提示词名称不能超过128个字符")
    val promptName: String,
    @field:NotBlank(message = "提示词内容不能为空")
    @field:Size(max = 10000, message = "提示词内容不能超过10000个字符")
    val promptContent: String,
    val allSceneEnabled: Boolean = false,
    val sceneKeys: List<@Size(max = 64, message = "场景标识不能超过64个字符") String> = emptyList(),
    val status: String = "ENABLED",
    @field:Min(value = 0, message = "优先级不能小于0")
    @field:Max(value = 100, message = "优先级不能超过100")
    val priority: Int = 0
)

/**
 * LLM提示词预览请求。
 */
data class LlmPromptPreviewRequest(
    @field:NotBlank(message = "sceneKey不能为空")
    @field:Size(max = 64, message = "sceneKey不能超过64个字符")
    val sceneKey: String,
    val projectId: Long? = null
)

/**
 * LLM提示词命中日志分页查询请求。
 */
data class LlmPromptHitLogPageRequest(
    @field:Min(value = 0, message = "页码不能小于0")
    val pageNumber: Int = 0,
    @field:Min(value = 1, message = "每页大小不能小于1")
    @field:Max(value = 100, message = "每页大小不能超过100")
    val pageSize: Int = 10,
    @field:Size(max = 64, message = "sceneKey不能超过64个字符")
    val sceneKey: String? = null,
    @field:Size(max = 64, message = "analysisRequestId不能超过64个字符")
    val analysisRequestId: String? = null
)
