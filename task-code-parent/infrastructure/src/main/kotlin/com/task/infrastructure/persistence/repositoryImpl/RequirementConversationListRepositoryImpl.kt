package com.task.infrastructure.persistence.repositoryImpl

import com.task.domain.model.task.requirementconversationlist.RequirementConversationList
import com.task.domain.repository.RequirementConversationListRepository
import com.task.infrastructure.id.IdGeneratorService
import com.task.infrastructure.persistence.base.BaseRepository
import com.task.infrastructure.persistence.mapper.RequirementConversationListMapper
import com.task.infrastructure.persistence.record.RequirementConversationListRecord
import org.springframework.data.r2dbc.core.R2dbcEntityTemplate
import org.springframework.stereotype.Repository
import kotlin.reflect.KClass

/**
 * RequirementConversationListRepository 接口实现类
 */
@Repository
class RequirementConversationListRepositoryImpl(
    override val mapper: RequirementConversationListMapper,
    override val template: R2dbcEntityTemplate,
    override val idGenerator: IdGeneratorService
) : BaseRepository<RequirementConversationList, RequirementConversationListRecord, RequirementConversationListMapper>(),
    RequirementConversationListRepository {

    override val entityClass: KClass<RequirementConversationListRecord> = RequirementConversationListRecord::class

    override fun getId(entity: RequirementConversationList): Long? {
        return entity.id
    }

    override fun toEntity(record: RequirementConversationListRecord): RequirementConversationList {
        return RequirementConversationList(
            id = record.id,
            projectId = record.projectId,
            deleted = record.deleted,
            createdAt = requireNotNull(record.createdAt) { "createdAt cannot be null" },
            updatedAt = record.updatedAt,
            version = record.version
        )
    }

    override fun toRecord(entity: RequirementConversationList): RequirementConversationListRecord {
        return RequirementConversationListRecord(
            projectId = entity.projectId
        ).apply {
            id = entity.id
            deleted = entity.deleted
            createdAt = entity.createdAt
            updatedAt = entity.updatedAt
            version = entity.version
        }
    }
}
