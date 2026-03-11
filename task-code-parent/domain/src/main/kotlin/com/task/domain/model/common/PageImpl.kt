package com.task.domain.model.common

/**
 * 分页结果实现类
 * 用于实现Page接口，提供具体的分页功能
 */
data class PageImpl<T>(
    override val content: List<T>,
    override val totalElements: Long,
    override val pageNumber: Int,
    override val pageSize: Int
) : Page<T> {
    override val totalPages: Int
        get() = if (pageSize == 0) 1 else ((totalElements + pageSize - 1) / pageSize).toInt()
}