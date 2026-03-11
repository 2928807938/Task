package com.task.application.vo

import java.time.OffsetDateTime

/**
 * 仪表盘视图对象
 * 用于向前端展示仪表盘的综合数据
 */
data class DashboardVO(
    /**
     * 当前日期时间
     * 使用OffsetDateTime类型包含时区信息
     */
    val currentDate: OffsetDateTime,
    
    /**
     * 未完成的任务列表
     */
    val tasks: List<TaskBasicVO>
)

/**
 * 任务日历视图对象
 */
data class TaskCalendarVO(
    /**
     * 年份
     */
    val year: Int,
    
    /**
     * 月份 (1-12)
     */
    val month: Int,
    
    /**
     * 日历天数据
     */
    val days: List<TaskCalendarDayVO>
)

/**
 * 任务日历天视图对象
 */
data class TaskCalendarDayVO(
    /**
     * 日期 (1-31)
     */
    val day: Int,
    
    /**
     * 是否有任务
     */
    val hasTask: Boolean,
    
    /**
     * 任务数量
     */
    val taskCount: Int,
    
    /**
     * 是否为当天
     */
    val isToday: Boolean
)

/**
 * 团队活动视图对象
 */
data class TeamActivityVO(
    /**
     * 活动ID
     */
    val id: Long,
    
    /**
     * 用户ID
     */
    val userId: Long,
    
    /**
     * 用户名
     */
    val username: String,
    
    /**
     * 用户头像URL
     */
    val avatar: String?,
    
    /**
     * 活动类型
     * 如：创建任务、完成任务、评论任务等
     */
    val actionType: String,
    
    /**
     * 活动描述
     */
    val description: String,
    
    /**
     * 目标类型
     * 如：任务、项目、评论等
     */
    val targetType: String,
    
    /**
     * 目标ID
     */
    val targetId: Long,
    
    /**
     * 目标名称
     */
    val targetName: String,
    
    /**
     * 活动时间
     * 格式为ISO-8601标准的日期时间字符串
     */
    val timestamp: String
)
