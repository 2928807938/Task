package com.task.infrastructure.persistence.record

import com.task.infrastructure.persistence.base.BaseRecord
import org.springframework.data.relational.core.mapping.Table

/**
 * 任务依赖关系数据库记录
 * 对应数据库中t_task_dependency表
 */
@Table("t_task_dependency")
class TaskDependencyRecord(

    /**
     * 依赖方任务ID
     */
    var taskId: Long,
    
    /**
     * 被依赖任务ID
     */
    var dependsOnTaskId: Long,
    
    /**
     * 依赖关系说明
     */
    var description: String? = null
) : BaseRecord()
