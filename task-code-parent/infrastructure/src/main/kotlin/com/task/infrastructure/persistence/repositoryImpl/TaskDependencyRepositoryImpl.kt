package com.task.infrastructure.persistence.repositoryImpl

import com.task.domain.model.task.TaskDependency
import com.task.domain.repository.TaskDependencyRepository
import com.task.infrastructure.id.IdGeneratorService
import com.task.infrastructure.persistence.base.BaseRepository
import com.task.infrastructure.persistence.mapper.TaskDependencyMapper
import com.task.infrastructure.persistence.record.TaskDependencyRecord
import org.springframework.data.r2dbc.core.R2dbcEntityTemplate
import org.springframework.stereotype.Repository
import java.time.OffsetDateTime
import kotlin.reflect.KClass

/**
 * TaskDependencyRepository接口的实现类
 * 实现任务依赖关系相关的数据访问操作
 */
@Repository
class TaskDependencyRepositoryImpl(
    override val mapper: TaskDependencyMapper,
    override val template: R2dbcEntityTemplate,
    override val idGenerator: IdGeneratorService
) : BaseRepository<TaskDependency, TaskDependencyRecord, TaskDependencyMapper>(), TaskDependencyRepository {

    override val entityClass: KClass<TaskDependencyRecord> = TaskDependencyRecord::class

    override fun getId(entity: TaskDependency): Long {
        return entity.id ?: throw IllegalArgumentException("任务依赖关系ID不能为空")
    }

    /**
     * 将数据库记录转换为领域模型
     *
     * @param record 任务依赖关系数据库记录
     * @return 任务依赖关系领域模型
     */
    override fun toEntity(record: TaskDependencyRecord): TaskDependency {
        return TaskDependency(
            id = record.id,
            successorTaskId = record.taskId, // 将taskId映射为successorTaskId
            predecessorTaskId = record.dependsOnTaskId, // 将dependsOnTaskId映射为predecessorTaskId
            description = record.description,
            createdAt = record.createdAt ?: OffsetDateTime.now(),
            updatedAt = record.updatedAt,
            version = record.version
        )
    }

    /**
     * 将领域模型转换为数据库记录
     *
     * @param entity 任务依赖关系领域模型
     * @return 任务依赖关系数据库记录
     */
    override fun toRecord(entity: TaskDependency): TaskDependencyRecord {
        return TaskDependencyRecord(
            taskId = entity.successorTaskId, // 将successorTaskId映射为taskId
            dependsOnTaskId = entity.predecessorTaskId, // 将predecessorTaskId映射为dependsOnTaskId
            description = entity.description
        ).apply {
            id = entity.id
            version = entity.version
            createdAt = entity.createdAt
            updatedAt = entity.updatedAt
        }
    }
}
