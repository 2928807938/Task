package com.task.infrastructure.llm

import com.fasterxml.jackson.databind.ObjectMapper
import com.task.infrastructure.llm.config.OpenAiCompatibleConfig
import com.task.infrastructure.llm.model.LlmResponse
import org.slf4j.LoggerFactory
import org.springframework.beans.factory.annotation.Qualifier
import org.springframework.http.MediaType
import org.springframework.stereotype.Component
import org.springframework.web.reactive.function.client.WebClient
import org.springframework.web.reactive.function.client.WebClientResponseException
import reactor.core.publisher.Flux

data class OpenAiCompatibleRequest(
    val userContent: String,
    val systemPrompt: String? = null,
    val apiKeyOverride: String? = null,
    val sceneKey: String? = null,
    val forceJsonObject: Boolean = false
)

@Component
class OpenAiCompatibleClient(
    @Qualifier("llmWebClient")
    private val webClient: WebClient,
    private val llmConfig: OpenAiCompatibleConfig,
    private val objectMapper: ObjectMapper
) {
    private val logger = LoggerFactory.getLogger(OpenAiCompatibleClient::class.java)

    fun generateText(request: OpenAiCompatibleRequest): Flux<LlmResponse> {
        val apiKey = llmConfig.apiKey.ifBlank { request.apiKeyOverride ?: "" }
        if (apiKey.isBlank()) {
            return Flux.just(
                LlmResponse(
                    id = "",
                    content = "LLM API Key 未配置，请先在配置文件中设置 llm.api.key。",
                    success = false,
                    errorMessage = "llm.api.key is blank",
                    isEnd = true
                )
            )
        }

        val messages = buildMessages(request)
        val requestBody = linkedMapOf<String, Any>(
            "model" to llmConfig.model,
            "messages" to messages
        )
        if (request.forceJsonObject) {
            requestBody["response_format"] = mapOf("type" to "json_object")
        }

        logger.debug(
            "发送OpenAI兼容请求: sceneKey={}, model={}, hasSystemPrompt={}, forceJsonObject={}, systemPromptLength={}, userContentLength={}",
            request.sceneKey ?: "unknown",
            llmConfig.model,
            !request.systemPrompt.isNullOrBlank(),
            request.forceJsonObject,
            request.systemPrompt?.length ?: 0,
            request.userContent.length
        )

        return executeChatCompletion(apiKey, requestBody)
            .onErrorResume { e ->
                if (request.forceJsonObject && isResponseFormatUnsupported(e)) {
                    logger.warn(
                        "当前网关可能不支持 response_format=json_object，回退重试: sceneKey={}, model={}",
                        request.sceneKey ?: "unknown",
                        llmConfig.model
                    )
                    val fallbackBody = linkedMapOf<String, Any>(
                        "model" to llmConfig.model,
                        "messages" to messages
                    )
                    return@onErrorResume executeChatCompletion(apiKey, fallbackBody)
                }
                Flux.error(e)
            }
            .onErrorResume(WebClientResponseException::class.java) { e ->
                val bodyPreview = e.responseBodyAsString?.trim().orEmpty().take(500)
                logger.error(
                    "调用OpenAI兼容接口失败: sceneKey={}, model={}, status={}, responseBody={}",
                    request.sceneKey ?: "unknown",
                    llmConfig.model,
                    e.statusCode.value(),
                    bodyPreview.ifBlank { "empty" }
                )
                Flux.just(
                    LlmResponse(
                        id = "",
                        content = "无法生成AI分析，请稍后再试。",
                        success = false,
                        errorMessage = "HTTP ${e.statusCode.value()}: ${bodyPreview.ifBlank { e.message ?: "unknown error" }}",
                        isEnd = true
                    )
                )
            }
            .onErrorResume { e ->
                val rootCause = findRootCause(e)
                logger.error(
                    "调用OpenAI兼容接口失败: sceneKey={}, model={}, errorType={}, rootCauseType={}, rootCauseMessage={}",
                    request.sceneKey ?: "unknown",
                    llmConfig.model,
                    e::class.java.name,
                    rootCause::class.java.name,
                    rootCause.message ?: "null",
                    e
                )
                Flux.just(
                    LlmResponse(
                        id = "",
                        content = "无法生成AI分析，请稍后再试。",
                        success = false,
                        errorMessage = rootCause.message ?: e.message ?: rootCause::class.java.simpleName,
                        isEnd = true
                    )
                )
            }
    }

    private fun executeChatCompletion(apiKey: String, requestBody: Map<String, Any>): Flux<LlmResponse> {
        return webClient.post()
            .uri("/v1/chat/completions")
            .header("Authorization", "Bearer $apiKey")
            .contentType(MediaType.APPLICATION_JSON)
            .bodyValue(requestBody)
            .retrieve()
            .bodyToMono(String::class.java)
            .map { parseResponse(it) }
            .flux()
    }

    private fun isResponseFormatUnsupported(error: Throwable): Boolean {
        val webError = error as? WebClientResponseException ?: return false
        if (!webError.statusCode.is4xxClientError) {
            return false
        }
        val message = (webError.responseBodyAsString ?: webError.message ?: "").lowercase()
        return message.contains("response_format") || message.contains("json_object")
    }

    private fun buildMessages(request: OpenAiCompatibleRequest): List<Map<String, String>> {
        val messages = mutableListOf<Map<String, String>>()
        request.systemPrompt?.takeIf { it.isNotBlank() }?.let { prompt ->
            messages.add(
                mapOf(
                    "role" to "system",
                    "content" to prompt
                )
            )
        }

        messages.add(
            mapOf(
                "role" to "user",
                "content" to request.userContent
            )
        )
        return messages
    }

    private fun parseResponse(rawResponse: String): LlmResponse {
        return try {
            val root = objectMapper.readTree(rawResponse)
            val id = root.path("id").asText("")
            val choices = root.path("choices")
            val firstChoice = if (choices.isArray && choices.size() > 0) choices[0] else null
            val content = firstChoice?.path("message")?.path("content")?.asText("") ?: ""
            val totalTokens = root.path("usage").path("total_tokens").asInt(0)

            LlmResponse(
                id = id,
                content = content,
                success = true,
                isEnd = true,
                totalTokens = totalTokens
            )
        } catch (e: Exception) {
            logger.error("解析大模型响应失败: {}", rawResponse, e)
            LlmResponse(
                id = "",
                content = "解析大模型响应失败: ${e.message}",
                success = false,
                errorMessage = e.message,
                isEnd = true
            )
        }
    }

    private fun findRootCause(throwable: Throwable): Throwable {
        var current: Throwable = throwable
        while (current.cause != null && current.cause !== current) {
            current = current.cause!!
        }
        return current
    }
}
