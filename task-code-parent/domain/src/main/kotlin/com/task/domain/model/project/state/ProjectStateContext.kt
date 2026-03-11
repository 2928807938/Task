package com.task.domain.model.project.state

/**
 * 项目状态转换上下文
 * 
 * 包含项目状态转换过程中需要的信息
 */
data class ProjectStateContext(
    /**
     * 项目ID
     */
    val projectId: Long,
    
    /**
     * 操作者ID
     */
    val operatorId: Long,
    
    /**
     * 状态转换原因
     * 可选，用于记录状态转换的原因
     */
    val reason: String? = null,
    
    /**
     * 元数据
     * 可选，用于存储状态转换过程中的额外信息
     */
    val metadata: Map<String, Any> = emptyMap()
)
