package com.task.infrastructure.persistence.repositoryImpl

import com.task.domain.model.project.ProjectStatusTransition
import com.task.domain.repository.ProjectStatusTransitionRepository
import com.task.infrastructure.id.IdGeneratorService
import com.task.infrastructure.persistence.base.BaseRepository
import com.task.infrastructure.persistence.mapper.ProjectStatusTransitionMapper
import com.task.infrastructure.persistence.record.ProjectStatusTransitionRecord
import org.springframework.data.r2dbc.core.R2dbcEntityTemplate
import org.springframework.stereotype.Repository
import kotlin.reflect.KClass

/**
 * 项目状态转换存储库实现类
 */
@Repository
class ProjectStatusTransitionRepositoryImpl(
    override val mapper: ProjectStatusTransitionMapper,
    override val template: R2dbcEntityTemplate,
    override val idGenerator: IdGeneratorService
) : BaseRepository<ProjectStatusTransition, ProjectStatusTransitionRecord, ProjectStatusTransitionMapper>(), ProjectStatusTransitionRepository {

    override val entityClass: KClass<ProjectStatusTransitionRecord> = ProjectStatusTransitionRecord::class

    override fun getId(entity: ProjectStatusTransition): Long {
        return entity.id
    }

    /**
     * 将数据库记录转换为领域模型
     *
     * @param record 状态转换数据库记录
     * @return 状态转换领域模型
     * @throws IllegalArgumentException 如果记录ID为空
     */
    override fun toEntity(record: ProjectStatusTransitionRecord): ProjectStatusTransition {
        return ProjectStatusTransition(
            id = record.id ?: throw IllegalArgumentException("Record ID cannot be null"),
            projectId = record.projectId,
            fromStatusId = record.fromStatusId,
            toStatusId = record.toStatusId,
            eventCode = record.eventCode,
            guardCondition = record.guardCondition,
            actionCode = record.actionCode,
            isEnabled = record.isEnabled,
            createdAt = record.createdAt!!,
            updatedAt = record.updatedAt,
            version = record.version
        )
    }
    
    /**
     * 将领域模型转换为数据库记录
     *
     * @param entity 状态转换领域模型
     * @return 状态转换数据库记录
     */
    override fun toRecord(entity: ProjectStatusTransition): ProjectStatusTransitionRecord {
        return ProjectStatusTransitionRecord(
            projectId = entity.projectId,
            fromStatusId = entity.fromStatusId,
            toStatusId = entity.toStatusId,
            eventCode = entity.eventCode,
            guardCondition = entity.guardCondition,
            actionCode = entity.actionCode,
            isEnabled = entity.isEnabled
        ).apply {
            id = entity.id
            version = entity.version
            createdAt = entity.createdAt
            updatedAt = entity.updatedAt
        }
    }
}
