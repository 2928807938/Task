package com.task.infrastructure.llm

import com.fasterxml.jackson.databind.JsonNode
import com.fasterxml.jackson.databind.ObjectMapper
import com.task.domain.model.llm.LlmResult
import com.task.domain.service.LlmService
import com.task.infrastructure.llm.model.LlmResponse
import com.task.domain.service.LlmPromptContextService
import com.task.infrastructure.llm.prompt.XmlWorkflowPromptProvider
import org.slf4j.LoggerFactory
import org.springframework.stereotype.Service
import reactor.core.publisher.Flux

/**
 * LLM服务实现
 * 实现LlmService接口，直接调用OpenAI兼容接口
 */
@Service
class LlmServiceImpl(
    private val openAiCompatibleClient: OpenAiCompatibleClient,
    private val xmlWorkflowPromptProvider: XmlWorkflowPromptProvider,
    private val llmPromptContextService: LlmPromptContextService,
    private val objectMapper: ObjectMapper
) : LlmService {
    
    private val logger = LoggerFactory.getLogger(LlmServiceImpl::class.java)
    private val jsonStrictSceneKeys = setOf(
        "需求分类",
        "优先级分析",
        "工作量分析",
        "任务拆分",
        "需求完整度检查",
        "智能建议",
        "分析摘要",
        "分析总结",
        "任务规划"
    )
    private val mirrorSystemPromptSceneKeys = setOf(
        "任务拆分",
        "任务规划",
        "优先级分析",
        "工作量分析",
        "需求完整度检查",
        "智能建议",
        "需求分类",
        "分析摘要",
        "分析总结"
    )
    
    /**
     * 生成文本（流式响应）
     *
     * @param content 输入内容
     * @param apiKey 场景键（兼容旧参数命名）
     * @param user 用户（可选）
     * @param conversationId 会话id（可选）
     * @param inputs 其他输入变量（可选）
     * @return 生成的文本内容流
     */
    override fun generateText(content: String, apiKey: String, user: String?, conversationId: String?, inputs: Map<String, Any>): Flux<LlmResult> {
        logger.info("调用LLM服务生成文本，sceneKey={}, 输入内容长度={}", apiKey, content.length)
        val strictJsonRequired = requiresStrictJson(apiKey)

        return llmPromptContextService.resolve(apiKey, inputs)
            .flatMapMany { promptContext ->
                val mergedInputs = LinkedHashMap<String, Any>(inputs)
                mergedInputs.putAll(promptContext.toPromptVariables())

                val renderedPrompt = xmlWorkflowPromptProvider.resolvePrompt(
                    sceneKey = apiKey,
                    userInput = content,
                    inputs = mergedInputs
                )
                if (renderedPrompt == null || renderedPrompt.systemPrompt.isBlank()) {
                    logger.error("未加载到提示词模板，终止LLM调用: sceneKey={}", apiKey)
                    return@flatMapMany Flux.just(
                        LlmResult(
                            content = "未加载到分析提示词模板，请检查 llm.prompt.dir 与场景配置。",
                            success = false,
                            errorMessage = "system prompt is blank for sceneKey=$apiKey"
                        )
                    )
                }

                logger.info(
                    "提示词渲染完成: sceneKey={}, templateName={}, sourceFile={}, missingVariables={}, hitPromptCount={}",
                    apiKey,
                    renderedPrompt.templateName,
                    renderedPrompt.sourceFile ?: "unknown",
                    if (renderedPrompt.missingVariables.isEmpty()) "none" else renderedPrompt.missingVariables.joinToString(", "),
                    promptContext.hitPromptIds.size
                )

                val userContent = composeUserContent(
                    sceneKey = apiKey,
                    systemPrompt = renderedPrompt.systemPrompt,
                    userPrompt = renderedPrompt.userPrompt
                )

                val request = OpenAiCompatibleRequest(
                    userContent = userContent,
                    systemPrompt = renderedPrompt.systemPrompt,
                    sceneKey = apiKey,
                    forceJsonObject = strictJsonRequired
                )
                val templateJson = if (strictJsonRequired) {
                    extractTemplateJson(renderedPrompt.systemPrompt).also { extracted ->
                        if (extracted == null) {
                            logger.warn("严格JSON场景未提取到模板JSON: sceneKey={}", apiKey)
                        }
                    }
                } else {
                    null
                }

                llmPromptContextService.recordHit(promptContext)
                    .thenMany(
                        openAiCompatibleClient.generateText(request)
                            .flatMap { response ->
                                handleLlmResponse(
                                    response = response,
                                    sceneKey = apiKey,
                                    templateJson = templateJson
                                )
                            }
                    )
            }
            .onErrorResume { e ->
                Flux.just(
                    LlmResult(
                        content = "无法生成AI分析，请稍后再试。",
                        success = false,
                        errorMessage = e.message
                    )
                )
            }
    }

    private fun handleLlmResponse(
        response: LlmResponse,
        sceneKey: String,
        templateJson: String?
    ): Flux<LlmResult> {
        val strictJsonRequired = requiresStrictJson(sceneKey)
        if (!response.success) {
            if (!strictJsonRequired) {
                return Flux.just(toLlmResult(response, response.content))
            }
            logger.warn(
                "严格JSON场景上游调用失败，返回兜底JSON: sceneKey={}, error={}",
                sceneKey,
                response.errorMessage ?: "unknown"
            )
            return Flux.just(
                LlmResult(
                    content = buildStrictJsonFallback(
                        sceneKey = sceneKey,
                        rawOutput = response.content,
                        templateJson = templateJson,
                        errorCode = "UPSTREAM_LLM_CALL_FAILED",
                        message = "上游LLM服务暂时不可用，请稍后重试",
                        detail = response.errorMessage
                    ),
                    success = false,
                    errorMessage = response.errorMessage
                )
            )
        }

        if (!strictJsonRequired) {
            return Flux.just(toLlmResult(response, response.content))
        }

        val normalizedContent = normalizeStrictJsonContent(sceneKey, response.content)
        if (normalizedContent != null) {
            return Flux.just(toLlmResult(response, normalizedContent))
        }

        logger.warn(
            "严格JSON场景返回非JSON，返回兜底JSON: sceneKey={}, contentPreview={}",
            sceneKey,
            response.content.trim().take(160)
        )

        return Flux.just(
            LlmResult(
                content = buildStrictJsonFallback(
                    sceneKey = sceneKey,
                    rawOutput = response.content,
                    templateJson = templateJson
                ),
                success = false,
                errorMessage = "strict json parse failed"
            )
        )
    }

    private fun toLlmResult(response: LlmResponse, normalizedContent: String): LlmResult {
        return LlmResult(
            content = normalizedContent,
            success = response.success,
            errorMessage = response.errorMessage
        )
    }

    private fun composeUserContent(sceneKey: String, systemPrompt: String, userPrompt: String): String {
        val normalizedScene = sceneKey.trim()
        if (!mirrorSystemPromptSceneKeys.contains(normalizedScene)) {
            return userPrompt
        }
        if (userPrompt.contains(systemPrompt)) {
            return userPrompt
        }
        return buildString {
            appendLine("请严格遵循以下系统规则，并仅按规则完成任务。")
            appendLine(systemPrompt.trim())
            appendLine()
            appendLine("用户输入：")
            append(userPrompt.trim())
        }
    }

    private fun normalizeStrictJsonContent(sceneKey: String, content: String): String? {
        val trimmed = content.trim()
        if (trimmed.isEmpty()) {
            return null
        }

        val candidate = extractJsonCandidate(trimmed) ?: return null
        if (candidate != trimmed) {
            logger.warn("模型返回包含额外文本，已自动提取JSON主体: sceneKey={}", sceneKey)
        }

        val node = readJsonObjectOrArray(candidate) ?: return null
        return runCatching { objectMapper.writeValueAsString(node) }
            .getOrElse { candidate.trim() }
    }

    private fun extractTemplateJson(systemPrompt: String): String? {
        val templateSection = listOf("输出 JSON 结构示例", "输出 JSON 结构", "输出 JSON 格式")
            .asSequence()
            .map { marker -> systemPrompt.substringAfter(marker, "") }
            .firstOrNull { it.isNotBlank() }
            ?: systemPrompt

        val candidate = extractJsonCandidate(templateSection) ?: return null
        val node = readJsonObjectOrArray(candidate) ?: return null
        return runCatching { objectMapper.writeValueAsString(node) }.getOrNull()
    }

    private fun buildStrictJsonFallback(
        sceneKey: String,
        rawOutput: String,
        templateJson: String? = null,
        errorCode: String = "STRICT_JSON_PARSE_FAILED",
        message: String = "模型未返回可解析JSON，请重试",
        detail: String? = null
    ): String {
        val fallback = linkedMapOf<String, Any>(
            "error" to errorCode,
            "sceneKey" to sceneKey,
            "message" to message,
            "rawOutput" to rawOutput.take(500)
        )
        detail?.takeIf { it.isNotBlank() }?.let {
            fallback["detail"] = it.take(300)
        }
        templateJson
            ?.let(::readJsonObjectOrArray)
            ?.let { fallback["expectedFormat"] = it }

        return runCatching { objectMapper.writeValueAsString(fallback) }
            .getOrElse { """{"error":"$errorCode","sceneKey":"$sceneKey"}""" }
    }

    private fun requiresStrictJson(sceneKey: String?): Boolean {
        if (sceneKey.isNullOrBlank()) {
            return false
        }
        return jsonStrictSceneKeys.contains(sceneKey.trim())
    }

    private fun extractJsonCandidate(text: String): String? {
        if (readJsonObjectOrArray(text) != null) {
            return text
        }

        val candidates = linkedSetOf<String>()
        extractJsonFromMarkdownFence(text)?.let(candidates::add)
        extractFirstJsonValue(text)?.let(candidates::add)
        extractJsonFromQuotedPayload(text)?.let(candidates::add)

        candidates.forEach { candidate ->
            if (readJsonObjectOrArray(candidate) != null) {
                return candidate
            }
        }
        return null
    }

    private fun readJsonObjectOrArray(text: String): JsonNode? {
        val node = runCatching { objectMapper.readTree(text) }.getOrNull() ?: return null
        return if (node.isObject || node.isArray) node else null
    }

    private fun extractJsonFromMarkdownFence(text: String): String? {
        val fenceRegex = Regex("```(?:json)?\\s*([\\s\\S]*?)\\s*```", setOf(RegexOption.IGNORE_CASE))
        val matches = fenceRegex.findAll(text)
        matches.forEach { match ->
            val block = match.groupValues.getOrNull(1)?.trim().orEmpty()
            if (block.isNotEmpty() && readJsonObjectOrArray(block) != null) {
                return block
            }
        }
        return null
    }

    private fun extractJsonFromQuotedPayload(text: String): String? {
        val root = runCatching { objectMapper.readTree(text) }.getOrNull() ?: return null
        if (!root.isTextual) {
            return null
        }
        val nested = root.asText("").trim()
        if (nested.isEmpty()) {
            return null
        }
        return nested
    }

    private fun extractFirstJsonValue(text: String): String? {
        for (start in text.indices) {
            val startToken = text[start]
            if (startToken != '{' && startToken != '[') {
                continue
            }
            val candidate = extractJsonValueFromStart(text, start, startToken) ?: continue
            if (readJsonObjectOrArray(candidate) != null) {
                return candidate
            }
        }
        return null
    }

    private fun extractJsonValueFromStart(text: String, start: Int, startToken: Char): String? {
        val endToken = if (startToken == '{') '}' else ']'
        var depth = 0
        var inString = false
        var escaping = false
        var end = -1

        for (i in start until text.length) {
            val ch = text[i]

            if (inString) {
                if (escaping) {
                    escaping = false
                    continue
                }
                when (ch) {
                    '\\' -> escaping = true
                    '"' -> inString = false
                }
                continue
            }

            when (ch) {
                '"' -> inString = true
                startToken -> depth++
                endToken -> {
                    depth--
                    if (depth == 0) {
                        end = i
                        break
                    }
                }
            }
        }

        if (end <= start) {
            return null
        }

        return text.substring(start, end + 1).trim()
    }
}
