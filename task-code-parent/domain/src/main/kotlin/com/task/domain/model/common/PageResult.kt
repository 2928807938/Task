package com.task.domain.model.common

/**
 * 分页查询结果类
 * 用于封装分页数据和总记录数
 * @param T 数据项类型
 */
data class PageResult<T>(
    /**
     * 当前页的数据列表
     */
    val items: List<T>,

    /**
     * 总记录数
     */
    val total: Int,

    /**
     * 当前页码，从0开始
     */
    val page: Int,

    /**
     * 每页大小
     */
    val size: Int
) {
    /**
     * 总页数
     */
    val totalPages: Int = if (size > 0) ((total + size - 1) / size).toInt() else 0
    
    /**
     * 是否有下一页
     */
    val hasNext: Boolean = page < totalPages - 1
}