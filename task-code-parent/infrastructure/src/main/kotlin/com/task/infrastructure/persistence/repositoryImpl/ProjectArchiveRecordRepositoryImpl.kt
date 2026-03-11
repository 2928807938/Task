package com.task.infrastructure.persistence.repositoryImpl

import com.task.domain.model.project.ProjectArchive
import com.task.domain.model.project.ProjectArchiveOperationType
import com.task.domain.model.project.ProjectArchiveRecord
import com.task.domain.repository.ProjectArchiveRecordRepository
import com.task.infrastructure.id.IdGeneratorService
import com.task.infrastructure.persistence.base.BaseRepository
import com.task.infrastructure.persistence.mapper.ProjectArchiveRecordMapper
import com.task.infrastructure.persistence.record.ProjectArchiveRecordRecord
import org.springframework.data.r2dbc.core.R2dbcEntityTemplate
import org.springframework.stereotype.Repository
import java.time.OffsetDateTime
import kotlin.reflect.KClass

/**
 * 项目归档记录仓库实现类
 * 实现项目归档记录相关的数据访问操作
 */
@Repository
class ProjectArchiveRecordRepositoryImpl(
    override val mapper: ProjectArchiveRecordMapper,
    override val template: R2dbcEntityTemplate,
    override val idGenerator: IdGeneratorService
) : BaseRepository<ProjectArchive, ProjectArchiveRecordRecord, ProjectArchiveRecordMapper>(), ProjectArchiveRecordRepository {

    override val entityClass: KClass<ProjectArchiveRecordRecord> = ProjectArchiveRecordRecord::class

    override fun getId(entity: ProjectArchive): Long? {
        return entity.id
    }

    /**
     * 将数据库记录转换为领域模型
     * 对于ProjectArchive，需要根据最新的记录来构建归档状态
     * @param record 数据库记录
     * @return 领域模型
     */
    override fun toEntity(record: ProjectArchiveRecordRecord): ProjectArchive {
        val singleRecord = ProjectArchiveRecord(
            id = record.id,
            projectId = record.projectId,
            operationType = ProjectArchiveOperationType.fromValue(record.operationType),
            operatorId = record.operatorId,
            operator = null, // 关联对象需要单独查询
            reason = record.reason,
            operatedAt = record.operatedAt,
            createdAt = record.createdAt,
            updatedAt = record.updatedAt,
            version = record.version
        )

        // 根据操作类型判断归档状态
        val archived = singleRecord.operationType == ProjectArchiveOperationType.ARCHIVE

        // 创建ProjectArchive对象
        return ProjectArchive(
            id = record.id,
            projectId = record.projectId,
            archived = archived,
            archivedAt = if (archived) record.operatedAt else null,
            archivedBy = if (archived) record.operatorId else null,
            archiveReason = if (archived) record.reason else null,
            unarchivedAt = if (!archived) record.operatedAt else null,
            unarchivedBy = if (!archived) record.operatorId else null,
            unarchiveReason = if (!archived) record.reason else null,
            records = listOf(singleRecord),
            createdAt = record.createdAt,
            updatedAt = record.updatedAt,
            version = record.version
        )
    }

    /**
     * 将领域模型转换为数据库记录
     * 由于ProjectArchive可能包含多条记录，这里只保存最新的一条操作记录
     * @param entity 领域模型
     * @return 数据库记录
     */
    override fun toRecord(entity: ProjectArchive): ProjectArchiveRecordRecord {
        // 根据归档状态确定操作类型
        val operationType = if (entity.archived)
            ProjectArchiveOperationType.ARCHIVE.value
        else
            ProjectArchiveOperationType.UNARCHIVE.value

        // 操作时间和操作者ID
        val operatedAt = if (entity.archived) entity.archivedAt else entity.unarchivedAt
        val operatorId = if (entity.archived) entity.archivedBy else entity.unarchivedBy
        val reason = if (entity.archived) entity.archiveReason else entity.unarchiveReason

        return ProjectArchiveRecordRecord(
            projectId = entity.projectId,
            operationType = operationType,
            operatorId = operatorId ?: 0, // 确保不为空
            reason = reason,
            operatedAt = operatedAt ?: OffsetDateTime.now()
        ).apply {
            id = entity.id
            createdAt = entity.createdAt ?: OffsetDateTime.now()
            updatedAt = entity.updatedAt
        }
    }
}
