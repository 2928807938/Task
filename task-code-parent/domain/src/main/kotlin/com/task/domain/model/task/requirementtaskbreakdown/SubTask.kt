package com.task.domain.model.task.requirementtaskbreakdown

/**
 * 子任务值对象
 * 包含子任务的ID、描述、依赖关系、优先级和并行组
 */
data class SubTask(
    /**
     * 子任务ID
     */
    val id: Long?,
    
    /**
     * 关联的任务ID
     */
    val taskId: Long?,
    
    /**
     * 子任务描述
     */
    val description: String,
    
    /**
     * 依赖关系列表
     */
    val dependency: List<Dependency> = emptyList(),
    
    /**
     * 优先级
     */
    val priority: Int,
    
    /**
     * 并行组标识
     * 相同并行组的任务可以并行执行
     */
    val parallelGroup: String
) 