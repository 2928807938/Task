package com.task.infrastructure.persistence.mapper

import com.task.infrastructure.persistence.record.LlmPromptHitLogRecord
import org.springframework.data.repository.reactive.ReactiveCrudRepository
import org.springframework.stereotype.Repository

/**
 * LLM提示词命中日志数据访问接口。
 */
@Repository
interface LlmPromptHitLogMapper : ReactiveCrudRepository<LlmPromptHitLogRecord, Long>
