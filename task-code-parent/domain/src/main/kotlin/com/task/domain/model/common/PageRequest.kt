package com.task.domain.model.common

/**
 * 分页请求参数
 */
data class PageRequest(
    val pageNumber: Int,
    val pageSize: Int
)