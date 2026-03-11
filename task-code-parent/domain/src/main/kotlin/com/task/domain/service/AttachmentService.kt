package com.task.domain.service

import com.task.domain.model.attachment.Attachment
import com.task.domain.model.attachment.EntityTypeEnum
import com.task.domain.model.common.ComparisonOperator
import com.task.domain.model.common.fieldOf
import com.task.domain.repository.AttachmentRepository
import org.slf4j.LoggerFactory
import org.springframework.stereotype.Service
import reactor.core.publisher.Flux
import reactor.core.publisher.Mono

/**
 * 附件领域服务
 * 提供附件相关的领域服务实现
 */
@Service
class AttachmentService(
    private val attachmentRepository: AttachmentRepository
) {
    private val log = LoggerFactory.getLogger(this::class.java)
    
    /**
     * 根据实体类型和实体ID查询附件列表
     *
     * @param entityType 实体类型
     * @param entityId 实体ID
     * @return 附件列表
     */
    fun findAttachmentsByEntityTypeAndEntityId(entityType: EntityTypeEnum, entityId: Long): Flux<Attachment> {
        log.debug("查询实体附件，实体类型={}，实体ID={}", entityType, entityId)
        return attachmentRepository.list {
            fieldOf(Attachment::entityType, ComparisonOperator.EQUALS, entityType)
            fieldOf(Attachment::entityId, ComparisonOperator.EQUALS, entityId)
        }
        .doOnComplete { log.debug("实体附件查询完成，实体类型={}，实体ID={}", entityType, entityId) }
    }
    
    /**
     * 删除指定实体的所有附件
     * 先查询符合条件的附件，然后通过ID批量删除
     *
     * @param entityType 实体类型
     * @param entityId 实体ID
     * @return 操作结果
     */
    fun deleteAttachmentsByEntityTypeAndId(entityType: EntityTypeEnum, entityId: Long): Mono<Void> {
        log.info("开始删除实体附件：类型={}，ID={}", entityType, entityId)
        
        // 首先查询符合条件的所有附件
        return findAttachmentsByEntityTypeAndEntityId(entityType, entityId)
            .map { it.id }
            .collectList()
            .flatMap { attachmentIds ->
                if (attachmentIds.isEmpty()) {
                    log.debug("未找到需要删除的附件: 类型={}，ID={}", entityType, entityId)
                    return@flatMap Mono.empty<Void>()
                }
                
                log.debug("找到{}个附件需要删除: 类型={}，ID={}", attachmentIds.size, entityType, entityId)
                
                // 根据ID列表批量删除附件
                attachmentRepository.deleteBatch(attachmentIds.toList())
                    .doOnSuccess { log.debug("成功删除{}个附件: 类型={}，ID={}", attachmentIds.size, entityType, entityId) }
                    .doOnError { e -> log.error("附件删除失败: 类型={}，ID={}，错误={}", entityType, entityId, e.message, e) }
            }
    }
}
