package com.task.application.request

import jakarta.validation.constraints.NotNull

/**
 * 获取项目成员请求
 * 用于查询项目成员列表
 */
data class GetProjectMembersRequest(

    /**
     * 项目ID
     */
    @NotNull(message = "项目id不能为空")
    val projectId: Long,
    
    /**
     * 成员名称（可选，用于模糊查询）
     * 如果提供，则只返回名称包含该字符串的成员
     */
    val memberName: String? = null
)
