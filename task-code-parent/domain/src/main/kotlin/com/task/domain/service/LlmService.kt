package com.task.domain.service

import com.task.domain.model.llm.LlmResult
import reactor.core.publisher.Flux

/**
 * LLM服务接口
 * 定义与大语言模型交互的抽象
 */
interface LlmService {

    /**
     * 生成文本
     *
     * @param content 输入内容
     * @param apiKey 场景键（兼容旧参数命名）
     * @param user 用户（可选）
     * @param conversationId 会话id（可选）
     * @param inputs 其他输入变量（可选）
     * @return 生成的文本内容
     */
    fun generateText(content: String, apiKey: String, user: String? = null, conversationId: String? = null, inputs: Map<String, Any> = emptyMap()): Flux<LlmResult>
}
