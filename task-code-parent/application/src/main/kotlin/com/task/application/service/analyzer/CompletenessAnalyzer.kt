package com.task.application.service.analyzer

import com.task.domain.model.llm.LlmResult
import com.task.domain.service.LlmService
import org.slf4j.LoggerFactory
import org.springframework.stereotype.Service
import reactor.core.publisher.Flux

/**
 * 完整度分析器
 * 用于分析需求内容的完整度，检查需求是否满足完整性标准
 */
@Service("completenessAnalyzer")
class CompletenessAnalyzer(
    private val llmService: LlmService,
) : LlmAnalyzer {
    private val logger = LoggerFactory.getLogger(CompletenessAnalyzer::class.java)

    /**
     * 分析需求完整度
     * 非阻塞实现，返回Flux<LlmResult>
     *
     * @param content 需求内容
     * @param projectId 项目ID，此分析器不使用此参数
     * @return 大模型原始响应的Flux
     */
    override fun analyze(content: String, projectId: Long?, inputs: Map<String, Any>): Flux<LlmResult> {
        if (content.isBlank()) {
            logger.warn("需求内容为空，无法进行完整度分析")
            return Flux.just(LlmResult("", true))
        }

        val conversationId = inputs["_conversation_id"]?.toString()

        // 调用领域层的LlmService
        return llmService.generateText(content, "需求完整度检查", conversationId = conversationId, inputs = inputs)
    }
}
