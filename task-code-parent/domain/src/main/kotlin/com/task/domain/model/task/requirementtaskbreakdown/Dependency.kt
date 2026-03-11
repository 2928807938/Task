package com.task.domain.model.task.requirementtaskbreakdown

/**
 * 依赖关系值对象
 * 包含任务的依赖任务ID
 */
data class Dependency(
    /**
     * 依赖的任务ID
     */
    val taskId: Long
) 