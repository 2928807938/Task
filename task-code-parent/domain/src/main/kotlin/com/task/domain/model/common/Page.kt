package com.task.domain.model.common

/**
 * 分页结果接口
 * 用于封装分页查询结果
 */
interface Page<T> {
    /**
     * 当前页的内容列表
     */
    val content: List<T>

    /**
     * 总记录数
     */
    val totalElements: Long

    /**
     * 总页数
     */
    val totalPages: Int

    /**
     * 当前页码，从0开始
     */
    val pageNumber: Int

    /**
     * 每页大小
     */
    val pageSize: Int

    /**
     * 当前页是否有内容
     */
    val hasContent: Boolean
        get() = content.isNotEmpty()

    /**
     * 是否是第一页
     */
    val isFirst: Boolean
        get() = pageNumber == 0

    /**
     * 是否是最后一页
     */
    val isLast: Boolean
        get() = pageNumber >= totalPages - 1
}