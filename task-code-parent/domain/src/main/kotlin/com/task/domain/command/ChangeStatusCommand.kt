package com.task.domain.command

/**
 * 修改任务状态命令
 * 用于处理任务状态变更操作
 */
data class ChangeStatusCommand(
    /**
     * 任务ID
     */
    val taskId: Long,
    
    /**
     * 操作用户ID
     */
    val userId: Long,
    
    /**
     * 原状态ID
     */
    val oldStatusId: Long,
    
    /**
     * 新状态ID
     */
    val newStatusId: Long,
    
    /**
     * 状态变更原因（可选）
     */
    val reason: String? = null
) {
    /**
     * 验证命令
     * 
     * @return 错误消息，如果验证通过则返回null
     */
    fun validate(): String? {
        if (taskId <= 0) {
            return "任务ID必须大于0"
        }
        if (userId <= 0) {
            return "用户ID必须大于0"
        }
        if (oldStatusId <= 0) {
            return "原状态ID必须大于0"
        }
        if (newStatusId <= 0) {
            return "新状态ID必须大于0"
        }
        return null
    }
}
