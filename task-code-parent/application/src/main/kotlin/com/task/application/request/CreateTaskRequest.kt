package com.task.application.request

import jakarta.validation.Valid
import jakarta.validation.constraints.NotBlank
import jakarta.validation.constraints.NotNull
import jakarta.validation.constraints.PositiveOrZero
import java.time.OffsetDateTime

/**
 * 创建任务请求
 */
data class CreateTaskRequest(

    /**
     * 项目ID
     */
    @field:NotNull(message = "项目ID不能为空")
    val projectId: Long,

    /**
     * 主任务信息
     */
    @field:NotNull(message = "主任务信息不能为空")
    @field:Valid
    val mainTask: MainTaskRequest,
    
    /**
     * 子任务列表
     */
    @field:Valid
    val subTasks: List<SubTaskRequest> = emptyList(),

    /**
     * 需求对话ID（可选）
     * 传入后可在创建任务时精确匹配分析缓存并统一落库
     */
    val requirementConversationId: Long? = null
)

/**
 * 主任务请求
 */
data class MainTaskRequest(

    /**
     * 任务名称
     */
    @field:NotBlank(message = "任务名称不能为空")
    val name: String,
    
    /**
     * 任务描述
     */
    val description: String? = null,
    
    /**
     * 负责人ID
     */
    val assigneeId: Long? = null,
    
    /**
     * 总工时
     */
    @field:PositiveOrZero(message = "总工时不能为负数")
    val totalHours: Double? = null,
    
    /**
     * 优先级分数 (0-100)
     */
    @field:PositiveOrZero(message = "优先级分数必须在0-100之间")
    val priorityScore: Int? = null,
    
    /**
     * 截止时间
     */
    var endTime: OffsetDateTime? = null
)

/**
 * 子任务请求
 */
data class SubTaskRequest(

    /**
     * 任务ID
     * 用于绑定依赖关系
     */
    val id: String? = null,

    /**
     * 任务名称
     */
    @field:NotBlank(message = "任务名称不能为空")
    val name: String,
    
    /**
     * 任务描述
     */
    val description: String? = null,
    
    /**
     * 负责人ID
     */
    val assigneeId: Long? = null,
    
    /**
     * 工时
     */
    @field:PositiveOrZero(message = "工时不能为负数")
    val hours: Double? = null,
    
    /**
     * 优先级分数 (0-100)
     */
    @field:PositiveOrZero(message = "优先级分数必须在0-100之间")
    val priorityScore: Int? = null,
    
    /**
     * 依赖任务名称列表
     */
    val dependencies: List<String> = emptyList()
)
