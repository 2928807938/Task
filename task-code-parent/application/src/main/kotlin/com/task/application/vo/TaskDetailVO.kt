package com.task.application.vo

/**
 * 任务详情视图对象
 * 用于向前端展示任务的详细信息
 */
data class TaskDetailVO(
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
     * 子任务列表
     */
    val subTasks: List<TaskVO>,

    /**
     * 依赖任务列表
     */
    val dependencies: List<TaskVO>,

    /**
     * 协作记录列表
     */
    val collaborations: List<CollaborationRecordVO>,

    /**
     * 关联资源列表
     */
    val resources: List<ResourceVO>,

    /**
     * 任务进度(0-100)
     */
    val progress: Int,

    /**
     * 任务总工时
     */
    val totalHours: Double,

    /**
     * 已完成工时
     */
    val completedHours: Double
)

/**
 * 协作记录视图对象
 * 用于展示任务的协作历史记录
 */
data class CollaborationRecordVO(
    /**
     * 记录时间
     * 格式为"yyyy-MM-dd HH:mm"
     */
    val time: String,

    /**
     * 用户名称
     */
    val user: String,

    /**
     * 记录内容
     */
    val content: String
)

/**
 * 资源视图对象
 * 用于展示与任务关联的资源
 */
data class ResourceVO(
    /**
     * 资源类型
     * 如：pdf、link、sketch等
     */
    val type: String,

    /**
     * 资源名称
     */
    val name: String,

    /**
     * 资源URL
     */
    val url: String
)