package com.task.infrastructure.persistence.repositoryImpl

import com.task.domain.model.attachment.Attachment
import com.task.domain.model.attachment.EntityTypeEnum
import com.task.domain.repository.AttachmentRepository
import com.task.infrastructure.id.IdGeneratorService
import com.task.infrastructure.persistence.base.BaseRepository
import com.task.infrastructure.persistence.mapper.AttachmentMapper
import com.task.infrastructure.persistence.record.AttachmentRecord
import org.springframework.data.r2dbc.core.R2dbcEntityTemplate
import org.springframework.stereotype.Repository
import kotlin.reflect.KClass

/**
 * AttachmentRepository接口的实现类
 * 实现附件相关的数据访问操作
 */
@Repository
class AttachmentRepositoryImpl(
    override val mapper: AttachmentMapper,
    override val template: R2dbcEntityTemplate,
    override val idGenerator: IdGeneratorService
) : BaseRepository<Attachment, AttachmentRecord, AttachmentMapper>(), AttachmentRepository {

    override val entityClass: KClass<AttachmentRecord> = AttachmentRecord::class

    override fun getId(entity: Attachment): Long {
        return entity.id
    }

    /**
     * 将数据库记录转换为领域实体
     *
     * @param record 附件数据库记录
     * @return 附件领域实体
     */
    override fun toEntity(record: AttachmentRecord): Attachment {
        return Attachment(
            id = record.id ?: 0L,
            fileName = record.fileName,
            fileSize = record.fileSize,
            fileType = record.fileType,
            storagePath = record.storagePath,
            entityType = EntityTypeEnum.fromCodeOrThrow(record.entityType),
            entityId = record.entityId,
            uploadedById = record.uploadedById,
            uploadedBy = null, // 需要通过用户仓库加载，这里先设为null
            description = record.description,
            isPublic = record.isPublic,
            createdAt = record.createdAt,
            updatedAt = record.updatedAt,
            version = record.version
        )
    }

    /**
     * 将领域实体转换为数据库记录
     *
     * @param entity 附件领域实体
     * @return 附件数据库记录
     */
    override fun toRecord(entity: Attachment): AttachmentRecord {
        return AttachmentRecord(
            fileName = entity.fileName,
            fileSize = entity.fileSize,
            fileType = entity.fileType,
            storagePath = entity.storagePath,
            entityType = entity.entityType.code,
            entityId = entity.entityId,
            uploadedById = entity.uploadedById,
            description = entity.description,
            isPublic = entity.isPublic
        ).apply {
            // 设置继承自BaseRecord的字段
            id = if (entity.id > 0) entity.id else null
            version = entity.version
            createdAt = entity.createdAt
            updatedAt = entity.updatedAt
        }
    }

}
