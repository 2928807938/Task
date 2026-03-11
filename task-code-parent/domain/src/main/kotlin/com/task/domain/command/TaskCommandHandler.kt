package com.task.domain.command

import com.task.domain.model.task.OperationType
import com.task.domain.model.task.Task
import com.task.domain.model.task.TaskHistory
import com.task.domain.service.TaskService
import com.task.domain.service.strategy.TaskEditStrategy
import org.slf4j.LoggerFactory
import org.springframework.stereotype.Service
import reactor.core.publisher.Mono
import java.time.OffsetDateTime

/**
 * 任务命令处理器
 * 负责处理任务修改命令，并根据任务类型选择合适的策略
 */
@Service
class TaskCommandHandler(
    private val taskService: TaskService,
    private val taskEditStrategies: List<TaskEditStrategy>
) {
    private val log = LoggerFactory.getLogger(this::class.java)
    
    /**
     * 处理任务修改命令
     * 
     * @param command 任务修改命令
     * @return 修改后的任务
     */
    fun handleEditTaskCommand(command: EditTaskCommand): Mono<Task> {
        log.info("处理任务修改命令，任务ID={}", command.taskId)
        
        // 验证命令
        val validationError = command.validate()
        if (validationError != null) {
            log.warn("任务修改命令验证失败，任务ID={}，错误：{}", command.taskId, validationError)
            return Mono.error(IllegalArgumentException(validationError))
        }
        
        // 查询任务
        return taskService.findTaskById(command.taskId)
            .flatMap { task ->
                // 选择合适的策略
                val strategy = findApplicableStrategy(task)
                if (strategy == null) {
                    log.error("找不到适用的任务修改策略，任务ID={}", task.id)
                    return@flatMap Mono.error<Task>(
                        IllegalStateException("找不到适用的任务修改策略")
                    )
                }
                
                log.info("选择任务修改策略：{}，任务ID={}", 
                    strategy.javaClass.simpleName, task.id)
                
                // 验证修改参数
                strategy.validateTaskEdit(
                    task = task,
                    title = command.title,
                    description = command.description,
                    statusId = command.statusId,
                    priorityId = command.priorityId,
                    assigneeId = command.assigneeId,
                    startTime = command.startTime,
                    dueDate = command.dueDate
                ).then(Mono.defer {
                    // 执行任务修改
                    strategy.executeTaskEdit(
                        task = task,
                        title = command.title,
                        description = command.description,
                        statusId = command.statusId,
                        priorityId = command.priorityId,
                        assigneeId = command.assigneeId,
                        startTime = command.startTime,
                        dueDate = command.dueDate,
                        userId = command.userId
                    )
                }).flatMap { updatedTask ->
                    // 处理修改后的操作
                    strategy.postTaskEdit(
                        originalTask = task,
                        updatedTask = updatedTask,
                        userId = command.userId
                    )
                }
            }
            .doOnSuccess { updatedTask ->
                log.info("任务修改命令处理成功，任务ID={}，标题={}", 
                    updatedTask.id, updatedTask.title)
            }
            .doOnError { e ->
                log.error("任务修改命令处理失败，任务ID={}，错误：{}", 
                    command.taskId, e.message, e)
            }
    }
    
    /**
     * 处理主任务修改命令
     * 
     * @param command 主任务修改命令
     * @return 修改后的任务
     */
    fun handleEditMainTaskCommand(command: EditMainTaskCommand): Mono<Task> {
        log.info("处理主任务修改命令，任务ID={}", command.taskId)
        return handleEditTaskCommand(command)
    }
    
    /**
     * 处理子任务修改命令
     * 
     * @param command 子任务修改命令
     * @return 修改后的任务
     */
    fun handleEditSubTaskCommand(command: EditSubTaskCommand): Mono<Task> {
        log.info("处理子任务修改命令，任务ID={}", command.taskId)
        return handleEditTaskCommand(command)
    }
    
    /**
     * 查找适用于指定任务的策略
     * 
     * @param task 任务
     * @return 适用的策略，如果找不到则返回null
     */
    private fun findApplicableStrategy(task: Task): TaskEditStrategy? {
        return taskEditStrategies.find { it.isApplicable(task) }
    }
    
    /**
     * 处理任务状态变更命令
     * 
     * @param command 状态变更命令
     * @return 更新后的任务
     */
    fun handleChangeStatusCommand(command: ChangeStatusCommand): Mono<Task> {
        log.info("处理任务状态变更命令，任务ID={}，从状态{}变更到状态{}", 
                command.taskId, command.oldStatusId, command.newStatusId)
        
        // 验证命令
        val validationError = command.validate()
        if (validationError != null) {
            log.warn("任务状态变更命令验证失败，任务ID={}，错误：{}", command.taskId, validationError)
            return Mono.error(IllegalArgumentException(validationError))
        }
        
        // 如果状态没有变化，直接返回任务
        if (command.oldStatusId == command.newStatusId) {
            log.info("任务状态未变化，跳过更新，任务ID={}", command.taskId)
            return taskService.findTaskById(command.taskId)
        }
        
        // 查询任务
        return taskService.findTaskById(command.taskId)
            .flatMap { task ->
                // 记录状态变更历史
                val history = TaskHistory(
                    taskId = task.id,
                    userId = command.userId,
                    operationType = OperationType.STATUS_CHANGE,
                    fieldName = "statusId",
                    oldValue = command.oldStatusId.toString(),
                    newValue = command.newStatusId.toString(),
                    description = command.reason ?: "状态变更",
                    isMainTask = task.parentTaskId == null,
                    createdAt = OffsetDateTime.now(),
                    version = task.version
                )
                
                // 更新任务状态
                taskService.updateTaskStatus(
                    taskId = command.taskId, 
                    statusId = command.newStatusId, 
                    userId = command.userId,
                    history = history
                )
            }
            .doOnSuccess { updatedTask ->
                log.info("任务状态变更成功，任务ID={}，新状态={}", 
                        updatedTask.id, updatedTask.statusId)
            }
            .doOnError { e ->
                log.error("任务状态变更失败，任务ID={}，错误：{}", 
                        command.taskId, e.message, e)
            }
    }
}
