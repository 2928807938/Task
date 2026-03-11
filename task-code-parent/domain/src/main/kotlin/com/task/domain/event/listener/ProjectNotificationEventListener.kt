package com.task.domain.event.listener

import com.task.domain.event.project.ProjectDeletedEvent
import com.task.domain.model.activity.ResourceTypeEnum
import com.task.domain.model.notification.Notification
import com.task.domain.model.notification.NotificationStatusEnum
import com.task.domain.model.notification.NotificationTypeEnum
import com.task.domain.repository.NotificationRepository
import com.task.domain.repository.UserRepository
import org.slf4j.LoggerFactory
import org.springframework.context.event.EventListener
import org.springframework.stereotype.Component
import reactor.core.publisher.Flux

/**
 * 项目事件监听器 - 通知服务
 * 处理项目相关事件的通知发送
 */
@Component
class ProjectNotificationEventListener(
    private val notificationRepository: NotificationRepository,
    private val userRepository: UserRepository
) {
    private val log = LoggerFactory.getLogger(ProjectNotificationEventListener::class.java)
    
    /**
     * 处理项目删除事件
     * 当项目被删除时，向所有项目成员发送通知
     */
    @EventListener
    fun handleProjectDeletedEvent(event: ProjectDeletedEvent) {
        log.info("接收到项目删除事件: 项目ID={}, 项目名称={}", event.projectId, event.projectName)
        
        if (event.memberIds.isEmpty()) {
            log.info("项目没有成员，无需发送通知: 项目ID={}", event.projectId)
            return
        }
        
        // 查询操作者信息
        userRepository.findById(event.operatorId)
            .flatMap { operator ->
                log.debug("查询到操作者信息: {}", operator.username)
                
                // 创建通知内容
                val title = "项目已删除"
                val content = "项目\"${event.projectName}\"已被${operator.username}删除。"
                
                // 为每个成员创建通知
                Flux.fromIterable(event.memberIds)
                    .filter { memberId -> memberId != event.operatorId } // 不通知操作者自己
                    .flatMap { memberId ->
                        val notification = Notification(
                            id = 0, // 由数据库生成
                            userId = memberId,
                            user = null,
                            type = NotificationTypeEnum.PROJECT_UPDATED, // 使用项目更新类型
                            title = title,
                            content = content,
                            status = NotificationStatusEnum.UNREAD,
                            entityType = ResourceTypeEnum.PROJECT,
                            entityId = null, // 项目已删除，不再有ID
                            triggeredById = event.operatorId,
                            actionUrl = null,
                            createdAt = event.deletedAt,
                            readAt = null,
                            version = 1
                        )
                        
                        // 保存通知
                        notificationRepository.save(notification)
                            .doOnSuccess { log.debug("项目删除通知创建成功: 用户ID={}", memberId) }
                            .doOnError { e -> log.error("项目删除通知创建失败: 用户ID={}, 错误={}", memberId, e.message, e) }
                    }
                    .then()
            }
            .subscribe(
                { log.info("项目删除通知发送完成: 项目ID={}, 收件人数量={}", event.projectId, event.memberIds.size - 1) },
                { e -> log.error("项目删除通知发送失败: 项目ID={}, 错误: {}", event.projectId, e.message, e) }
            )
    }
}
