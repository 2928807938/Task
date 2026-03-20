package com.task.application.request

import jakarta.validation.constraints.NotNull

/**
 * 创建需求会话锚点请求
 */
data class CreateRequirementConversationListRequest(
    /**
     * 所属项目ID
     */
    @field:NotNull(message = "项目ID不能为空")
    val projectId: Long
)
