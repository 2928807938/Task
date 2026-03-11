package com.task.infrastructure.persistence.repositoryImpl

import com.task.domain.model.task.OperationType
import com.task.domain.model.task.TaskHistory
import com.task.domain.repository.TaskHistoryRepository
import com.task.infrastructure.id.IdGeneratorService
import com.task.infrastructure.persistence.base.BaseRepository
import com.task.infrastructure.persistence.mapper.TaskHistoryMapper
import com.task.infrastructure.persistence.record.TaskHistoryRecord
import org.slf4j.LoggerFactory
import org.springframework.data.r2dbc.core.R2dbcEntityTemplate
import org.springframework.stereotype.Repository
import kotlin.reflect.KClass

/**
 * 任务历史记录仓库实现类
 */
@Repository
class TaskHistoryRepositoryImpl(
    override val mapper: TaskHistoryMapper,
    override val template: R2dbcEntityTemplate,
    override val idGenerator: IdGeneratorService
) : BaseRepository<TaskHistory, TaskHistoryRecord, TaskHistoryMapper>(), TaskHistoryRepository {

    private val log = LoggerFactory.getLogger(this::class.java)
    
    override val entityClass: KClass<TaskHistoryRecord> = TaskHistoryRecord::class

    override fun getId(entity: TaskHistory): Long {
        return entity.id ?: 0
    }
    
    /**
     * 将数据库记录转换为领域模型
     */
    override fun toEntity(record: TaskHistoryRecord): TaskHistory {
        return TaskHistory(
            id = record.id,
            taskId = record.taskId,
            userId = record.userId,
            operationType = OperationType.valueOf(record.operationType),
            oldValue = record.oldValue,
            newValue = record.newValue,
            fieldName = record.fieldName,
            description = record.description,
            isMainTask = record.isMainTask,
            createdAt = record.createdAt,
            updatedAt = record.updatedAt,
            version = record.version
        )
    }
    
    /**
     * 将领域模型转换为数据库记录
     */
    override fun toRecord(entity: TaskHistory): TaskHistoryRecord {
        return TaskHistoryRecord(
            taskId = entity.taskId,
            userId = entity.userId,
            operationType = entity.operationType.name,
            oldValue = entity.oldValue,
            newValue = entity.newValue,
            fieldName = entity.fieldName,
            description = entity.description,
            isMainTask = entity.isMainTask
        ).apply {
            id = entity.id
            version = entity.version
            createdAt = entity.createdAt
            updatedAt = entity.updatedAt
        }
    }
}
