package com.task.application.request

import jakarta.validation.constraints.Max
import jakarta.validation.constraints.Min

/**
 * 获取项目任务列表请求
 */
data class GetProjectTasksRequest(
    /**
     * 优先级筛选条件
     * 可选，为空表示不筛选优先级
     */
    val priority: String? = null,
    
    /**
     * 任务类型
     * main: 只查询主任务
     * sub: 只查询子任务
     * all: 查询所有任务
     */
    val taskType: String = "main",
    
    /**
     * 页码，从1开始
     */
    @field:Min(value = 1, message = "页码必须大于或等于1")
    val pageNumber: Int = 1,
    
    /**
     * 每页大小
     */
    @field:Min(value = 1, message = "每页大小必须大于或等于1")
    @field:Max(value = 100, message = "每页大小不能超过100")
    val pageSize: Int = 10
)