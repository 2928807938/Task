package com.task.infrastructure.persistence.repositoryImpl

import com.task.domain.model.task.Task
import com.task.domain.repository.TaskRepository
import com.task.infrastructure.id.IdGeneratorService
import com.task.infrastructure.persistence.base.BaseRepository
import com.task.infrastructure.persistence.mapper.TaskMapper
import com.task.infrastructure.persistence.record.TaskRecord
import org.springframework.data.r2dbc.core.R2dbcEntityTemplate
import org.springframework.stereotype.Repository
import kotlin.reflect.KClass

/**
 * TaskRepository接口的实现类
 * 实现任务相关的数据访问操作
 */
@Repository
class TaskRepositoryImpl(
    override val mapper: TaskMapper,
    override val template: R2dbcEntityTemplate,
    override val idGenerator: IdGeneratorService
) : BaseRepository<Task, TaskRecord,  TaskMapper>(), TaskRepository {

    override val entityClass: KClass<TaskRecord> = TaskRecord::class

    override fun getId(entity: Task): Long {
        return entity.id
    }

    /**
     * 将数据库记录转换为领域模型
     *
     * @param record 任务数据库记录
     * @return 任务领域模型
     */
    override fun toEntity(record: TaskRecord): Task {
        return Task(
            id = record.id ?: throw IllegalArgumentException("任务ID不能为空"),
            title = record.title,
            description = record.description,
            projectId = record.projectId,
            project = null, // 需要通过关联查询获取
            parentTaskId = record.parentTaskId,
            parentTask = null, // 需要通过关联查询获取
            subTasks = emptyList(), // 需要通过关联查询获取
            statusId = record.statusId,
            status = null, // 需要通过关联查询获取
            priorityId = record.priorityId,
            creatorId = record.creatorId,
            creator = null, // 需要通过关联查询获取
            assigneeId = record.assigneeId,
            startTime = record.startTime,
            dueDate = record.dueDate,
            tags = emptyList(), // 需要通过关联查询获取
            comments = emptyList(), // 需要通过关联查询获取
            timeEntries = emptyList(), // 需要通过关联查询获取
            createdAt = record.createdAt!!,
            updatedAt = record.updatedAt,
            version = record.version
        )
    }

    /**
     * 将领域模型转换为数据库记录
     *
     * @param entity 任务领域模型
     * @return 任务数据库记录
     */
    override fun toRecord(entity: Task): TaskRecord {
        return TaskRecord(
            title = entity.title,
            description = entity.description,
            projectId = entity.projectId,
            parentTaskId = entity.parentTaskId,
            statusId = entity.statusId,
            priorityId = entity.priorityId,
            creatorId = entity.creatorId,
            assigneeId = entity.assigneeId,
            startTime = entity.startTime,
            dueDate = entity.dueDate
        ).apply {
            id = entity.id
            version = entity.version
            createdAt = entity.createdAt
            updatedAt = entity.updatedAt
        }
    }
}
