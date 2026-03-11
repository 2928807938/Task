package com.task.domain.model.task

import com.task.domain.model.project.Project
import com.task.domain.model.project.ProjectStatus
import com.task.domain.model.user.User
import java.time.OffsetDateTime

/**
 * 任务领域模型
 * 代表系统中的一个任务
 */
data class Task(
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
     */
    val description: String? = null,

    /**
     * 所属项目ID
     */
    val projectId: Long,

    /**
     * 所属项目
     */
    val project: Project? = null,

    /**
     * 父任务ID，用于实现任务层级结构
     */
    val parentTaskId: Long? = null,

    /**
     * 父任务
     */
    val parentTask: Task? = null,

    /**
     * 子任务列表
     */
    val subTasks: List<Task> = emptyList(),

    /**
     * 任务状态ID
     */
    var statusId: Long,

    /**
     * 任务状态
     */
    val status: ProjectStatus? = null,

    /**
     * 任务优先级ID
     */
    val priorityId: Long,

    /**
     * 任务创建者ID
     */
    val creatorId: Long,

    /**
     * 任务创建者
     */
    val creator: User? = null,

    /**
     * 任务负责人ID
     */
    val assigneeId: Long? = null,

    /**
     * 任务开始时间
     */
    val startTime: OffsetDateTime? = null,

    /**
     * 任务截止日期
     */
    val dueDate: OffsetDateTime? = null,

    /**
     * 任务标签列表
     */
    val tags: List<Tag> = emptyList(),

    /**
     * 任务评论列表
     */
    val comments: List<TaskComment> = emptyList(),

    /**
     * 任务时间记录列表
     */
    val timeEntries: List<TimeEntry> = emptyList(),
    
    /**
     * 此任务的前置任务列表（此任务依赖的任务）
     * 表示这些前置任务必须先完成，本任务才能开始
     */
    val predecessors: List<TaskDependency> = emptyList(),
    
    /**
     * 此任务的后续任务列表（依赖此任务的任务）
     * 表示这个任务完成后，哪些任务可以开始
     */
    val successors: List<TaskDependency> = emptyList(),

    /**
     * 创建时间
     */
    val createdAt: OffsetDateTime,

    /**
     * 更新时间
     */
    var updatedAt: OffsetDateTime? = null,

    /**
     * 乐观锁版本号，用于并发控制
     */
    var version: Int
)
