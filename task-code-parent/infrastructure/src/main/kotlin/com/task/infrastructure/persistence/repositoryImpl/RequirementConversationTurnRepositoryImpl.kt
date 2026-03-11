package com.task.infrastructure.persistence.repositoryImpl

import com.task.domain.model.task.requirementconversationlist.RequirementConversationTurn
import com.task.domain.repository.RequirementConversationTurnRepository
import com.task.infrastructure.id.IdGeneratorService
import com.task.infrastructure.persistence.base.BaseRepository
import com.task.infrastructure.persistence.mapper.RequirementConversationTurnMapper
import com.task.infrastructure.persistence.record.RequirementConversationTurnRecord
import org.springframework.data.r2dbc.core.R2dbcEntityTemplate
import org.springframework.stereotype.Repository
import kotlin.reflect.KClass

/**
 * RequirementConversationTurnRepository 实现
 */
@Repository
class RequirementConversationTurnRepositoryImpl(
    override val mapper: RequirementConversationTurnMapper,
    override val template: R2dbcEntityTemplate,
    override val idGenerator: IdGeneratorService
) : BaseRepository<RequirementConversationTurn, RequirementConversationTurnRecord, RequirementConversationTurnMapper>(),
    RequirementConversationTurnRepository {

    override val entityClass: KClass<RequirementConversationTurnRecord> = RequirementConversationTurnRecord::class

    override fun getId(entity: RequirementConversationTurn): Long? = entity.id

    override fun toEntity(record: RequirementConversationTurnRecord): RequirementConversationTurn {
        return RequirementConversationTurn(
            id = record.id,
            conversationListId = record.conversationListId,
            turnNo = record.turnNo,
            userInput = record.userInput,
            analysisStartStatus = record.analysisStartStatus,
            analysisCompleteStatus = record.analysisCompleteStatus,
            snapshotJson = record.snapshotJson,
            deleted = record.deleted,
            createdAt = record.createdAt!!,
            updatedAt = record.updatedAt,
            version = record.version
        )
    }

    override fun toRecord(entity: RequirementConversationTurn): RequirementConversationTurnRecord {
        return RequirementConversationTurnRecord(
            conversationListId = entity.conversationListId,
            turnNo = entity.turnNo,
            userInput = entity.userInput,
            analysisStartStatus = entity.analysisStartStatus,
            analysisCompleteStatus = entity.analysisCompleteStatus,
            snapshotJson = entity.snapshotJson
        ).apply {
            id = entity.id
            createdAt = entity.createdAt
            updatedAt = entity.updatedAt
            version = entity.version
            deleted = entity.deleted
        }
    }
}
