package com.task.application.assembler

import com.task.application.request.EditTaskRequest
import com.task.domain.command.ChangeStatusCommand
import com.task.domain.command.EditMainTaskCommand
import com.task.domain.command.EditSubTaskCommand
import com.task.domain.command.EditTaskCommand
import com.task.domain.model.task.Task
import com.task.domain.repository.PriorityRepository
import org.slf4j.LoggerFactory
import org.springframework.stereotype.Component
import reactor.core.publisher.Mono

/**
 * 任务命令组装器
 * 负责将应用层请求转换为领域层命令对象
 */
@Component
class TaskCommandAssembler(
    private val priorityRepository: PriorityRepository
) {
    
    private val log = LoggerFactory.getLogger(this::class.java)

    /**
     * 将编辑任务请求转换为主任务编辑命令
     * 
     * @param request 编辑任务请求
     * @param userId 当前用户ID
     * @param syncSubTasksStatus 是否同步子任务状态
     * @param syncSubTasksPriority 是否同步子任务优先级
     * @param forceDueDateUpdate 是否强制更新截止日期
     * @param statusChangeReason 状态变更原因
     * @return 主任务编辑命令
     */
    fun toEditMainTaskCommand(
        request: EditTaskRequest,
        userId: Long,
        syncSubTasksStatus: Boolean = true,
        syncSubTasksPriority: Boolean = true,
        forceDueDateUpdate: Boolean = false,
        statusChangeReason: String? = null
    ): Mono<EditMainTaskCommand> {
        log.debug("转换为主任务编辑命令，任务ID={}", request.taskId)
        
        // 计算优先级分数
        return calculatePriorityScore(request.priorityId)
            .map { priorityScore ->
                EditMainTaskCommand(
                    taskId = request.taskId,
                    userId = userId,
                    title = request.title,
                    description = request.description,
                    statusId = request.statusId,
                    priorityId = request.priorityId,
                    priorityScore = priorityScore,
                    assigneeId = request.assigneeId,
                    dueDate = request.dueDate,
                    syncSubTasksStatus = syncSubTasksStatus,
                    syncSubTasksPriority = syncSubTasksPriority,
                    forceDueDateUpdate = forceDueDateUpdate,
                    statusChangeReason = statusChangeReason
                )
            }
    }

    /**
     * 将编辑任务请求转换为子任务编辑命令
     * 
     * @param request 编辑任务请求
     * @param userId 当前用户ID
     * @param parentTaskId 父任务ID
     * @param autoUpdateParentStatus 是否自动更新父任务状态
     * @param allowStatusMismatch 是否允许状态不一致
     * @param statusChangeReason 状态变更原因
     * @return 子任务编辑命令
     */
    fun toEditSubTaskCommand(
        request: EditTaskRequest,
        userId: Long,
        parentTaskId: Long,
        autoUpdateParentStatus: Boolean = true,
        allowStatusMismatch: Boolean = true,
        statusChangeReason: String? = null
    ): Mono<EditSubTaskCommand> {
        log.debug("转换为子任务编辑命令，任务ID={}，父任务ID={}", request.taskId, parentTaskId)
        
        // 计算优先级分数
        return calculatePriorityScore(request.priorityId)
            .map { priorityScore ->
                EditSubTaskCommand(
                    taskId = request.taskId,
                    userId = userId,
                    title = request.title,
                    description = request.description,
                    statusId = request.statusId,
                    priorityId = request.priorityId,
                    priorityScore = priorityScore,
                    assigneeId = request.assigneeId,
                    dueDate = request.dueDate,
                    parentTaskId = parentTaskId,
                    autoUpdateParentStatus = autoUpdateParentStatus,
                    allowStatusMismatch = allowStatusMismatch,
                    statusChangeReason = statusChangeReason
                )
            }
    }
    
    /**
     * 根据任务类型创建相应的编辑命令
     * 
     * @param request 编辑任务请求
     * @param task 任务对象
     * @param userId 当前用户ID
     * @return 编辑命令的 Mono 包装
     */
    fun createEditCommandByTaskType(
        request: EditTaskRequest,
        task: Task,
        userId: Long
    ): Mono<EditTaskCommand> {
        return if (task.parentTaskId == null) {
            // 主任务
            log.debug("创建主任务编辑命令，任务ID={}", request.taskId)
            toEditMainTaskCommand(request, userId)
        } else {
            // 子任务
            log.debug("创建子任务编辑命令，任务ID={}，父任务ID={}", request.taskId, task.parentTaskId)
            toEditSubTaskCommand(request, userId, task.parentTaskId!!)
        }.map { it as EditTaskCommand }
    }

    /**
     * 创建状态变更命令
     * 
     * @param taskId 任务ID
     * @param oldStatusId 原状态ID
     * @param newStatusId 新状态ID
     * @param userId 当前用户ID
     * @return 状态变更命令
     */
    fun createChangeStatusCommand(
        taskId: Long,
        oldStatusId: Long,
        newStatusId: Long,
        userId: Long
    ): ChangeStatusCommand {
        log.debug("创建状态变更命令，任务ID={}，从状态{}变更到状态{}", taskId, oldStatusId, newStatusId)
        
        return ChangeStatusCommand(
            taskId = taskId,
            userId = userId,
            oldStatusId = oldStatusId,
            newStatusId = newStatusId
        )
    }
    
    /**
     * 根据优先级ID计算优先级分数
     * 
     * @param priorityId 优先级ID
     * @return 优先级分数（0-100）
     */
    private fun calculatePriorityScore(priorityId: Long): Mono<Int> {
        log.debug("计算优先级分数，优先级ID={}", priorityId)
        
        return priorityRepository.findById(priorityId)
            .map { priority -> 
                // 如果优先级有预设的score，则直接使用
                if (priority.score > 0) {
                    priority.score
                } else {
                    // 否则使用优先级的level计算得分
                    // 这里需要获取项目中所有优先级来计算得分范围
                    50 // 默认返回中等优先级分数，实际逻辑应该更复杂
                }
            }
            .doOnNext { score -> log.debug("计算得到优先级分数={}", score) }
            .defaultIfEmpty(50) // 如果找不到优先级，默认返回中等优先级分数
            .onErrorReturn(50) // 如果发生错误，默认返回中等优先级分数
    }
}
