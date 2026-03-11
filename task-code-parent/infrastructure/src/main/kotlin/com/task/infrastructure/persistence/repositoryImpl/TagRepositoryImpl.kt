package com.task.infrastructure.persistence.repositoryImpl

import com.task.domain.model.task.Tag
import com.task.domain.repository.TagRepository
import com.task.infrastructure.id.IdGeneratorService
import com.task.infrastructure.persistence.base.BaseRepository
import com.task.infrastructure.persistence.mapper.TagMapper
import com.task.infrastructure.persistence.record.TagRecord
import org.springframework.data.r2dbc.core.R2dbcEntityTemplate
import org.springframework.stereotype.Repository
import kotlin.reflect.KClass

/**
 * TagRepository接口的实现类
 * 实现标签相关的数据访问操作
 */
@Repository
class TagRepositoryImpl(
    override val mapper: TagMapper,
    override val template: R2dbcEntityTemplate,
    override val idGenerator: IdGeneratorService
) : BaseRepository<Tag, TagRecord, TagMapper>(), TagRepository {

    override val entityClass: KClass<TagRecord> = TagRecord::class

    override fun getId(entity: Tag): Long {
        return entity.id
    }

    /**
     * 将数据库记录转换为领域模型
     *
     * @param record 标签数据库记录
     * @return 标签领域模型
     */
    override fun toEntity(record: TagRecord): Tag {
        return Tag(
            id = record.id ?: throw IllegalArgumentException("标签ID不能为空"),
            name = record.name,
            color = record.color,
            description = record.description,
            projectId = record.projectId,
            createdAt = record.createdAt!!,
            updatedAt = record.updatedAt,
            version = record.version
        )
    }

    /**
     * 将领域模型转换为数据库记录
     *
     * @param entity 标签领域模型
     * @return 标签数据库记录
     */
    override fun toRecord(entity: Tag): TagRecord {
        return TagRecord(
            name = entity.name,
            color = entity.color ?: "#FFFFFF",
            description = entity.description,
            projectId = entity.projectId
        ).apply {
            id = entity.id
            version = entity.version
            createdAt = entity.createdAt
            updatedAt = entity.updatedAt
        }
    }
}
