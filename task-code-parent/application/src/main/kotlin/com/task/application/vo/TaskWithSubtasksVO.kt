package com.task.application.vo

/**
 * 主任务及其子任务的完整视图对象
 * 用于向前端展示主任务及其所有子任务的完整信息
 */
data class TaskWithSubtasksVO(
    /**
     * 主任务基本信息
     */
    val mainTask: TaskBasicVO,

    /**
     * 子任务列表
     * 按照创建时间排序
     */
    val subTasks: List<TaskBasicVO>,
    
    /**
     * 任务总数（主任务+子任务）
     */
    val totalTaskCount: Int,
    
    /**
     * 已完成任务数量
     */
    val completedTaskCount: Int,
    
    /**
     * 总体进度（0-100）
     * 计算方式：已完成任务数 / 总任务数 * 100
     */
    val overallProgress: Int
)
