package com.task.application.vo

/**
 * 任务视图对象
 * 用于向前端展示任务的基本信息
 */
data class TaskVO(

    /**
     * 任务唯一标识
     */
    val id: Long,

    /**
     * 任务标题
     */
    val title: String,

    /**
     * 任务描述
     * 可为空，表示任务没有详细描述
     */
    val description: String?,

    /**
     * 状态id
     */
    val statusId: Long,

    /**
     * 任务状态名称
     * 如：待处理、进行中、已完成等
     */
    val status: String,

    /**
     * 任务状态颜色
     */
    val statusColor: String,

    /**
     * 任务优先级名称
     * 如：紧急、重要、普通等
     */
    val priority: String,

    /**
     * 任务优先级颜色
     */
    val priorityColor: String,

    /**
     * 任务负责人姓名
     * 可为空，表示任务尚未分配负责人
     */
    val assignee: String?,

    /**
     * 任务开始时间
     * 格式为ISO-8601标准的日期时间字符串
     * 可为空，表示任务没有设置开始时间
     */
    val startTime: String?,

    /**
     * 任务截止日期
     * 格式为ISO-8601标准的日期时间字符串
     * 可为空，表示任务没有设置截止日期
     */
    val dueDate: String?,

    /**
     * 任务创建时间
     * 格式为ISO-8601标准的日期时间字符串
     */
    val createdAt: String,
    
    /**
     * 是否有附件
     * true表示任务有关联的附件，false表示没有
     */
    val hasAttachments: Boolean = false,
    
    /**
     * 父任务ID
     * 如果是子任务，则此字段表示父任务的ID
     * 如果是主任务，则此字段为null
     */
    val parentTaskId: Long? = null,
    
    /**
     * 任务进度
     * 0-100的整数，表示任务完成的百分比
     */
    val progress: Int = 0
)