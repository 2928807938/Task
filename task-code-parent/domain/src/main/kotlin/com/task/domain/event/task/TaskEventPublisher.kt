package com.task.domain.event.task

import com.task.domain.model.task.Task
import org.slf4j.LoggerFactory
import org.springframework.context.ApplicationEventPublisher
import org.springframework.stereotype.Service
import java.util.concurrent.CopyOnWriteArrayList

/**
 * 任务事件发布服务
 * 负责发布任务相关事件并通知监听器
 */
@Service
class TaskEventPublisher(
    private val applicationEventPublisher: ApplicationEventPublisher
) {
    private val log = LoggerFactory.getLogger(this::class.java)
    private val eventListeners = CopyOnWriteArrayList<TaskEventListener>()
    
    /**
     * 添加事件监听器
     * 
     * @param listener 事件监听器
     */
    fun addListener(listener: TaskEventListener) {
        eventListeners.add(listener)
        log.info("添加任务事件监听器：{}", listener.javaClass.simpleName)
    }
    
    /**
     * 移除事件监听器
     * 
     * @param listener 事件监听器
     */
    fun removeListener(listener: TaskEventListener) {
        eventListeners.remove(listener)
        log.info("移除任务事件监听器：{}", listener.javaClass.simpleName)
    }
    
    /**
     * 发布任务修改事件
     * 
     * @param originalTask 原始任务
     * @param modifiedTask 修改后的任务
     * @param userId 修改人ID
     */
    fun publishTaskModifiedEvent(originalTask: Task, modifiedTask: Task, userId: Long) {
        log.info("发布任务修改事件，任务ID={}", modifiedTask.id)
        
        // 确定任务类型
        val taskType = if (modifiedTask.parentTaskId == null) TaskType.MAIN_TASK else TaskType.SUB_TASK
        
        // 确定修改的字段
        val modifiedFields = mutableListOf<String>()
        if (originalTask.title != modifiedTask.title) modifiedFields.add("title")
        if (originalTask.description != modifiedTask.description) modifiedFields.add("description")
        if (originalTask.statusId != modifiedTask.statusId) modifiedFields.add("statusId")
        if (originalTask.priorityId != modifiedTask.priorityId) modifiedFields.add("priorityId")
        if (originalTask.assigneeId != modifiedTask.assigneeId) modifiedFields.add("assigneeId")
        if (originalTask.dueDate != modifiedTask.dueDate) modifiedFields.add("dueDate")
        
        if (modifiedFields.isEmpty()) {
            log.info("没有字段修改，不发布事件，任务ID={}", modifiedTask.id)
            return
        }
        
        // 创建事件对象
        val event = TaskModifiedEvent(
            taskId = modifiedTask.id!!,
            originalTask = originalTask,
            modifiedTask = modifiedTask,
            userId = userId,
            taskType = taskType,
            modifiedFields = modifiedFields
        )
        
        // 发布事件
        publishEvent(event)
        
        // 如果状态发生变化，还需要发布状态变更事件
        if (originalTask.statusId != modifiedTask.statusId) {
            publishTaskStatusChangedEvent(
                taskId = modifiedTask.id,
                oldStatusId = originalTask.statusId,
                newStatusId = modifiedTask.statusId,
                userId = userId,
                taskType = taskType
            )
        }
    }
    
    /**
     * 发布任务状态变更事件
     * 
     * @param taskId 任务ID
     * @param oldStatusId 原状态ID
     * @param newStatusId 新状态ID
     * @param userId 修改人ID
     * @param taskType 任务类型
     * @param reason 变更原因
     */
    fun publishTaskStatusChangedEvent(
        taskId: Long,
        oldStatusId: Long,
        newStatusId: Long,
        userId: Long,
        taskType: TaskType,
        reason: String? = null
    ) {
        log.info("发布任务状态变更事件，任务ID={}，从状态{}变更为{}", taskId, oldStatusId, newStatusId)
        
        // 创建事件对象
        val event = TaskStatusChangedEvent(
            taskId = taskId,
            oldStatusId = oldStatusId,
            newStatusId = newStatusId,
            userId = userId,
            taskType = taskType,
            reason = reason
        )
        
        // 发布事件
        publishEvent(event)
    }
    
    /**
     * 发布事件
     * 
     * @param event 事件对象
     */
    private fun publishEvent(event: TaskEvent) {
        // 通过Spring发布事件
        applicationEventPublisher.publishEvent(event)
        
        // 通知所有监听器
        for (listener in eventListeners) {
            try {
                listener.onTaskEvent(event)
            } catch (e: Exception) {
                log.error("任务事件监听器处理失败，监听器={}，错误：{}", 
                    listener.javaClass.simpleName, e.message, e)
            }
        }
    }
}

/**
 * 任务事件监听器接口
 */
interface TaskEventListener {
    /**
     * 处理任务事件
     * 
     * @param event 事件对象
     */
    fun onTaskEvent(event: TaskEvent)
}
