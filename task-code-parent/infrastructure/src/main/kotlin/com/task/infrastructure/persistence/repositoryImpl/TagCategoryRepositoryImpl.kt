package com.task.infrastructure.persistence.repositoryImpl

import com.task.domain.model.task.TagCategory
import com.task.domain.repository.TagCategoryRepository
import com.task.infrastructure.id.IdGeneratorService
import com.task.infrastructure.persistence.base.BaseRepository
import com.task.infrastructure.persistence.mapper.TagCategoryMapper
import com.task.infrastructure.persistence.record.TagCategoryRecord
import org.springframework.data.r2dbc.core.R2dbcEntityTemplate
import org.springframework.stereotype.Repository
import kotlin.reflect.KClass

/**
 * TagCategoryRepository接口的实现类
 * 实现标签分类相关的数据访问操作
 */
@Repository
class TagCategoryRepositoryImpl(
    override val mapper: TagCategoryMapper,
    override val template: R2dbcEntityTemplate,
    override val idGenerator: IdGeneratorService
) : BaseRepository<TagCategory, TagCategoryRecord, TagCategoryMapper>(), TagCategoryRepository {

    override val entityClass: KClass<TagCategoryRecord> = TagCategoryRecord::class

    override fun getId(entity: TagCategory): Long {
        return entity.id
    }

    /**
     * 将数据库记录转换为领域模型
     *
     * @param record 标签分类数据库记录
     * @return 标签分类领域模型
     */
    override fun toEntity(record: TagCategoryRecord): TagCategory {
        return TagCategory(
            id = record.id ?: throw IllegalArgumentException("标签分类ID不能为空"),
            name = record.name,
            description = record.description,
            colorCode = record.colorCode,
            icon = record.icon,
            teamId = record.teamId,
            tags = emptyList(), // 标签列表需要通过关联查询获取，此处设为空列表
            createdAt = record.createdAt!!,
            updatedAt = record.updatedAt,
            version = record.version
        )
    }

    /**
     * 将领域模型转换为数据库记录
     *
     * @param entity 标签分类领域模型
     * @return 标签分类数据库记录
     */
    override fun toRecord(entity: TagCategory): TagCategoryRecord {
        return TagCategoryRecord(
            name = entity.name,
            description = entity.description,
            colorCode = entity.colorCode,
            icon = entity.icon,
            teamId = entity.teamId
        ).apply {
            id = entity.id
            version = entity.version
            createdAt = entity.createdAt
            updatedAt = entity.updatedAt
        }
    }
}
