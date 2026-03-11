package com.task.application.vo

/**
 * 任务基本信息视图对象
 * 用于展示任务的基本信息，不包含子任务、协作记录等复杂信息
 */
data class TaskBasicVO(
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
     * 任务状态名称
     * 如：待处理、进行中、已完成等
     */
    val status: String,

    /**
     * 任务状态颜色，用于UI显示，格式为十六进制颜色码
     */
    val statusColor: String,

    /**
     * 任务优先级名称
     * 如：紧急、重要、普通等
     */
    val priority: String,

    /**
     * 任务优先级颜色，用于UI显示，格式为十六进制颜色码
     */
    val priorityColor: String,

    /**
     * 任务优先级分数(0-100)
     */
    val priorityScore: Int,

    /**
     * 任务负责人姓名
     * 可为空，表示任务尚未分配负责人
     */
    val assignee: String?,

    /**
     * 任务负责人ID
     * 可为空，表示任务尚未分配负责人
     */
    val assigneeId: Long?,

    /**
     * 任务创建者姓名
     */
    val creator: String?,

    /**
     * 任务创建者ID
     */
    val creatorId: Long,

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
     * 任务更新时间
     * 格式为ISO-8601标准的日期时间字符串
     * 可为空，表示任务未更新过
     */
    val updatedAt: String?,

    /**
     * 父任务ID
     * 可为空，表示该任务是顶级任务
     */
    val parentTaskId: Long?,
    
    /**
     * 任务开始时间
     * 格式为ISO-8601标准的日期时间字符串
     * 可为空，表示任务没有设置开始时间
     */
    val startTime: String?,

    /**
     * 任务进度(0-100)
     */
    val progress: Int
)
