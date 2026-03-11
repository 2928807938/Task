package com.task.application.request

import jakarta.validation.constraints.Min
import jakarta.validation.constraints.NotNull
import jakarta.validation.constraints.Positive
import jakarta.validation.constraints.Size
import java.time.OffsetDateTime

data class CreateTeamRequest(
    @field:NotNull(message = "团队名称不能为空")
    @field:Size(min = 1, max = 50, message = "团队名称长度应在1-50个字符之间")
    val name: String,
    
    @field:Size(max = 200, message = "团队描述不能超过200个字符")
    val description: String?
)

/**
 * 获取团队首页请求
 */
data class TeamHomePageRequest(
    @field:NotNull(message = "团队ID不能为空")
    @field:Positive(message = "团队ID必须为正数")
    var teamId: Long
)

/**
 * 获取团队概览请求
 */
data class TeamOverviewRequest(
    @field:NotNull(message = "团队ID不能为空")
    @field:Positive(message = "团队ID必须为正数")
    var teamId: Long
)

/**
 * 获取团队活跃度热力图数据请求
 */
data class TeamActivityHeatmapRequest(
    @field:NotNull(message = "团队ID不能为空")
    @field:Positive(message = "团队ID必须为正数")
    var teamId: Long,
    
    var startDate: OffsetDateTime? = null,
    
    var endDate: OffsetDateTime? = null
)

/**
 * 获取团队部门结构请求
 */
data class TeamDepartmentStructureRequest(
    @field:NotNull(message = "团队ID不能为空")
    @field:Positive(message = "团队ID必须为正数")
    var teamId: Long
)

/**
 * 获取最近沟通记录请求
 */
data class RecentCommunicationRecordsRequest(
    @field:NotNull(message = "团队ID不能为空")
    @field:Positive(message = "团队ID必须为正数")
    var teamId: Long,
    
    @field:Min(value = 1, message = "记录数量限制不能小于1")
    var limit: Int = 10
)

/**
 * 获取团队成员请求
 */
data class GetTeamMembersRequest(
    @field:NotNull(message = "团队ID不能为空")
    @field:Positive(message = "团队ID必须为正数")
    var teamId: Long,
    
    /**
     * 成员名称（可选，用于模糊查询）
     * 如果提供，则只返回名称包含该字符串的成员
     */
    val memberName: String? = null
)
