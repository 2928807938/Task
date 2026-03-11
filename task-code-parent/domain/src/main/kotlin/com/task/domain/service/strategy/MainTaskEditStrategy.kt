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
import reactor.core.publisher.Flux
import reactor.core.publisher.Mono
import java.time.OffsetDateTime

/**
 * 主任务修改策略实现类
 * 处理主任务特有的修改逻辑
 */
@Component
class MainTaskEditStrategy(
    private val taskRepository: TaskRepository,
    private val taskHistoryRepository: TaskHistoryRepository,
    private val projectStatusRepository: ProjectStatusRepository,
    private val objectMapper: ObjectMapper
) : TaskEditStrategy {
    
    private val log = LoggerFactory.getLogger(this::class.java)
    
    /**
     * 验证主任务修改参数
     * 包括状态变更规则、截止日期逻辑等
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
        log.info("验证主任务修改参数，任务ID={}", task.id)
        
        // 如果要修改状态，检查是否有子任务状态变更规则
        if (statusId != null && statusId != task.statusId) {
            // 检查所有子任务状态，判断主任务状态是否可变更
            // 例如，如果要将主任务设为"完成"，需要检查所有子任务是否都已完成
            return findSubTasks(task.id)
                .collectList()
                .flatMap { subTasks: List<Task> ->
                    // 没有子任务，直接通过验证
                    if (subTasks.isEmpty()) {
                        return@flatMap Mono.empty<Void>()
                    }
                    
                    // 检查是否将主任务标记为完成
                    return@flatMap isStatusTerminal(statusId)
                        .flatMap { isTerminal: Boolean ->
                            if (isTerminal) {
                                // 如果要设为完成状态，检查所有子任务是否都已完成
                                val hasUnfinishedSubTasks = subTasks.any { subTask -> 
                                    subTask.status?.isTerminal != true 
                                }
                                
                                if (hasUnfinishedSubTasks) {
                                    log.warn("主任务存在未完成的子任务，无法标记为完成，任务ID={}", task.id)
                                    return@flatMap Mono.error<Void>(
                                        IllegalStateException("主任务存在未完成的子任务，无法标记为完成")
                                    )
                                }
                            }
                            
                            Mono.empty<Void>()
                        }
                }
        }
        
        // 如果要修改截止日期，检查是否与子任务截止日期冲突
        if (dueDate != null && (task.dueDate == null || !dueDate.isEqual(task.dueDate))) {
            return findSubTasks(task.id)
                .filter { subTask: Task -> subTask.dueDate != null && subTask.dueDate.isAfter(dueDate) }
                .collectList()
                .flatMap { conflictingSubTasks: List<Task> ->
                    if (conflictingSubTasks.isNotEmpty()) {
                        log.warn("主任务截止日期与{}个子任务截止日期冲突，任务ID={}", 
                            conflictingSubTasks.size, task.id)
                        return@flatMap Mono.error<Void>(
                            IllegalStateException("主任务截止日期早于${conflictingSubTasks.size}个子任务的截止日期")
                        )
                    }
                    
                    Mono.empty<Void>()
                }
        }
        
        return Mono.empty<Void>()
    }
    
    /**
     * 执行主任务修改
     * 处理任务状态变更、截止日期调整等
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
        log.info("执行主任务修改，任务ID={}", task.id)
        
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
        
        // 判断是否有实际变更
        val hasChanges = task.title != updatedTask.title ||
                        task.description != updatedTask.description ||
                        task.statusId != updatedTask.statusId ||
                        task.priorityId != updatedTask.priorityId ||
                        task.assigneeId != updatedTask.assigneeId ||
                        task.dueDate != updatedTask.dueDate
        
        if (!hasChanges) {
            log.info("主任务无变更，跳过更新，任务ID={}", task.id)
            return Mono.just(task)
        }
        
        // 更新任务
        return taskRepository.update(updatedTask)
            .doOnSuccess { t ->
                log.info("主任务更新成功，任务ID={}，标题={}", t.id, t.title)
            }
            .doOnError { e ->
                log.error("主任务更新失败，任务ID={}，错误：{}", task.id, e.message, e)
            }
    }
    
    /**
     * 处理主任务修改后的操作
     * 联动更新子任务状态、优先级等
     */
    override fun postTaskEdit(
        originalTask: Task,
        updatedTask: Task,
        userId: Long
    ): Mono<Task> {
        log.info("处理主任务修改后的操作，任务ID={}", updatedTask.id)
        
        // 直接使用TaskHistoryRepository记录任务历史
        if (userId > 0) {
            // 检测并记录变更
            val changes = detectTaskChanges(originalTask, updatedTask)
            if (changes.isNotEmpty()) {
                val histories = createTaskHistories(originalTask.id!!, userId, changes, true)
                taskHistoryRepository.saveBatch(histories)
                    .subscribe(
                        { log.debug("成功记录主任务历史记录，历史ID={}", it.id) },
                        { e -> log.error("记录主任务历史失败，错误：{}", e.message, e) }
                    )
            }
        }
        
        // 检查状态是否变更，如果变更则更新所有子任务的状态
        if (originalTask.statusId != updatedTask.statusId) {
            return handleSubTasksStatusUpdate(updatedTask, userId)
        }
        
        // 检查优先级是否变更，如果变更则联动更新子任务优先级
        if (originalTask.priorityId != updatedTask.priorityId) {
            return handleSubTasksPriorityUpdate(updatedTask, userId)
        }
        
        // 检查截止日期是否变更，如果变更则可能需要调整子任务截止日期
        if ((originalTask.dueDate == null && updatedTask.dueDate != null) ||
            (originalTask.dueDate != null && updatedTask.dueDate != null && 
             !originalTask.dueDate.isEqual(updatedTask.dueDate))) {
            return handleSubTasksDueDateUpdate(updatedTask, userId)
        }
        
        return Mono.just(updatedTask)
    }
    
    /**
     * 判断是否适用于主任务
     */
    override fun isApplicable(task: Task): Boolean {
        return task.parentTaskId == null
    }
    
    /**
     * 处理子任务状态更新
     * 当主任务状态变更时，同步更新子任务状态
     */
    private fun handleSubTasksStatusUpdate(mainTask: Task, userId: Long): Mono<Task> {
        log.info("主任务状态已变更，准备更新子任务状态，主任务ID={}，状态ID={}", 
                mainTask.id, mainTask.statusId)
        
        // 检查主任务是否设置为终态（如已完成）
        return isStatusTerminal(mainTask.statusId)
            .flatMap { isTerminal ->
                if (isTerminal) {
                    // 如果主任务已完成，将所有未完成的子任务也标记为完成
                    log.info("主任务已设置为完成状态，准备更新所有未完成的子任务，主任务ID={}", mainTask.id)
                    
                    return@flatMap findSubTasks(mainTask.id)
                        .filter { subTask -> subTask.status?.isTerminal != true }
                        .flatMap { subTask ->
                            updateTask(
                                taskId = subTask.id!!,
                                statusId = mainTask.statusId,
                                userId = userId
                            )
                        }
                        .collectList()
                        .then(Mono.just(mainTask))
                }
                
                Mono.just(mainTask)
            }
    }
    
    /**
     * 处理子任务优先级更新
     * 当主任务优先级变更时，同步更新子任务优先级
     */
    private fun handleSubTasksPriorityUpdate(mainTask: Task, userId: Long): Mono<Task> {
        log.info("主任务优先级已变更，准备更新子任务优先级，主任务ID={}，优先级ID={}", 
                mainTask.id, mainTask.priorityId)
        
        // 将所有子任务的优先级更新为与主任务一致
        return findSubTasks(mainTask.id)
            .flatMap { subTask: Task ->
                updateTask(
                    taskId = subTask.id,
                    priorityId = mainTask.priorityId,
                    userId = userId
                )
            }
            .collectList()
            .then(Mono.just(mainTask))
    }
    
    /**
     * 处理子任务截止日期更新
     * 当主任务截止日期变更时，调整冲突的子任务截止日期
     */
    private fun handleSubTasksDueDateUpdate(mainTask: Task, userId: Long): Mono<Task> {
        log.info("主任务截止日期已变更，检查子任务截止日期，主任务ID={}，截止日期={}", 
                mainTask.id, mainTask.dueDate)
        
        // 如果主任务没有截止日期，不需要处理
        if (mainTask.dueDate == null) {
            return Mono.just(mainTask)
        }
        
        // 查找截止日期晚于主任务的子任务
        return findSubTasks(mainTask.id)
            .filter { subTask: Task -> 
                subTask.dueDate != null && subTask.dueDate.isAfter(mainTask.dueDate) 
            }
            .flatMap { subTask: Task ->
                // 将子任务截止日期更新为与主任务一致
                updateTask(
                    taskId = subTask.id,
                    dueDate = mainTask.dueDate,
                    userId = userId
                )
            }
            .collectList()
            .then(Mono.just(mainTask))
    }
    
    /**
     * 查询任务的所有子任务
     */
    private fun findSubTasks(taskId: Long): Flux<Task> {
        log.debug("查询任务的所有子任务，主任务ID={}", taskId)
        return taskRepository.list {
            fieldOf(Task::parentTaskId, ComparisonOperator.EQUALS, taskId)
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
