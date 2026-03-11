package com.task.infrastructure.persistence.repositoryImpl

import com.task.domain.model.task.TaskTag
import com.task.domain.repository.TaskTagRepository
import com.task.infrastructure.id.IdGeneratorService
import com.task.infrastructure.persistence.base.BaseRepository
import com.task.infrastructure.persistence.mapper.TaskTagMapper
import com.task.infrastructure.persistence.record.TaskTagRecord
import org.springframework.data.r2dbc.core.R2dbcEntityTemplate
import org.springframework.stereotype.Repository
import kotlin.reflect.KClass

/**
 * TaskTagRepository接口的实现类
 * 实现任务标签关联相关的数据访问操作
 */
@Repository
class TaskTagRepositoryImpl(
    override val mapper: TaskTagMapper,
    override val template: R2dbcEntityTemplate,
    override val idGenerator: IdGeneratorService
) : BaseRepository<TaskTag, TaskTagRecord, TaskTagMapper>(), TaskTagRepository {

    override val entityClass: KClass<TaskTagRecord> = TaskTagRecord::class

    override fun getId(entity: TaskTag): Long {
        return entity.id
    }

    /**
     * 将数据库记录转换为领域模型
     *
     * @param record 任务标签关联数据库记录
     * @return 任务标签关联领域模型
     */
    override fun toEntity(record: TaskTagRecord): TaskTag {
        return TaskTag(
            id = record.id ?: throw IllegalArgumentException("任务标签关联ID不能为空"),
            taskId = record.taskId,
            task = null, // 需要通过关联查询获取
            tagId = record.tagId,
            tag = null, // 需要通过关联查询获取
            createdAt = record.createdAt!!,
            updatedAt = record.updatedAt,
            version = record.version
        )
    }

    /**
     * 将领域模型转换为数据库记录
     *
     * @param entity 任务标签关联领域模型
     * @return 任务标签关联数据库记录
     */
    override fun toRecord(entity: TaskTag): TaskTagRecord {
        return TaskTagRecord(
            taskId = entity.taskId,
            tagId = entity.tagId
        ).apply {
            id = entity.id
            version = entity.version
            createdAt = entity.createdAt
            updatedAt = entity.updatedAt
        }
    }
}
