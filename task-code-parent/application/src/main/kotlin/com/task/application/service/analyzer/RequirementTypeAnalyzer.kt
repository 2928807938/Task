package com.task.application.service.analyzer

import com.task.domain.model.llm.LlmResult
import com.task.domain.service.LlmService
import org.springframework.stereotype.Service
import reactor.core.publisher.Flux

/**
 * 需求类型分析器
 * 用于分析需求内容，提取需求类型
 */
@Service("requirementTypeAnalyzer")
class RequirementTypeAnalyzer(
    private val llmService: LlmService
) : LlmAnalyzer {

    /**
     * 分析需求内容，直接返回大模型的原始响应
     * 非阻塞实现，返回Flux<LlmResult>
     *
     * @param content 需求内容
     * @param projectId 项目ID，此分析器不使用此参数
     * @return 大模型原始响应的Flux
     */
    override fun analyze(content: String, projectId: Long?, inputs: Map<String, Any>): Flux<LlmResult> {
        if (content.isBlank()) {
            return Flux.just(LlmResult("", true))
        }
        val conversationId = inputs["_conversation_id"]?.toString()

        // 调用领域层的LlmService
        return llmService.generateText(content, "需求分类", conversationId = conversationId, inputs = inputs)
    }
}
