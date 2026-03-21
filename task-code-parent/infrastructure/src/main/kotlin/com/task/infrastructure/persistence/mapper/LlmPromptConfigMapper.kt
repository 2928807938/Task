package com.task.infrastructure.persistence.mapper

import com.task.infrastructure.persistence.record.LlmPromptConfigRecord
import org.springframework.data.repository.reactive.ReactiveCrudRepository
import org.springframework.stereotype.Repository

/**
 * LLM提示词配置数据访问接口。
 */
@Repository
interface LlmPromptConfigMapper : ReactiveCrudRepository<LlmPromptConfigRecord, Long>
