package com.task.infrastructure.persistence.record

import com.task.infrastructure.persistence.base.BaseRecord
import org.springframework.data.relational.core.mapping.Table

/**
 * LLM提示词配置记录。
 */
@Table("t_llm_prompt_config")
data class LlmPromptConfigRecord(
    val scopeType: String,
    val scopeObjectId: Long,
    val promptName: String,
    val promptContent: String,
    val allSceneEnabled: Int = 0,
    val sceneKeysJson: String? = null,
    val status: String,
    val priority: Int = 0
) : BaseRecord()
