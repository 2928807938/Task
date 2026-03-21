package com.task.infrastructure.persistence.record

import com.task.infrastructure.persistence.base.BaseRecord
import org.springframework.data.relational.core.mapping.Table

/**
 * LLM提示词命中日志记录。
 */
@Table("t_llm_prompt_hit_log")
data class LlmPromptHitLogRecord(
    val analysisRequestId: String,
    val sceneKey: String,
    val projectId: Long? = null,
    val userId: Long? = null,
    val hitPromptIdsJson: String? = null,
    val finalPromptPreview: String? = null
) : BaseRecord()
