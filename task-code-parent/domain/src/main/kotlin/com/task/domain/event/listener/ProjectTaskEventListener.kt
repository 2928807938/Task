package com.task.domain.event.listener

import com.task.domain.event.project.ProjectDeletedEvent
import com.task.domain.service.TaskService
import org.slf4j.LoggerFactory
import org.springframework.context.event.EventListener
import org.springframework.stereotype.Component

/**
 * 项目事件监听器 - 任务服务
 * 处理项目相关事件对任务的影响
 */
@Component
class ProjectTaskEventListener(
    private val taskService: TaskService
) {
    private val log = LoggerFactory.getLogger(ProjectTaskEventListener::class.java)
    
    /**
     * 处理项目删除事件
     * 当项目被删除时，删除相关的任务
     */
    @EventListener
    fun handleProjectDeletedEvent(event: ProjectDeletedEvent) {
        log.info("接收到项目删除事件: 项目ID={}", event.projectId)
        
        // 删除项目相关的任务
        taskService.deleteTasksByProjectId(event.projectId)
            .subscribe(
                { log.info("项目任务删除成功: 项目ID={}", event.projectId) },
                { e -> log.error("项目任务删除失败: 项目ID={}, 错误: {}", event.projectId, e.message, e) }
            )
    }
}
