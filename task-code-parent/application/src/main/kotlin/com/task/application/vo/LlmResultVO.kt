package com.task.application.vo

import com.task.domain.model.llm.LlmResult

/**
 * LLM结果视图对象
 */
data class LlmResultVO(
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
     */
    val type: Int,
    
    /**
     * 额外的前端展示信息（如果需要）
     */
    val displayInfo: Map<String, Any>? = null
) {
    companion object {
        /**
         * 从领域模型转换为VO
         */
        fun fromDomain(domain: LlmResult, displayInfo: Map<String, Any>? = null): LlmResultVO {
            return LlmResultVO(
                content = domain.content,
                success = domain.success,
                errorMessage = domain.errorMessage,
                type = domain.type,
                displayInfo = displayInfo
            )
        }
    }
}
