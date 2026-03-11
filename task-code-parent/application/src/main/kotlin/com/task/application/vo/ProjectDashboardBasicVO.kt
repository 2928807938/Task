package com.task.application.vo

/**
 * 项目仪表板基础信息视图对象
 * 提供项目仪表板所需的基本信息
 */
data class ProjectDashboardBasicVO(
    /**
     * 项目ID
     */
    val id: Long,

    /**
     * 项目名称
     */
    val name: String,

    /**
     * 项目描述
     */
    val description: String?,

    /**
     * 项目归档状态
     */
    val archived: Boolean,

    /**
     * 项目时间信息
     */
    val timeInfo: ProjectTimeInfoVO,

    /**
     * 项目团队信息
     */
    val teamInfo: ProjectTeamInfoVO,

    /**
     * 项目创建者信息
     */
    val creatorInfo: ProjectCreatorInfoVO
)

// 项目状态相关VO对象已移除，替换为简单的归档状态字段

/**
 * 项目时间信息视图对象
 */
data class ProjectTimeInfoVO(
    /**
     * 项目开始日期
     */
    val startDate: String?,

    /**
     * 项目创建时间
     */
    val createdAt: String,

    /**
     * 项目已进行天数
     */
    val daysElapsed: Int,

    /**
     * 项目进度百分比
     * 基于任务完成情况计算，而非时间进度
     */
    val progressPercent: Int
)

/**
 * 项目团队信息视图对象
 */
data class ProjectTeamInfoVO(
    /**
     * 团队ID
     */
    val id: Long,

    /**
     * 团队名称
     */
    val name: String
)

/**
 * 项目创建者信息视图对象
 */
data class ProjectCreatorInfoVO(
    /**
     * 创建者ID
     */
    val id: Long,

    /**
     * 创建者名称
     */
    val name: String,
)