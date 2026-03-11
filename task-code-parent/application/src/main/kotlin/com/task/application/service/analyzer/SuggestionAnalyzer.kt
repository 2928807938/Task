package com.task.application.service.analyzer

import com.task.domain.model.llm.LlmResult
import com.task.domain.service.LlmService
import org.slf4j.LoggerFactory
import org.springframework.stereotype.Service
import reactor.core.publisher.Flux

/**
 * 建议分析器
 * 用于分析需求内容，提供改进建议
 */
@Service("suggestionAnalyzer")
class SuggestionAnalyzer(
    private val llmService: LlmService
) : LlmAnalyzer {
    private val logger = LoggerFactory.getLogger(SuggestionAnalyzer::class.java)

    /**
     * 分析需求内容，提供改进建议
     * 非阻塞实现，返回Flux<LlmResult>
     *
     * @param content 需求内容
     * @param projectId 项目ID，此分析器不使用此参数
     * @return 大模型原始响应的Flux
     */
    override fun analyze(content: String, projectId: Long?, inputs: Map<String, Any>): Flux<LlmResult> {
        if (content.isBlank()) {
            logger.warn("需求内容为空，无法提供改进建议")
            return Flux.just(LlmResult("", true))
        }
        val conversationId = inputs["_conversation_id"]?.toString()

        logger.info("开始分析需求内容，提供改进建议，内容长度: {}", content.length)

        // 调用领域层的LlmService
        // 使用专门为建议分析配置的应用ID
        return llmService.generateText(content, "智能建议", conversationId = conversationId, inputs = inputs)
            .doOnSubscribe { logger.debug("建议分析订阅开始") }
            .doOnNext { result -> logger.debug("建议分析返回结果: {}", result.content.take(100)) }
            .doOnComplete { logger.info("建议分析完成") }
            .doOnError { e -> logger.error("建议分析发生错误: {}", e.message, e) }
    }
}
