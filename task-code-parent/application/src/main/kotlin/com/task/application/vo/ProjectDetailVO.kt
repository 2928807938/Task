package com.task.application.vo

import java.time.OffsetDateTime

/**
 * 项目详情视图对象
 * 包含项目的完整详细信息，包括项目基本信息、团队信息、任务列表和成员列表等
 */
data class ProjectDetailVO(

    /**
     * 项目ID，项目的唯一标识符
     */
    val id: Long,

    /**
     * 项目名称
     */
    val name: String,

    /**
     * 项目描述，可为空
     */
    val description: String?,

    /**
     * 所属团队ID，可为空（表示个人项目）
     */
    val teamId: Long?,

    /**
     * 所属团队名称，可为空（表示个人项目）
     */
    val teamName: String?,

    /**
     * 项目所有者ID
     */
    val ownerId: Long,

    /**
     * 项目所有者名称
     */
    val ownerName: String,

    /**
     * 项目成员数量
     */
    val memberCount: Int,

    /**
     * 项目任务总数
     */
    val taskCount: Int,

    /**
     * 项目已完成任务数
     */
    val completedTaskCount: Int,

    /**
     * 项目整体进度（百分比，0-100）
     */
    val progress: Int,

    /**
     * 是否已归档
     */
    val archived: Boolean,
    
    /**
     * 任务状态趋势数据
     * 展示不同状态的任务随时间的分布趋势
     */
    val taskStatusTrend: TaskStatusTrendVO,

    /**
     * 项目任务列表
     * 包含项目中的5条任务信息，用于项目详情页展示
     */
    val tasks: List<TaskVO> = emptyList(),

    /**
     * 项目成员列表
     * 包含项目中的5位成员信息，用于项目详情页展示
     */
    val members: List<ProjectMemberSimpleVO> = emptyList(),

    /**
     * 项目创建时间
     */
    val createdAt: OffsetDateTime?,

    /**
     * 项目最后更新时间，可为空
     */
    val updatedAt: OffsetDateTime?
)