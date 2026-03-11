package com.task.infrastructure.persistence.repositoryImpl

import com.task.domain.model.task.TaskComment
import com.task.domain.repository.TaskCommentRepository
import com.task.infrastructure.id.IdGeneratorService
import com.task.infrastructure.persistence.base.BaseRepository
import com.task.infrastructure.persistence.mapper.TaskCommentMapper
import com.task.infrastructure.persistence.record.TaskCommentRecord
import org.springframework.data.r2dbc.core.R2dbcEntityTemplate
import org.springframework.stereotype.Repository
import kotlin.reflect.KClass

/**
 * TaskCommentRepository接口的实现类
 * 实现任务评论相关的数据访问操作
 */
@Repository
class TaskCommentRepositoryImpl(
    override val mapper: TaskCommentMapper,
    override val template: R2dbcEntityTemplate,
    override val idGenerator: IdGeneratorService
) : BaseRepository<TaskComment, TaskCommentRecord, TaskCommentMapper>(), TaskCommentRepository {

    override val entityClass: KClass<TaskCommentRecord> = TaskCommentRecord::class

    override fun getId(entity: TaskComment): Long {
        return entity.id
    }

    /**
     * 将数据库记录转换为领域模型
     *
     * @param record 任务评论数据库记录
     * @return 任务评论领域模型
     */
    override fun toEntity(record: TaskCommentRecord): TaskComment {
        return TaskComment(
            id = record.id ?: throw IllegalArgumentException("评论ID不能为空"),
            taskId = record.taskId,
            task = null, // 需要通过关联查询获取
            content = record.content,
            authorId = record.authorId,
            author = null, // 需要通过关联查询获取
            parentCommentId = record.parentCommentId,
            parentComment = null, // 需要通过关联查询获取
            replies = emptyList(), // 需要通过关联查询获取
            createdAt = record.createdAt!!,
            updatedAt = record.updatedAt,
            version = record.version
        )
    }

    /**
     * 将领域模型转换为数据库记录
     *
     * @param entity 任务评论领域模型
     * @return 任务评论数据库记录
     */
    override fun toRecord(entity: TaskComment): TaskCommentRecord {
        return TaskCommentRecord(
            taskId = entity.taskId,
            authorId = entity.authorId,
            content = entity.content,
            parentCommentId = entity.parentCommentId
        ).apply {
            id = entity.id
            version = entity.version
            createdAt = entity.createdAt
            updatedAt = entity.updatedAt
        }
    }
}
