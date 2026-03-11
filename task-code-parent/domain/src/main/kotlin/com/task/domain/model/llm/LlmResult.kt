package com.task.domain.model.llm

/**
 * LLM结果
 */
data class LlmResult(
    /**
     * 生成的内容
     */
    val content: String,

    /**
     * 是否成功
     */
    val success: Boolean,

    /**
     * 错误信息
     */
    val errorMessage: String? = null,

    /**
     * 结果类型
     * 用于标识不同类型的LLM响应
     */
    val type: Int = LlmResultTypeEnum.UNKNOWN.code
)