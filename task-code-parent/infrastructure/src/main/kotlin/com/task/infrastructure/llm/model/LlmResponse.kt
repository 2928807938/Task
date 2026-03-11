package com.task.infrastructure.llm.model

import java.time.OffsetDateTime

/**
 * LLM响应模型
 */
data class LlmResponse(
    /**
     * 消息ID
     */
    val id: String,

    /**
     * 对话ID（对话模式）
     */
    val conversationId: String? = null,

    /**
     * 响应内容
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
     * 响应时间
     */
    val timestamp: OffsetDateTime = OffsetDateTime.now(),
    
    /**
     * 是否为消息结束标识
     */
    val isEnd: Boolean = false,
    
    /**
     * 总Token数（仅在消息结束时有效）
     */
    val totalTokens: Int = 0
) {
    /**
     * 从响应内容中提取标题和正文
     *
     * @return 标题和正文对
     */
    fun extractTitleAndBody(): Pair<String, String> {
        val lines = content.trim().split("\n")
        val titleLine = lines.firstOrNull {
            it.startsWith("标题：") || it.startsWith("# ") || it.startsWith("**")
        }

        return if (titleLine != null) {
            val title = when {
                titleLine.startsWith("标题：") -> titleLine.substringAfter("标题：").trim()
                titleLine.startsWith("# ") -> titleLine.substringAfter("# ").trim()
                titleLine.startsWith("**") -> titleLine.trim('*', ' ')
                else -> titleLine.trim()
            }
            val bodyStartIndex = lines.indexOf(titleLine) + 1
            val body = if (bodyStartIndex < lines.size) {
                lines.subList(bodyStartIndex, lines.size).joinToString("\n").trim()
            } else {
                ""
            }
            Pair(title, body)
        } else {
            // 如果没有找到标题行，使用默认标题
            Pair("任务优化建议", content.trim())
        }
    }
}