package com.task.application.service.analyzer

import com.task.domain.model.llm.LlmResult
import com.task.domain.service.LlmService
import org.slf4j.LoggerFactory
import org.springframework.stereotype.Service
import reactor.core.publisher.Flux

/**
 * 总结分析器
 * 用于综合分析所有结果，生成总结报告
 */
@Service
class SummaryAnalyzer(
    private val llmService: LlmService
) : LlmAnalyzer {
    private val logger = LoggerFactory.getLogger(SummaryAnalyzer::class.java)

    /**
     * 综合分析内容，生成总结报告
     * 非阻塞实现，返回Flux<LlmResult>
     *
     * @param content 综合内容（包含其他分析器的结果）
     * @param projectId 项目ID，可选
     * @return 大模型原始响应的Flux
     */
    override fun analyze(content: String, projectId: Long?, inputs: Map<String, Any>): Flux<LlmResult> {
        val conversationId = inputs["_conversation_id"]?.toString()

        // 调用领域层的LlmService
        return llmService.generateText(content = content, apiKey = "分析总结", conversationId = conversationId, inputs = inputs)
            .doOnSubscribe { logger.debug("总结分析订阅开始") }
            .doOnNext { result -> logger.debug("总结分析返回结果: {}", result.content.take(100)) }
            .doOnComplete { logger.info("总结分析完成") }
            .doOnError { e -> logger.error("总结分析发生错误: {}", e.message, e) }
    }
}
