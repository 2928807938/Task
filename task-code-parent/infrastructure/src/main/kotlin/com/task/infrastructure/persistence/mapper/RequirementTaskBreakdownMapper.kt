package com.task.infrastructure.persistence.mapper

import com.task.infrastructure.persistence.record.RequirementTaskBreakdownRecord
import org.springframework.data.repository.reactive.ReactiveCrudRepository
import org.springframework.stereotype.Repository

/**
 * 需求任务拆解记录数据访问接口
 * 提供对需求任务拆解记录表的响应式CRUD操作
 */
@Repository
interface RequirementTaskBreakdownMapper : ReactiveCrudRepository<RequirementTaskBreakdownRecord, Long> 