package com.task.application.service.analyzer

import com.task.domain.model.llm.LlmResult
import com.task.domain.service.LlmService
import org.slf4j.LoggerFactory
import org.springframework.stereotype.Service
import reactor.core.publisher.Flux

/**
 * 任务拆分分析器
 * 用于分析需求内容，将其拆分为具体的任务项和子任务
 */
@Service("taskBreakdownAnalyzer")
class TaskBreakdownAnalyzer(
    private val llmService: LlmService
) : LlmAnalyzer {
    private val logger = LoggerFactory.getLogger(TaskBreakdownAnalyzer::class.java)

    /**
     * 分析需求内容，拆分任务并估算工作量
     * 非阻塞实现，返回Flux<LlmResult>
     *
     * @param content 需求内容
     * @param projectId 项目ID，可选
     * @param inputs 额外的输入参数，可选
     * @return 大模型原始响应的Flux
     */
    override fun analyze(content: String, projectId: Long?, inputs: Map<String, Any>): Flux<LlmResult> {
        val conversationId = inputs["_conversation_id"]?.toString()

        // 调用领域层的LlmService
        // 使用专门为任务拆分和工作量分析配置的应用ID
        return llmService.generateText(content, "任务拆分", conversationId = conversationId, inputs = inputs)
            .doOnSubscribe { logger.debug("任务拆分和工作量分析订阅开始") }
            .doOnNext { result -> logger.debug("任务拆分和工作量分析返回结果: {}", result.content.take(100)) }
            .doOnComplete { logger.info("任务拆分和工作量分析完成") }
            .doOnError { e -> logger.error("任务拆分和工作量分析发生错误: {}", e.message, e) }
    }
}
