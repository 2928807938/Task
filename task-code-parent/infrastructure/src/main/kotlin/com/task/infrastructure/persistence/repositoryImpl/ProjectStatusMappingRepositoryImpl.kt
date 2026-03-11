package com.task.infrastructure.persistence.repositoryImpl

import com.task.domain.model.project.ProjectStatusMapping
import com.task.domain.repository.ProjectStatusMappingRepository
import com.task.infrastructure.id.IdGeneratorService
import com.task.infrastructure.persistence.base.BaseRepository
import com.task.infrastructure.persistence.mapper.ProjectStatusMappingMapper
import com.task.infrastructure.persistence.record.ProjectStatusMappingRecord
import org.springframework.data.r2dbc.core.R2dbcEntityTemplate
import org.springframework.stereotype.Repository
import kotlin.reflect.KClass

/**
 * 项目状态映射存储库实现类
 */
@Repository
class ProjectStatusMappingRepositoryImpl(
    override val mapper: ProjectStatusMappingMapper,
    override val template: R2dbcEntityTemplate,
    override val idGenerator: IdGeneratorService,
) : BaseRepository<ProjectStatusMapping, ProjectStatusMappingRecord, ProjectStatusMappingMapper>(), ProjectStatusMappingRepository {

    override val entityClass: KClass<ProjectStatusMappingRecord> = ProjectStatusMappingRecord::class

    override fun getId(entity: ProjectStatusMapping): Long? {
        return entity.id
    }

    /**
     * 将数据库记录转换为领域模型
     *
     * @param record 项目状态映射数据库记录
     * @return 项目状态映射领域模型
     * @throws IllegalArgumentException 如果记录ID为空
     */
    override fun toEntity(record: ProjectStatusMappingRecord): ProjectStatusMapping {
        return ProjectStatusMapping(
            id = record.id,
            projectId = record.projectId,
            statusId = record.statusId,
            deleted = record.deleted,
            createdAt = record.createdAt!!,
            updatedAt = record.updatedAt,
            version = record.version
        )
    }

    /**
     * 将领域模型转换为数据库记录
     *
     * @param entity 项目状态映射领域模型
     * @return 项目状态映射数据库记录
     */
    override fun toRecord(entity: ProjectStatusMapping): ProjectStatusMappingRecord {
        return ProjectStatusMappingRecord(
            projectId = entity.projectId,
            statusId = entity.statusId
        ).apply {
            id = entity.id
            deleted = entity.deleted
            createdAt = entity.createdAt
            updatedAt = entity.updatedAt
            version = entity.version
        }
    }
}
