package com.task.application.request

import jakarta.validation.constraints.*

/**
 * 创建项目请求
 * 包含创建新项目所需的所有信息，包括基本信息、团队信息以及优先级和状态流程设置
 */
data class CreateProjectRequest(
    /**
     * 项目名称
     * 不能为空
     */
    @field:NotBlank(message = "项目名称不能为空")
    @field:Size(min = 1, max = 100, message = "项目名称长度必须在1-100个字符之间")
    val name: String,
    
    /**
     * 项目描述
     * 可选
     */
    @field:Size(max = 1000, message = "项目描述不能超过1000个字符")
    val description: String,
    
    /**
     * 团队ID
     * 项目所属的团队
     */
    @field:NotNull(message = "团队ID不能为空")
    val teamId: Long,
    
    /**
     * 优先级体系类型
     * 可选值：standard(标准)、advanced(高级)、custom(自定义)
     */
    @field:NotBlank(message = "优先级体系类型不能为空")
    val prioritySystem: String,
    
    /**
     * 状态流程体系类型
     * 可选值：standard(标准)、extended(扩展)、custom(自定义)
     */
    @field:NotBlank(message = "状态流程体系类型不能为空")
    val statusSystem: String,
    
    /**
     * 自定义优先级项列表
     * 当prioritySystem为custom时必填
     */
    val customPriorityItems: List<PriorityItem> = emptyList(),
    
    /**
     * 自定义状态项列表
     * 当statusSystem为custom时必填
     */
    val customStatusItems: List<StatusItem> = emptyList(),
    
    /**
     * 自定义状态转换规则
     * 当statusSystem为custom时必填
     */
    val customStatusTransitions: List<StatusTransitionRule> = emptyList()
)

/**
 * 更新项目基本请求
 */
data class UpdateProjectBasicInfoRequest(
    /**
     * 项目名称
     * 可选，如果提供则不能为空
     */
    @field:Size(min = 2, max = 100, message = "项目名称长度必须在2-100个字符之间")
    val name: String? = null,

    /**
     * 项目描述
     * 可选
     */
    @field:Size(max = 500, message = "项目描述不能超过500个字符")
    val description: String? = null
)

data class AddProjectMemberRequest(

    /**
     * 用户id
     */
    @field:NotNull(message = "用户ID不能为空")
    val userId: Long
)

/**
 * 移除项目成员请求
 * 包含要移除的用户ID
 */
data class RemoveProjectMemberRequest(
    /**
     * 要移除的用户ID
     */
    @field:NotNull(message = "用户ID不能为空")
    val userId: Long
)

/**
 * 获取项目列表请求
 * 
 * @property page 页码（从0开始）
 * @property size 每页大小
 * @property name 项目名称（可选，模糊查询）
 */
data class GetProjectsRequest(
    /**
     * 页码（从0开始）
     */
    @field:Min(value = 0, message = "页码不能小于0")
    val pageNumber: Int = 0,
    
    /**
     * 每页大小
     */
    @field:Min(value = 1, message = "每页大小不能小于1")
    @field:Max(value = 100, message = "每页大小不能超过100")
    val pageSize: Int = 10,
    
    /**
     * 项目名称（可选，模糊查询）
     */
    @field:Size(max = 50, message = "查询名称不能超过50个字符")
    val name: String? = null,
    
    /**
     * 排序字段
     */
    val sortField: String = "createdAt",
    
    /**
     * 排序顺序 (asc/desc)
     */
    val sortOrder: String = "desc"
)

/**
 * 项目归档请求
 * 用于项目归档和取消归档操作
 * @deprecated 使用 {@link ProjectArchiveStatusRequest} 代替
 */
data class ProjectArchiveRequest(
    /**
     * 归档或取消归档的原因
     * 可选，用于记录为什么要归档或取消归档
     */
    @field:Size(max = 500, message = "原因不能超过500个字符")
    val reason: String? = null
)

/**
 * 项目归档状态请求
 * 用于设置项目的归档状态，可以设置为归档或非归档
 */
data class ProjectArchiveStatusRequest(
    /**
     * 归档状态
     * true表示将项目设置为已归档，false表示将项目设置为未归档
     */
    @field:NotNull(message = "归档状态不能为空")
    val archived: Boolean,
    
    /**
     * 操作原因
     * 可选，用于记录为什么要设置这个归档状态
     */
    @field:Size(max = 500, message = "原因不能超过500个字符")
    val reason: String? = null
)
