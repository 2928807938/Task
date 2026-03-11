package com.task.domain.command

import java.time.OffsetDateTime

/**
 * 任务修改命令基类
 * 封装了任务修改的基本参数
 */
abstract class EditTaskCommand(
    /**
     * 任务ID
     */
    open val taskId: Long,
    
    /**
     * 当前操作用户ID
     */
    open val userId: Long,
    
    /**
     * 新任务标题
     */
    open val title: String? = null,
    
    /**
     * 新任务描述
     */
    open val description: String? = null,
    
    /**
     * 新状态ID
     */
    open val statusId: Long? = null,
    
    /**
     * 新优先级ID
     */
    open val priorityId: Long? = null,
    
    /**
     * 优先级分数 (0-100)
     */
    open val priorityScore: Int? = null,
    
    /**
     * 新负责人ID
     */
    open val assigneeId: Long? = null,
    
    /**
     * 新开始时间
     */
    open val startTime: OffsetDateTime? = null,

    /**
     * 新截止日期
     */
    open val dueDate: OffsetDateTime? = null
) {
    /**
     * 验证命令是否有效
     * @return 错误信息，如果没有错误则返回null
     */
    abstract fun validate(): String?
}
