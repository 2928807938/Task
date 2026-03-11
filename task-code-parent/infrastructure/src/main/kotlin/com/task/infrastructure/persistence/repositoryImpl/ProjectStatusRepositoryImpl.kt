package com.task.infrastructure.persistence.repositoryImpl

import com.task.domain.model.project.ProjectStatus
import com.task.domain.repository.ProjectStatusRepository
import com.task.infrastructure.id.IdGeneratorService
import com.task.infrastructure.persistence.base.BaseRepository
import com.task.infrastructure.persistence.mapper.ProjectStatusMapper
import com.task.infrastructure.persistence.record.ProjectStatusRecord
import org.springframework.data.r2dbc.core.R2dbcEntityTemplate
import org.springframework.stereotype.Repository
import kotlin.reflect.KClass

/**
 * ProjectStatusRepository接口的实现类
 * 实现项目状态相关的数据访问操作
 */
@Repository
class ProjectStatusRepositoryImpl(
    override val mapper: ProjectStatusMapper,
    override val template: R2dbcEntityTemplate,
    override val idGenerator: IdGeneratorService
) : BaseRepository<ProjectStatus, ProjectStatusRecord, ProjectStatusMapper>(), ProjectStatusRepository {

    override val entityClass: KClass<ProjectStatusRecord> = ProjectStatusRecord::class

    override fun getId(entity: ProjectStatus): Long {
        return entity.id
    }

    /**
     * 将数据库记录转换为领域模型
     *
     * @param record 项目状态数据库记录
     * @return 项目状态领域模型
     * @throws IllegalArgumentException 如果记录ID为空
     */
    override fun toEntity(record: ProjectStatusRecord): ProjectStatus {
        return ProjectStatus(
            id = record.id ?: throw IllegalArgumentException("Record ID cannot be null"),
            name = record.name,
            description = record.description,
            color = record.color,
            displayOrder = record.displayOrder,
            isDefault = record.isDefault,
            isTerminal = record.isTerminal,
            createdAt = record.createdAt!!,
            updatedAt = record.updatedAt,
            version = record.version
        )
    }

    /**
     * 将领域模型转换为数据库记录
     *
     * @param entity 项目状态领域模型
     * @return 项目状态数据库记录
     */
    override fun toRecord(entity: ProjectStatus): ProjectStatusRecord {
        return ProjectStatusRecord(
            name = entity.name,
            description = entity.description,
            color = entity.color,
            displayOrder = entity.displayOrder,
            isDefault = entity.isDefault,
            isTerminal = entity.isTerminal
        ).apply {
            id = entity.id
            version = entity.version
            createdAt = entity.createdAt
            updatedAt = entity.updatedAt
        }
    }
}
