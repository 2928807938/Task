package com.task.application.service.analyzer

import com.task.domain.model.llm.LlmResult
import com.task.domain.service.LlmService
import org.slf4j.LoggerFactory
import org.springframework.stereotype.Service
import reactor.core.publisher.Flux

/**
 * 工作量分析器
 * 用于估算任务的工作量和时间线
 */
@Service("workloadAnalyzer")
class WorkloadAnalyzer(
    private val llmService: LlmService
) : LlmAnalyzer {
    private val logger = LoggerFactory.getLogger(WorkloadAnalyzer::class.java)

    /**
     * 分析任务的工作量和时间线
     * 非阻塞实现，返回Flux<LlmResult>
     *
     * @param content 需求或任务内容
     * @param projectId 项目ID，可选
     * @param inputs 额外的输入参数，可选
     * @return 大模型原始响应的Flux
     */
    override fun analyze(content: String, projectId: Long?, inputs: Map<String, Any>): Flux<LlmResult> {
        val conversationId = inputs["_conversation_id"]?.toString()

        // 调用领域层的LlmService
        return llmService.generateText(content, "工作量分析", conversationId = conversationId, inputs = inputs)
            .doOnSubscribe { logger.debug("工作量分析订阅开始") }
            .doOnNext { result -> logger.debug("工作量分析返回结果: {}", result.content.take(100)) }
            .doOnComplete { logger.info("工作量分析完成") }
            .doOnError { e -> logger.error("工作量分析发生错误: {}", e.message, e) }
    }
}
