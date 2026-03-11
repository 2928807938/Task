package com.task.infrastructure.persistence.repositoryImpl

import com.fasterxml.jackson.databind.ObjectMapper
import com.fasterxml.jackson.module.kotlin.readValue
import com.task.domain.model.task.requirementsummaryanalysis.*
import com.task.domain.repository.RequirementSummaryAnalysisRepository
import com.task.infrastructure.id.IdGeneratorService
import com.task.infrastructure.persistence.base.BaseRepository
import com.task.infrastructure.persistence.mapper.RequirementSummaryAnalysisMapper
import com.task.infrastructure.persistence.record.RequirementSummaryAnalysisRecord
import org.springframework.data.r2dbc.core.R2dbcEntityTemplate
import org.springframework.stereotype.Repository
import kotlin.reflect.KClass

/**
 * RequirementSummaryAnalysisRepository接口的实现类
 * 实现需求摘要分析相关的数据访问操作
 */
@Repository
class RequirementSummaryAnalysisRepositoryImpl(
    override val mapper: RequirementSummaryAnalysisMapper,
    override val template: R2dbcEntityTemplate,
    override val idGenerator: IdGeneratorService,
    private val objectMapper: ObjectMapper
) : BaseRepository<RequirementSummaryAnalysis, RequirementSummaryAnalysisRecord, RequirementSummaryAnalysisMapper>(), RequirementSummaryAnalysisRepository {

    override val entityClass: KClass<RequirementSummaryAnalysisRecord> = RequirementSummaryAnalysisRecord::class

    override fun getId(entity: RequirementSummaryAnalysis): Long? {
        return entity.id
    }

    /**
     * 从领域模型到记录类的转换
     *
     * @param entity 需求摘要分析领域模型
     * @return 需求摘要分析记录类
     */
    override fun toRecord(entity: RequirementSummaryAnalysis): RequirementSummaryAnalysisRecord {
        return RequirementSummaryAnalysisRecord(
            requirementId = entity.requirementId,
            summaryJson = objectMapper.writeValueAsString(entity.summary),
            taskArrangementJson = objectMapper.writeValueAsString(entity.taskArrangement)
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
     * @param record 需求摘要分析记录类
     * @return 需求摘要分析领域模型
     */
    override fun toEntity(record: RequirementSummaryAnalysisRecord): RequirementSummaryAnalysis {
        val summary: Summary = if (record.summaryJson != null) {
            objectMapper.readValue(record.summaryJson)
        } else {
            Summary("", "", emptyList(), emptyList(), emptyList())
        }
        
        val taskArrangement: TaskArrangement = if (record.taskArrangementJson != null) {
            objectMapper.readValue(record.taskArrangementJson)
        } else {
            TaskArrangement(
                phases = emptyList(),
                resourceRecommendations = ResourceRecommendation(emptyList(), emptyList(), emptyList()),
                riskManagement = RiskManagement(emptyList(), emptyList(), emptyList())
            )
        }
        
        return RequirementSummaryAnalysis(
            id = record.id,
            requirementId = record.requirementId,
            summary = summary,
            taskArrangement = taskArrangement,
            deleted = record.deleted,
            createdAt = record.createdAt!!,
            updatedAt = record.updatedAt,
            version = record.version
        )
    }
} 