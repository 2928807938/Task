package com.task.domain.service.strategy

import com.fasterxml.jackson.databind.ObjectMapper
import com.task.domain.model.common.ComparisonOperator
import com.task.domain.model.common.fieldOf
import com.task.domain.model.task.OperationType
import com.task.domain.model.task.Task
import com.task.domain.model.task.TaskHistory
import com.task.domain.repository.ProjectStatusRepository
import com.task.domain.repository.TaskHistoryRepository
import com.task.domain.repository.TaskRepository
import org.slf4j.LoggerFactory
import org.springframework.stereotype.Component
import reactor.core.publisher.Mono
import java.time.OffsetDateTime

/**
 * 子任务修改策略实现类
 * 处理子任务特有的修改逻辑
 */
@Component
class SubTaskEditStrategy(
    private val taskRepository: TaskRepository,
    private val taskHistoryRepository: TaskHistoryRepository,
    private val projectStatusRepository: ProjectStatusRepository,
    private val objectMapper: ObjectMapper
) : TaskEditStrategy {
    
    private val log = LoggerFactory.getLogger(this::class.java)
    
    /**
     * 验证子任务修改参数
     * 包括与主任务的截止日期比较、状态逻辑等
     */
    override fun validateTaskEdit(
        task: Task,
        title: String?,
        description: String?,
        statusId: Long?,
        priorityId: Long?,
        assigneeId: Long?,
        startTime: OffsetDateTime?,
        dueDate: OffsetDateTime?
    ): Mono<Void> {
        log.info("验证子任务修改参数，任务ID={}，父任务ID={}", task.id, task.parentTaskId)
        
        // 检查父任务是否存在
        if (task.parentTaskId == null) {
            return Mono.error(IllegalStateException("非子任务，无法应用子任务修改策略"))
        }
        
        // 查询父任务
        return taskRepository.findById(task.parentTaskId)
            .switchIfEmpty(Mono.error(IllegalStateException("找不到父任务，ID=" + task.parentTaskId)))
            .flatMap { parentTask ->
                // 如果要修改截止日期，检查是否晚于父任务截止日期
                if (dueDate != null && parentTask.dueDate != null && dueDate.isAfter(parentTask.dueDate)) {
                    log.warn("子任务截止日期不能晚于父任务截止日期，子任务ID={}，父任务ID={}", 
                        task.id, parentTask.id)
                    return@flatMap Mono.error<Void>(
                        IllegalStateException("子任务截止日期不能晚于父任务截止日期")
                    )
                }
                
                // 如果要修改状态，检查是否符合子任务状态变更规则
                if (statusId != null && statusId != task.statusId) {
                    return@flatMap isStatusTerminal(statusId)
                        .flatMap { isTerminal ->
                            if (isTerminal && parentTask.status?.isTerminal != true) {
                                // 检查是否允许子任务在父任务未完成时标记为完成
                                // 根据业务需求可以允许或禁止这种情况
                                log.info("子任务将被标记为完成，但父任务尚未完成，子任务ID={}，父任务ID={}", 
                                    task.id, parentTask.id)
                            }
                            
                            Mono.empty<Void>()
                        }
                }
                
                Mono.empty()
            }
    }
    
    /**
     * 执行子任务修改
     * 处理任务状态变更等
     */
    override fun executeTaskEdit(
        task: Task,
        title: String?,
        description: String?,
        statusId: Long?,
        priorityId: Long?,
        assigneeId: Long?,
        startTime: OffsetDateTime?,
        dueDate: OffsetDateTime?,
        userId: Long
    ): Mono<Task> {
        log.info("执行子任务修改，任务ID={}，父任务ID={}", task.id, task.parentTaskId)
        
        // 记录截止日期变更的详细日志
        if (dueDate != null) {
            log.info("子任务截止日期将被修改，任务ID={}，原截止日期={}，新截止日期={}", 
                task.id, task.dueDate, dueDate)
        } else {
            log.info("子任务截止日期未指定，将保持不变，任务ID={}，当前截止日期={}", 
                task.id, task.dueDate)
        }
        
        // 创建更新后的任务对象
        val updatedTask = task.copy(
            title = title ?: task.title,
            description = description ?: task.description,
            statusId = statusId ?: task.statusId,
            priorityId = priorityId ?: task.priorityId,
            assigneeId = assigneeId ?: task.assigneeId,
            dueDate = dueDate ?: task.dueDate,
            updatedAt = OffsetDateTime.now()
        )
        
        // 确认截止日期是否正确设置
        log.info("更新后的子任务对象，任务ID={}，截止日期={}", updatedTask.id, updatedTask.dueDate)
        
        // 判断是否有实际变更
        val hasChanges = task.title != updatedTask.title ||
                        task.description != updatedTask.description ||
                        task.statusId != updatedTask.statusId ||
                        task.priorityId != updatedTask.priorityId ||
                        task.assigneeId != updatedTask.assigneeId ||
                        task.dueDate != updatedTask.dueDate
        
        if (!hasChanges) {
            log.info("子任务无变更，跳过更新，任务ID={}", task.id)
            return Mono.just(task)
        }
        
        // 检查截止日期是否有变更
        if (task.dueDate != updatedTask.dueDate) {
            log.info("子任务截止日期有变更，将更新数据库，任务ID={}，从{}到{}", 
                task.id, task.dueDate, updatedTask.dueDate)
        }
        
        // 更新任务
        return taskRepository.update(updatedTask)
            .doOnSuccess { t ->
                log.info("子任务更新成功，任务ID={}，标题={}，截止日期={}", t.id, t.title, t.dueDate)
            }
            .doOnError { e ->
                log.error("子任务更新失败，任务ID={}，错误：{}", task.id, e.message, e)
            }
    }
    
    /**
     * 处理子任务修改后的操作
     * 包括更新父任务状态、记录历史等
     */
    override fun postTaskEdit(
        originalTask: Task,
        updatedTask: Task,
        userId: Long
    ): Mono<Task> {
        log.info("处理子任务修改后的操作，任务ID={}，父任务ID={}", updatedTask.id, updatedTask.parentTaskId)
        
        // 直接使用TaskHistoryRepository记录任务历史
        if (userId > 0) {
            // 检测并记录变更
            val changes = detectTaskChanges(originalTask, updatedTask)
            if (changes.isNotEmpty()) {
                val histories = createTaskHistories(originalTask.id!!, userId, changes, false)
                taskHistoryRepository.saveBatch(histories)
                    .subscribe(
                        { log.debug("成功记录子任务历史记录，历史ID={}", it.id) },
                        { e -> log.error("记录子任务历史失败，错误：{}", e.message, e) }
                    )
            }
        }
        
        // 检查状态是否变更
        if (originalTask.statusId != updatedTask.statusId) {
            return handleParentTaskStatusUpdate(updatedTask, userId)
        }
        
        return Mono.just(updatedTask)
    }
    
    /**
     * 判断是否适用于子任务
     */
    override fun isApplicable(task: Task): Boolean {
        return task.parentTaskId != null
    }
    
    /**
     * 处理父任务状态更新
     * 当子任务状态变更时，可能需要更新父任务状态
     */
    private fun handleParentTaskStatusUpdate(subTask: Task, userId: Long): Mono<Task> {
        log.info("子任务状态已变更，检查是否需要更新父任务状态，子任务ID={}，状态ID={}", 
                subTask.id, subTask.statusId)
        
        // 如果没有父任务ID，直接返回
        if (subTask.parentTaskId == null) {
            return Mono.just(subTask)
        }
        
        // 检查子任务是否设置为终态（如已完成）
        return isStatusTerminal(subTask.statusId)
            .flatMap { isTerminal ->
                if (isTerminal) {
                    // 子任务已完成，检查所有兄弟任务是否都已完成
                    // 如果都已完成，可以将父任务也标记为完成
                    return@flatMap taskRepository.list {
                        fieldOf(Task::parentTaskId, ComparisonOperator.EQUALS, subTask.parentTaskId)
                    }.flatMap { siblingTask -> 
                        if (siblingTask.id == subTask.id) {
                            return@flatMap Mono.just(true)
                        }
                        
                        isStatusTerminal(siblingTask.statusId)
                    }.all { it }
                        .flatMap { allCompleted ->
                            if (allCompleted) {
                                // 所有子任务都已完成，更新父任务状态
                                log.info("所有子任务都已完成，准备更新父任务状态，父任务ID={}", subTask.parentTaskId)
                                return@flatMap taskRepository.findById(subTask.parentTaskId)
                                    .flatMap { parentTask ->
                                        // 如果父任务尚未完成，将其标记为完成
                                        if (parentTask.status?.isTerminal != true) {
                                            updateTask(
                                                taskId = parentTask.id,
                                                statusId = subTask.statusId, // 使用与子任务相同的状态
                                                userId = userId
                                            )
                                        } else {
                                            Mono.just(parentTask)
                                        }
                                    }
                                    .then(Mono.just(subTask))
                            } else {
                                Mono.just(subTask)
                            }
                        }
                } else {
                    Mono.just(subTask)
                }
            }
    }
    
    /**
     * 检查状态是否为终态（如已完成）
     * @param statusId 状态ID
     * @return 是否为终态
     */
    private fun isStatusTerminal(statusId: Long): Mono<Boolean> {
        return projectStatusRepository.findById(statusId)
            .map { status -> status.isTerminal }
            .defaultIfEmpty(false)
    }
    
    /**
     * 检测任务变更的字段并返回变更映射
     * @return 返回字段名到(操作类型,旧值,新值)的映射
     */
    private fun detectTaskChanges(originalTask: Task, updatedTask: Task): Map<String, Triple<OperationType, Any?, Any?>> {
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
        
        // 检查开始时间变更
        if (originalTask.startTime != updatedTask.startTime) {
            changes["startTime"] = Triple(OperationType.STARTTIME_CHANGE, originalTask.startTime, updatedTask.startTime)
        }
        
        // 检查截止日期变更
        if (originalTask.dueDate != updatedTask.dueDate) {
            changes["dueDate"] = Triple(OperationType.DUEDATE_CHANGE, originalTask.dueDate, updatedTask.dueDate)
        }
        
        return changes
    }
    
    /**
     * 根据变更创建任务历史记录列表
     */
    private fun createTaskHistories(
        taskId: Long,
        userId: Long,
        changes: Map<String, Triple<OperationType, Any?, Any?>>,
        isMainTask: Boolean
    ): List<TaskHistory> {
        val timestamp = OffsetDateTime.now()
        return changes.map { (fieldName, change) ->
            val (operationType, oldValue, newValue) = change
            
            // 生成描述
            val description = generateChangeDescription(operationType, fieldName, oldValue, newValue)
            
            // 转换为JSON
            val oldValueJson = if (oldValue != null) objectMapper.writeValueAsString(oldValue) else null
            val newValueJson = if (newValue != null) objectMapper.writeValueAsString(newValue) else null
            
            TaskHistory(
                taskId = taskId,
                userId = userId,
                operationType = operationType,
                fieldName = fieldName,
                oldValue = oldValueJson,
                newValue = newValueJson,
                description = description,
                isMainTask = isMainTask,
                createdAt = timestamp,
                version = 1
            )
        }
    }
    
    /**
     * 生成变更描述
     */
    private fun generateChangeDescription(
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
     * 更新任务
     * @param taskId 任务ID
     * @param statusId 新状态ID
     * @param priorityId 新优先级ID
     * @param dueDate 新截止日期
     * @param userId 当前操作用户ID
     * @return 更新后的任务
     */
    private fun updateTask(
        taskId: Long,
        title: String? = null,
        description: String? = null,
        statusId: Long? = null,
        priorityId: Long? = null,
        assigneeId: Long? = null,
        startTime: OffsetDateTime? = null,
        dueDate: OffsetDateTime? = null,
        userId: Long
    ): Mono<Task> {
        return taskRepository.findById(taskId)
            .flatMap { task ->
                val updatedTask = task.copy(
                    title = title ?: task.title,
                    description = description ?: task.description,
                    statusId = statusId ?: task.statusId,
                    priorityId = priorityId ?: task.priorityId,
                    assigneeId = assigneeId ?: task.assigneeId,
                    startTime = startTime ?: task.startTime,
                    dueDate = dueDate ?: task.dueDate,
                    updatedAt = OffsetDateTime.now()
                )
                taskRepository.update(updatedTask)
            }
    }
}
