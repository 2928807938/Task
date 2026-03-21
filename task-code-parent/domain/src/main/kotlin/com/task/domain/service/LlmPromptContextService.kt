package com.task.domain.service

import com.task.domain.model.llm.prompt.PromptInspectionResult
import com.task.domain.model.llm.prompt.ResolvedPromptContext
import reactor.core.publisher.Mono

/**
 * LLM提示词上下文领域服务接口。
 * 负责提示词上下文解析、内容检查与命中日志记录能力的抽象。
 */
interface LlmPromptContextService {
    /**
     * 解析指定场景下的提示词上下文。
     *
     * @param sceneKey 场景标识
     * @param inputs 解析时使用的输入参数
     * @return 解析后的提示词上下文
     */
    fun resolve(sceneKey: String, inputs: Map<String, Any>): Mono<ResolvedPromptContext>

    /**
     * 检查并清洗提示词内容。
     *
     * @param rawContent 原始提示词内容
     * @return 提示词内容检查结果
     */
    fun inspectContent(rawContent: String): PromptInspectionResult

    /**
     * 记录提示词命中日志。
     *
     * @param resolvedPromptContext 已解析的提示词上下文
     * @return 记录结果
     */
    fun recordHit(resolvedPromptContext: ResolvedPromptContext): Mono<Void>
}
