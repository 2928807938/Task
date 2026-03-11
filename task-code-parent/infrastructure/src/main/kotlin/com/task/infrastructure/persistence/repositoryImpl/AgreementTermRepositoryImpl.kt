package com.task.infrastructure.persistence.repositoryImpl

import com.task.domain.model.agreement.AgreementTerm
import com.task.domain.repository.AgreementTermRepository
import com.task.infrastructure.id.IdGeneratorService
import com.task.infrastructure.persistence.base.BaseRepository
import com.task.infrastructure.persistence.mapper.AgreementTermMapper
import com.task.infrastructure.persistence.record.AgreementTermRecord
import org.springframework.data.r2dbc.core.R2dbcEntityTemplate
import org.springframework.stereotype.Repository
import java.time.OffsetDateTime
import kotlin.reflect.KClass

/**
 * AgreementTermRepository接口的实现类
 * 实现协议条款相关的数据访问操作
 */
@Repository
class AgreementTermRepositoryImpl(
    override val mapper: AgreementTermMapper,
    override val template: R2dbcEntityTemplate,
    override val idGenerator: IdGeneratorService
) : BaseRepository<AgreementTerm, AgreementTermRecord, AgreementTermMapper>(), AgreementTermRepository {

    override val entityClass: KClass<AgreementTermRecord> = AgreementTermRecord::class

    override fun getId(entity: AgreementTerm): Long {
        return entity.id ?: throw IllegalArgumentException("协议条款ID不能为空")
    }

    /**
     * 从领域模型到记录类的转换
     *
     * @param entity 协议条款领域模型
     * @return 协议条款记录类
     */
    override fun toRecord(entity: AgreementTerm): AgreementTermRecord {
        return AgreementTermRecord(
            key = entity.key,
            title = entity.title,
            content = entity.content
        ).apply {
            id = entity.id
            deleted = entity.deleted
            createdAt = entity.createdAt
            updatedAt = entity.updatedAt ?: OffsetDateTime.now()
            version = entity.version
        }
    }

    /**
     * 从记录类到领域模型的转换
     *
     * @param record 协议条款记录类
     * @return 协议条款领域模型
     */
    override fun toEntity(record: AgreementTermRecord): AgreementTerm {
        return AgreementTerm(
            id = record.id,
            key = record.key,
            title = record.title,
            content = record.content,
            deleted = record.deleted,
            createdAt = record.createdAt,
            updatedAt = record.updatedAt,
            version = record.version
        )
    }
} 