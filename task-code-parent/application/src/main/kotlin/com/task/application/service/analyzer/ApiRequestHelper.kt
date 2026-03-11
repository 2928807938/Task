package com.task.application.service.analyzer

import com.task.domain.model.llm.LlmResultTypeEnum
import com.task.domain.service.LlmService
import org.slf4j.LoggerFactory
import org.springframework.stereotype.Component
import reactor.core.publisher.Flux

/**
 * 通用API请求工具类
 * 提供与大语言模型交互的能力，接收场景键，返回原始内容，不做任何处理
 */
@Component
class ApiRequestHelper(private val llmService: LlmService) {
    private val logger = LoggerFactory.getLogger(javaClass)

    /**
     * 发送流式请求
     *
     * @param sceneKey 场景键
     * @param payload 请求体数据
     * @return 流式响应内容
     */
    fun postStream(sceneKey: String, payload: Any): Flux<String> {
        logger.debug("发送流式LLM请求，payload: $payload")
        
        // 如果payload是Map类型，直接使用它作为inputs
        val inputs = when (payload) {
            is Map<*, *> -> payload.filterKeys { it is String } as Map<String, Any>
            else -> mapOf("content" to payload.toString())
        }

        val content = when (payload) {
            is Map<*, *> -> {
                val mappedPayload = payload.filterKeys { it is String } as Map<String, Any?>
                listOf("user_input", "content", "description", "comprehensive_analysis")
                    .asSequence()
                    .mapNotNull { key -> mappedPayload[key]?.toString()?.takeIf { it.isNotBlank() } }
                    .firstOrNull()
                    ?: payload.toString()
            }
            else -> payload.toString()
        }
        
        // 流式请求的主要部分
        val mainFlow = llmService.generateText(content, sceneKey, inputs = inputs)
            .map { result -> 
                result.content
            }
            
        // 使用concat确保完成事件在所有响应之后发送
        return mainFlow
            .concatWith(Flux.create { sink ->
                // 当主流程完成时，发送结束标识
                logger.debug("流式LLM请求完成")
                sink.complete()
            })
            .doOnNext { result -> 
                logger.debug("发送流式响应: {}", result.take(50) + (if (result.length > 50) "..." else ""))
            }
            .onErrorResume { error ->
                logger.error("流式LLM请求失败: ${error.message}")
                Flux.just(
                    "流式LLM请求失败: ${error.message}",
                    "{\"type\":${LlmResultTypeEnum.ANALYSIS_ERROR.code},\"content\":\"分析失败\"}"
                )
            }
    }
}
