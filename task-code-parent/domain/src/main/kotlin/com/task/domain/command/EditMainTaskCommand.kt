package com.task.domain.command

import java.time.OffsetDateTime

/**
 * 主任务修改命令
 * 针对主任务特有的修改逻辑和验证规则
 */
class EditMainTaskCommand(
    override val taskId: Long,
    override val userId: Long,
    override val title: String? = null,
    override val description: String? = null,
    override val statusId: Long? = null,
    override val priorityId: Long? = null,
    override val priorityScore: Int? = null,
    override val assigneeId: Long? = null,
    override val dueDate: OffsetDateTime? = null,
    
    /**
     * 是否同步更新所有子任务状态
     * 当主任务状态变更时，是否应用于所有子任务
     */
    val syncSubTasksStatus: Boolean = false,
    
    /**
     * 是否同步更新所有子任务优先级
     * 当主任务优先级变更时，是否应用于所有子任务
     */
    val syncSubTasksPriority: Boolean = false,
    
    /**
     * 是否强制更新截止日期
     * 如果为true，即使有冲突的子任务截止日期，也会强制更新主任务截止日期
     */
    val forceDueDateUpdate: Boolean = false,
    
    /**
     * 状态变更原因
     * 记录状态变更的原因，用于历史记录
     */
    val statusChangeReason: String? = null
) : EditTaskCommand(
    taskId, userId, title, description, statusId, 
    priorityId, priorityScore, assigneeId, dueDate
) {
    /**
     * 验证主任务修改命令是否有效
     */
    override fun validate(): String? {
        // 标题不能为空
        if (title != null && title.isBlank()) {
            return "任务标题不能为空"
        }
        
        // 优先级分数必须在0-100之间
        if (priorityScore != null && (priorityScore < 0 || priorityScore > 100)) {
            return "优先级分数必须在0-100之间"
        }
        
        // 如果状态变更但没有提供原因，可能需要提示用户
        if (statusId != null && statusChangeReason.isNullOrBlank()) {
            // 这里仅作为提示，不是强制错误
            // return "建议提供状态变更原因"
        }
        
        return null // 验证通过
    }
    
    companion object {
        /**
         * 从基础编辑命令创建主任务编辑命令
         * 
         * @param baseCommand 基础命令对象
         * @param syncSubTasksStatus 是否同步子任务状态
         * @param syncSubTasksPriority 是否同步子任务优先级
         * @param forceDueDateUpdate 是否强制更新截止日期
         * @param statusChangeReason 状态变更原因
         * @return 主任务编辑命令
         */
        fun fromBaseCommand(
            baseCommand: EditTaskCommand,
            syncSubTasksStatus: Boolean = false,
            syncSubTasksPriority: Boolean = false,
            forceDueDateUpdate: Boolean = false,
            statusChangeReason: String? = null
        ): EditMainTaskCommand {
            return EditMainTaskCommand(
                taskId = baseCommand.taskId,
                userId = baseCommand.userId,
                title = baseCommand.title,
                description = baseCommand.description,
                statusId = baseCommand.statusId,
                priorityId = baseCommand.priorityId,
                priorityScore = baseCommand.priorityScore,
                assigneeId = baseCommand.assigneeId,
                dueDate = baseCommand.dueDate,
                syncSubTasksStatus = syncSubTasksStatus,
                syncSubTasksPriority = syncSubTasksPriority,
                forceDueDateUpdate = forceDueDateUpdate,
                statusChangeReason = statusChangeReason
            )
        }
    }
}
