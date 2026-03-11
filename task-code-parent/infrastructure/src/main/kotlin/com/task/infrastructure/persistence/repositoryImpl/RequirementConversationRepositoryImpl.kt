package com.task.infrastructure.persistence.repositoryImpl

import com.task.domain.model.task.requirementconversationlist.RequirementConversation
import com.task.domain.repository.RequirementConversationRepository
import com.task.infrastructure.id.IdGeneratorService
import com.task.infrastructure.persistence.base.BaseRepository
import com.task.infrastructure.persistence.mapper.RequirementConversationMapper
import com.task.infrastructure.persistence.record.RequirementConversationRecord
import org.springframework.data.r2dbc.core.R2dbcEntityTemplate
import org.springframework.stereotype.Repository
import kotlin.reflect.KClass

/**
 * RequirementConversationListRepository接口的实现类
 * 实现需求对话列表相关的数据访问操作
 */
@Repository
class RequirementConversationRepositoryImpl(
    override val mapper: RequirementConversationMapper,
    override val template: R2dbcEntityTemplate,
    override val idGenerator: IdGeneratorService
) : BaseRepository<RequirementConversation, RequirementConversationRecord, RequirementConversationMapper>(), RequirementConversationRepository {

    override val entityClass: KClass<RequirementConversationRecord> = RequirementConversationRecord::class

    override fun getId(entity: RequirementConversation): Long? {
        return entity.id
    }

    /**
     * 从领域模型到记录类的转换
     *
     * @param entity 需求对话列表领域模型
     * @return 需求对话列表记录类
     */
    override fun toRecord(entity: RequirementConversation): RequirementConversationRecord {
        return RequirementConversationRecord(
            conversationListId = entity.conversationListId,
            requirementId = entity.id ?: 0L, // 这里将对话列表自身的ID作为需求ID，需根据实际业务逻辑调整
            title = entity.title,
            startStatus = entity.startStatus,
            analysisStartStatus = entity.analysisStartStatus,
            analysisCompleteStatus = entity.analysisCompleteStatus,
            requirementCategoryId = entity.requirementCategoryId,
            requirementPriorityId = entity.requirementPriorityId,
            requirementWorkloadId = entity.requirementWorkloadId,
            requirementTaskBreakdownId = entity.requirementTaskBreakdownId,
            requirementCompletenessId = entity.requirementCompletenessId,
            requirementSuggestionId = entity.requirementSuggestionId,
            requirementSummaryAnalysisId = entity.requirementSummaryAnalysisId,
            rootMainTask = entity.rootMainTask,
            currentTurnNo = entity.currentTurnNo,
            latestTaskBreakdownJson = entity.latestTaskBreakdownJson,
            requirementTypeJson = entity.requirementTypeJson,
            priorityJson = entity.priorityJson,
            workloadJson = entity.workloadJson,
            completenessJson = entity.completenessJson,
            suggestionJson = entity.suggestionJson,
            analysisSummaryJson = entity.analysisSummaryJson,
            finalSummaryJson = entity.finalSummaryJson,
            taskPlanningJson = entity.taskPlanningJson
        ).apply {
            id = entity.id
            createdAt = entity.createdAt
            updatedAt = entity.updatedAt
            version = entity.version
            deleted = entity.deleted
        }
    }

    /**
     * 从记录类到领域模型的转换
     *
     * @param record 需求对话列表记录类
     * @return 需求对话列表领域模型
     */
    override fun toEntity(record: RequirementConversationRecord): RequirementConversation {
        return RequirementConversation(
            id = record.id,
            conversationListId = record.conversationListId,
            title = record.title,
            startStatus = record.startStatus,
            analysisStartStatus = record.analysisStartStatus,
            analysisCompleteStatus = record.analysisCompleteStatus,
            requirementCategoryId = record.requirementCategoryId,
            requirementPriorityId = record.requirementPriorityId,
            requirementWorkloadId = record.requirementWorkloadId,
            requirementTaskBreakdownId = record.requirementTaskBreakdownId,
            requirementCompletenessId = record.requirementCompletenessId,
            requirementSuggestionId = record.requirementSuggestionId,
            requirementSummaryAnalysisId = record.requirementSummaryAnalysisId,
            rootMainTask = record.rootMainTask,
            currentTurnNo = record.currentTurnNo,
            latestTaskBreakdownJson = record.latestTaskBreakdownJson,
            requirementTypeJson = record.requirementTypeJson,
            priorityJson = record.priorityJson,
            workloadJson = record.workloadJson,
            completenessJson = record.completenessJson,
            suggestionJson = record.suggestionJson,
            analysisSummaryJson = record.analysisSummaryJson,
            finalSummaryJson = record.finalSummaryJson,
            taskPlanningJson = record.taskPlanningJson,
            deleted = record.deleted,
            createdAt = record.createdAt!!,
            updatedAt = record.updatedAt,
            version = record.version
        )
    }
} 
