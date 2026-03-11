package com.task.application.request

/**
 * 团队搜索请求
 * 用于搜索用户所属的团队列表
 */
data class TeamSearchRequest(
    /**
     * 搜索关键词，用于匹配团队名称或描述
     * 可选参数，为空时返回所有团队
     */
    val keyword: String? = null
)
