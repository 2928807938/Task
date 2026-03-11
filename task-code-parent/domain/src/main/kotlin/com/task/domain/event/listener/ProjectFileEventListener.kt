package com.task.domain.event.listener

import com.task.domain.event.project.ProjectDeletedEvent
import com.task.domain.model.attachment.Attachment
import com.task.domain.model.attachment.EntityTypeEnum
import com.task.domain.model.common.ComparisonOperator
import com.task.domain.model.common.fieldOf
import com.task.domain.model.task.Task
import com.task.domain.repository.AttachmentRepository
import com.task.domain.repository.TaskRepository
import org.slf4j.LoggerFactory
import org.springframework.context.event.EventListener
import org.springframework.stereotype.Component
import reactor.core.publisher.Mono

/**
 * 项目事件监听器 - 附件服务
 * 处理项目相关事件对附件的影响
 */
@Component
class ProjectAttachmentEventListener(
    private val attachmentRepository: AttachmentRepository,
    private val taskRepository: TaskRepository
) {
    private val log = LoggerFactory.getLogger(ProjectAttachmentEventListener::class.java)

    /**
     * 处理项目删除事件
     * 当项目被删除时，删除项目相关的附件
     */
    @EventListener
    fun handleProjectDeletedEvent(event: ProjectDeletedEvent) {
        log.info("接收到项目删除事件: 项目ID={}", event.projectId)

        // 1. 删除直接关联到项目的附件
        deleteProjectAttachments(event.projectId)
            .subscribe(
                { log.info("项目直接关联的附件删除成功: 项目ID={}", event.projectId) },
                { e -> log.error("项目直接关联的附件删除失败: 项目ID={}, 错误: {}", event.projectId, e.message, e) }
            )

        // 2. 删除项目下任务关联的附件
        deleteTaskAttachmentsForProject(event.projectId)
            .subscribe(
                { log.info("项目下任务关联的附件删除成功: 项目ID={}", event.projectId) },
                { e -> log.error("项目下任务关联的附件删除失败: 项目ID={}, 错误: {}", event.projectId, e.message, e) }
            )
    }

    /**
     * 删除直接关联到项目的附件
     */
    private fun deleteProjectAttachments(projectId: Long): Mono<Void> {
        return attachmentRepository.list {
            fieldOf(Attachment::entityType, ComparisonOperator.EQUALS, EntityTypeEnum.PROJECT.code)
            fieldOf(Attachment::entityId, ComparisonOperator.EQUALS, projectId)
        }
            .map { it.id }
            .collectList()
            .flatMap { attachmentIds ->
                if (attachmentIds.isEmpty()) {
                    log.info("项目没有直接关联的附件需要删除: 项目ID={}", projectId)
                    return@flatMap Mono.empty<Void>()
                }

                log.info("找到{}个直接关联到项目的附件需要删除: 项目ID={}", attachmentIds.size, projectId)
                attachmentRepository.deleteBatch(attachmentIds)
            }
    }

    /**
     * 删除项目下任务关联的附件
     */
    private fun deleteTaskAttachmentsForProject(projectId: Long): Mono<Void> {
        // 1. 查询项目下的所有任务ID
        return taskRepository.list {
            fieldOf(Task::projectId, ComparisonOperator.EQUALS, projectId)
        }
            .map { it.id }
            .collectList()
            .flatMap { taskIds ->
                if (taskIds.isEmpty()) {
                    log.info("项目没有任务，无需删除任务附件: 项目ID={}", projectId)
                    return@flatMap Mono.empty<Void>()
                }

                log.info("找到{}个项目下的任务: 项目ID={}", taskIds.size, projectId)

                // 2. 查询这些任务关联的所有附件
                attachmentRepository.list {
                    fieldOf(Attachment::entityType, ComparisonOperator.EQUALS,  EntityTypeEnum.TASK.code)
                    fieldOf(Attachment::entityId, ComparisonOperator.IN, taskIds)
                }
                    .map { it.id }
                    .collectList()
                    .flatMap { attachmentIds ->
                        if (attachmentIds.isEmpty()) {
                            log.info("项目下的任务没有关联的附件需要删除: 项目ID={}", projectId)
                            return@flatMap Mono.empty<Void>()
                        }

                        log.info("找到{}个任务关联的附件需要删除: 项目ID={}", attachmentIds.size, projectId)
                        attachmentRepository.deleteBatch(attachmentIds)
                    }
            }
    }
}