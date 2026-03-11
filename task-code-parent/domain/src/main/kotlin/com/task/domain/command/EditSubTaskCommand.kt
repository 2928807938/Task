package com.task.domain.command

import java.time.OffsetDateTime

/**
 * 子任务修改命令
 * 针对子任务特有的修改逻辑和验证规则
 */
class EditSubTaskCommand(
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
     * 父任务ID
     * 子任务必须有父任务
     */
    val parentTaskId: Long,
    
    /**
     * 是否在完成时自动检查更新父任务状态
     * 当所有子任务都完成时，是否自动将父任务标记为完成
     */
    val autoUpdateParentStatus: Boolean = true,
    
    /**
     * 是否允许状态与父任务状态不一致
     * 例如，父任务完成但子任务仍在进行中
     */
    val allowStatusMismatch: Boolean = true,
    
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
     * 验证子任务修改命令是否有效
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
        
        // 必须有父任务ID
        if (parentTaskId <= 0) {
            return "子任务必须有有效的父任务ID"
        }
        
        return null // 验证通过
    }
    
    companion object {
        /**
         * 从基础编辑命令创建子任务编辑命令
         * 
         * @param baseCommand 基础命令对象
         * @param parentTaskId 父任务ID
         * @param autoUpdateParentStatus 是否自动更新父任务状态
         * @param allowStatusMismatch 是否允许状态不一致
         * @param statusChangeReason 状态变更原因
         * @return 子任务编辑命令
         */
        fun fromBaseCommand(
            baseCommand: EditTaskCommand,
            parentTaskId: Long,
            autoUpdateParentStatus: Boolean = true,
            allowStatusMismatch: Boolean = true,
            statusChangeReason: String? = null
        ): EditSubTaskCommand {
            return EditSubTaskCommand(
                taskId = baseCommand.taskId,
                userId = baseCommand.userId,
                title = baseCommand.title,
                description = baseCommand.description,
                statusId = baseCommand.statusId,
                priorityId = baseCommand.priorityId,
                priorityScore = baseCommand.priorityScore,
                assigneeId = baseCommand.assigneeId,
                dueDate = baseCommand.dueDate,
                parentTaskId = parentTaskId,
                autoUpdateParentStatus = autoUpdateParentStatus,
                allowStatusMismatch = allowStatusMismatch,
                statusChangeReason = statusChangeReason
            )
        }
    }
}
