package com.task.infrastructure.persistence.mapper

import com.task.infrastructure.persistence.record.RequirementWorkloadRecord
import org.springframework.data.repository.reactive.ReactiveCrudRepository
import org.springframework.stereotype.Repository

/**
 * 需求工作量记录数据访问接口
 * 提供对需求工作量记录表的响应式CRUD操作
 */
@Repository
interface RequirementWorkloadMapper : ReactiveCrudRepository<RequirementWorkloadRecord, Long>