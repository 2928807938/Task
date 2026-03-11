package com.task.shared.api.response

import java.io.Serializable

/**
 * 分页数据包装类
 * 用于封装分页查询的结果
 *
 * @param T 分页数据项类型
 * @property content 当前页的数据列表
 * @property current 当前页码
 * @property size 每页大小
 * @property total 总记录数
 * @property pages 总页数
 */
data class PageData<T>(
    val content: List<T>,
    val current: Int,
    val size: Int,
    val total: Int,
    val pages: Int
) : Serializable {

    companion object {
        private const val serialVersionUID = 1L

        /**
         * 创建分页数据对象
         *
         * @param content 当前页的数据列表
         * @param current 当前页码
         * @param size 每页大小
         * @param total 总记录数
         * @return 分页数据对象
         */
        fun <T> of(
            content: List<T>,
            current: Int,
            size: Int,
            total: Int
        ): PageData<T> {
            val pages = if (size > 0) (total + size - 1) / size else 0
            return PageData(content, current, size, total, pages)
        }

        /**
         * 创建空的分页数据对象
         *
         * @param size 每页大小
         * @return 空的分页数据对象
         */
        fun <T> empty(size: Int = 10): PageData<T> =
            PageData(emptyList(), 1, size, 0, 0)
    }
}
