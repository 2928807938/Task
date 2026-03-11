package com.task.domain.model.project

/**
 * 项目归档操作类型
 */
enum class ProjectArchiveOperationType(val value: Int, val description: String) {
    /**
     * 归档操作
     */
    ARCHIVE(1, "归档"),
    
    /**
     * 取消归档操作
     */
    UNARCHIVE(2, "取消归档");
    
    companion object {
        /**
         * 根据值获取对应的枚举
         */
        fun fromValue(value: Int): ProjectArchiveOperationType {
            return values().find { it.value == value } 
                ?: throw IllegalArgumentException("无效的归档操作类型: $value")
        }
    }
}
