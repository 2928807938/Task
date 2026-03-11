package com.task.infrastructure.persistence.repositoryImpl

import com.task.domain.model.versioning.DocumentVersion
import com.task.domain.model.versioning.VersionTypeEnum
import com.task.domain.repository.DocumentVersionRepository
import com.task.infrastructure.id.IdGeneratorService
import com.task.infrastructure.persistence.base.BaseRepository
import com.task.infrastructure.persistence.mapper.DocumentVersionMapper
import com.task.infrastructure.persistence.record.DocumentVersionRecord
import org.springframework.data.r2dbc.core.R2dbcEntityTemplate
import org.springframework.stereotype.Repository
import java.time.OffsetDateTime
import kotlin.reflect.KClass

/**
 * DocumentVersionRepository接口的实现类
 * 实现文档版本相关的数据访问操作
 */
@Repository
class DocumentVersionRepositoryImpl(
    override val mapper: DocumentVersionMapper,
    override val template: R2dbcEntityTemplate,
    override val idGenerator: IdGeneratorService
) : BaseRepository<DocumentVersion, DocumentVersionRecord, DocumentVersionMapper>(), DocumentVersionRepository {

    override val entityClass: KClass<DocumentVersionRecord> = DocumentVersionRecord::class

    override fun getId(entity: DocumentVersion): Long {
        return entity.id
    }

    /**
     * 将数据库记录转换为领域模型
     *
     * @param record 数据库记录
     * @return 领域模型
     */
    override fun toEntity(record: DocumentVersionRecord): DocumentVersion {
        return DocumentVersion(
            id = record.id ?: 0L,
            documentId = record.documentId,
            versionNumber = record.versionNumber,
            content = record.content,
            notes = record.notes,
            createdById = record.createdById,
            versionType = VersionTypeEnum.fromCode(record.versionTypeCode, VersionTypeEnum.MINOR),
            createdAt = record.createdAt,
            updatedAt = record.updatedAt
        )
    }

    /**
     * 将领域模型转换为数据库记录
     *
     * @param entity 领域模型
     * @return 数据库记录
     */
    override fun toRecord(entity: DocumentVersion): DocumentVersionRecord {
        return DocumentVersionRecord(
            documentId = entity.documentId,
            versionNumber = entity.versionNumber,
            content = entity.content,
            notes = entity.notes,
            createdById = entity.createdById,
            versionTypeCode = entity.versionType.code
        ).apply {
            // 保留ID和时间戳
            this.id = entity.id
            this.createdAt = entity.createdAt
            this.updatedAt = entity.updatedAt ?: OffsetDateTime.now()
        }
    }
}
