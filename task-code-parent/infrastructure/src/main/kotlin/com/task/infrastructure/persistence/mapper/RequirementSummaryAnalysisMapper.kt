package com.task.infrastructure.persistence.mapper

import com.task.infrastructure.persistence.record.RequirementSummaryAnalysisRecord
import org.springframework.data.repository.reactive.ReactiveCrudRepository
import org.springframework.stereotype.Repository

/**
 * 需求摘要分析记录数据访问接口
 * 提供对需求摘要分析记录表的响应式CRUD操作
 */
@Repository
interface RequirementSummaryAnalysisMapper : ReactiveCrudRepository<RequirementSummaryAnalysisRecord, Long> 