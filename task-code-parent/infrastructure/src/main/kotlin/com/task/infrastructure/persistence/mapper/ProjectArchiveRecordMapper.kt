package com.task.infrastructure.persistence.mapper

import com.task.infrastructure.persistence.record.ProjectArchiveRecordRecord
import org.springframework.data.repository.reactive.ReactiveCrudRepository

/**
 * 项目归档记录映射器
 * 负责数据库记录和领域模型之间的映射
 */
interface ProjectArchiveRecordMapper : ReactiveCrudRepository<ProjectArchiveRecordRecord, Long> {
    
}
