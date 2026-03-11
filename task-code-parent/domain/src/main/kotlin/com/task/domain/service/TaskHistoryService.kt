package com.task.domain.service

import com.fasterxml.jackson.databind.ObjectMapper
import com.task.domain.model.task.OperationType
import com.task.domain.model.task.Task
import com.task.domain.model.task.TaskHistory
import com.task.domain.repository.TaskHistoryRepository
import org.slf4j.LoggerFactory
import org.springframework.stereotype.Service
import reactor.core.publisher.Flux
import reactor.core.publisher.Mono
import java.time.OffsetDateTime

/**
 * 任务历史记录服务
 * 负责处理任务修改历史的记录和查询
 */
@Service
class TaskHistoryService(
    private val taskHistoryRepository: TaskHistoryRepository,
    private val objectMapper: ObjectMapper
) {
    private val log = LoggerFactory.getLogger(this::class.java)

    /**
     * 记录任务的多字段变更历史
     * 比较原始任务和更新后的任务，记录所有发生变化的字段
     * 
     * @param originalTask 原始任务对象
     * @param updatedTask 更新后的任务对象
     * @param userId 执行更新的用户ID
     * @return 保存的历史记录Flux
     */
    fun recordTaskChanges(
        originalTask: Task,
        updatedTask: Task,
        userId: Long
    ): Flux<TaskHistory> {
        val taskId = originalTask.id
        if (taskId == null) {
            log.error("无法记录任务变更历史，原始任务ID为空")
            return Flux.empty()
        }
        
        log.info("记录任务变更历史，任务ID={}，用户ID={}", taskId, userId)
        
        // 创建字段变更映射
        val fieldChanges = detectChanges(originalTask, updatedTask)
        if (fieldChanges.isEmpty()) {
            log.info("任务ID={}没有检测到变更，跳过历史记录", taskId)
            return Flux.empty()
        }
        
        val isMainTask = originalTask.parentTaskId == null
        val timestamp = OffsetDateTime.now()
        
        // 构建历史记录列表
        val histories = fieldChanges.map { (field, change) ->
            createTaskHistory(
                taskId = taskId,
                userId = userId,
                operationType = change.first,
                fieldName = field,
                oldValue = change.second,
                newValue = change.third,
                isMainTask = isMainTask,
                timestamp = timestamp
            )
        }
        
        // 批量保存历史记录并添加错误恢复机制
        return taskHistoryRepository.saveBatch(histories)
            .doOnNext { history ->
                log.debug("保存任务历史成功，ID={}, 字段={}", history.id, history.fieldName)
            }
            .doOnComplete {
                log.info("成功记录{}条任务历史变更，任务ID={}", histories.size, taskId)
            }
            .doOnError { e ->
                log.error("记录任务历史失败，任务ID={}，错误：{}", taskId, e.message, e)
            }
            .onErrorResume { e ->
                log.warn("尝试单条记录任务历史以恢复部分功能，任务ID={}", taskId)
                // 发生错误时尝试逐条保存
                Flux.fromIterable(histories)
                    .flatMap { history ->
                        taskHistoryRepository.save(history)
                            .doOnError { saveError ->
                                log.error("单条保存任务历史失败，字段={}，错误：{}", 
                                    history.fieldName, saveError.message)
                            }
                            .onErrorResume { Mono.empty() }
                    }
            }
    }
    
    /**
     * 生成操作描述
     */
    private fun generateDescription(
        operationType: OperationType,
        fieldName: String,
        oldValue: Any?,
        newValue: Any?
    ): String {
        return when (operationType) {
            OperationType.CREATE -> "创建了任务"
            OperationType.UPDATE -> "更新了任务"
            OperationType.DELETE -> "删除了任务"
            OperationType.ASSIGN -> {
                if (newValue == null) "取消了任务负责人" 
                else "将任务分配给了用户ID: $newValue"
            }
            OperationType.STATUS_CHANGE -> "将任务状态从「${oldValue ?: "无"}」修改为「${newValue ?: "无"}」"
            OperationType.PRIORITY_CHANGE -> "将任务优先级从「${oldValue ?: "无"}」修改为「${newValue ?: "无"}」"
            OperationType.TITLE_CHANGE -> "将任务标题从「${oldValue ?: "无"}」修改为「${newValue ?: "无"}」"
            OperationType.DESCRIPTION_CHANGE -> "修改了任务描述"
            OperationType.STARTTIME_CHANGE -> {
                if (newValue == null) "删除了开始时间"
                else if (oldValue == null) "设置开始时间为 $newValue"
                else "将开始时间从 $oldValue 修改为 $newValue"
            }
            OperationType.DUEDATE_CHANGE -> {
                if (newValue == null) "删除了截止日期"
                else if (oldValue == null) "设置截止日期为 $newValue"
                else "将截止日期从 $oldValue 修改为 $newValue"
            }
        }
    }
    
    /**
     * 检测任务变更的字段并返回变更映射
     * @return 返回字段名到(操作类型,旧值,新值)的映射
     */
    private fun detectChanges(originalTask: Task, updatedTask: Task): Map<String, Triple<OperationType, Any?, Any?>> {
        val changes = mutableMapOf<String, Triple<OperationType, Any?, Any?>>()
        
        // 检查标题变更
        if (originalTask.title != updatedTask.title) {
            changes["title"] = Triple(OperationType.TITLE_CHANGE, originalTask.title, updatedTask.title)
        }
        
        // 检查描述变更
        if (originalTask.description != updatedTask.description) {
            changes["description"] = Triple(OperationType.DESCRIPTION_CHANGE, originalTask.description, updatedTask.description)
        }
        
        // 检查状态变更
        if (originalTask.statusId != updatedTask.statusId) {
            changes["statusId"] = Triple(OperationType.STATUS_CHANGE, originalTask.statusId, updatedTask.statusId)
        }
        
        // 检查优先级变更
        if (originalTask.priorityId != updatedTask.priorityId) {
            changes["priorityId"] = Triple(OperationType.PRIORITY_CHANGE, originalTask.priorityId, updatedTask.priorityId)
        }
        
        // 检查负责人变更
        if (originalTask.assigneeId != updatedTask.assigneeId) {
            changes["assigneeId"] = Triple(OperationType.ASSIGN, originalTask.assigneeId, updatedTask.assigneeId)
        }
        
        // 检查截止日期变更
        if (originalTask.dueDate != updatedTask.dueDate) {
            changes["dueDate"] = Triple(OperationType.DUEDATE_CHANGE, originalTask.dueDate, updatedTask.dueDate)
        }
        
        return changes
    }
    
    /**
     * 创建任务历史记录对象
     */
    private fun createTaskHistory(
        taskId: Long,
        userId: Long,
        operationType: OperationType,
        fieldName: String,
        oldValue: Any?,
        newValue: Any?,
        isMainTask: Boolean,
        timestamp: OffsetDateTime = OffsetDateTime.now()
    ): TaskHistory {
        // 操作描述
        val description = generateDescription(operationType, fieldName, oldValue, newValue)
        
        // 转换为JSON字符串
        val oldValueJson = if (oldValue != null) objectMapper.writeValueAsString(oldValue) else null
        val newValueJson = if (newValue != null) objectMapper.writeValueAsString(newValue) else null
        
        return TaskHistory(
            taskId = taskId,
            userId = userId,
            operationType = operationType,
            fieldName = fieldName,
            oldValue = oldValueJson,
            newValue = newValueJson,
            description = description,
            isMainTask = isMainTask,
            version = 1
        )
    }
}
