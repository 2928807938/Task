package com.task.domain.model.task

import java.time.OffsetDateTime

/**
 * 任务依赖关系领域模型
 * 表示任务之间的单向依赖关系
 * 使用前置任务(predecessor)和后续任务(successor)的概念，清晰表达依赖方向
 */
class TaskDependency(

    /**
     * 依赖关系唯一标识，TSID格式（有序的分布式ID）
     */
    var id: Long? = null,
    
    /**
     * 后续任务ID，表示需要等待前置任务完成才能开始的任务
     */
    var successorTaskId: Long,
    
    /**
     * 前置任务ID，表示必须先完成的任务
     */
    var predecessorTaskId: Long,
    
    /**
     * 依赖关系说明，描述为什么存在此依赖
     */
    var description: String? = null,
    
    /**
     * 后续任务引用，依赖于其他任务的任务
     */
    var successorTask: Task? = null,
    
    /**
     * 前置任务引用，必须先完成的任务
     */
    var predecessorTask: Task? = null,
    
    /**
     * 记录创建时间
     */
    var createdAt: OffsetDateTime = OffsetDateTime.now(),
    
    /**
     * 记录最后更新时间
     */
    var updatedAt: OffsetDateTime? = null,

    /**
     * 乐观锁版本号，用于并发控制
     */
    var version: Int
) {
    init {
        // 不允许任务依赖自身
        require(successorTaskId != predecessorTaskId) { "任务不能依赖自身" }
    }
}