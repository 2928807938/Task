package com.task.infrastructure.persistence.mapper

import com.task.infrastructure.persistence.record.TaskDependencyRecord
import org.springframework.data.r2dbc.repository.R2dbcRepository
import org.springframework.stereotype.Repository

/**
 * 任务依赖关系数据映射接口
 * 定义与数据库交互的基本操作
 */
@Repository
interface TaskDependencyMapper : R2dbcRepository<TaskDependencyRecord, Long> {
}
