package com.task.application.service.analyzer

import com.task.domain.model.llm.LlmResult
import reactor.core.publisher.Flux

/**
 * LLM分析器接口
 * 定义所有分析器的通用方法
 */
interface LlmAnalyzer {
    /**
     * 分析内容，返回LLM的原始响应
     * 非阻塞实现，返回Flux<LlmResult>
     *
     * @param content 待分析的内容
     * @param projectId 可选的项目ID，默认为null
     * @return 大模型原始响应的Flux
     */
    fun analyze(content: String, projectId: Long? = null, inputs: Map<String, Any> = emptyMap()): Flux<LlmResult>
}