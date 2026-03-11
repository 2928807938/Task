package com.task.infrastructure.persistence.mapper

import com.task.infrastructure.persistence.record.TaskHistoryRecord
import org.springframework.data.r2dbc.repository.R2dbcRepository

/**
 * 任务历史记录Mapper接口
 */
interface TaskHistoryMapper : R2dbcRepository<TaskHistoryRecord, Long> {
}
