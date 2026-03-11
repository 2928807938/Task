package com.task.infrastructure.persistence.record

import com.task.infrastructure.persistence.base.BaseRecord
import org.springframework.data.relational.core.mapping.Table

/**
 * 任务历史记录持久化对象
 */
@Table("t_task_history")
class TaskHistoryRecord(
    
    /**
     * 任务ID
     */
    var taskId: Long,
    
    /**
     * 修改人ID
     */
    var userId: Long,
    
    /**
     * 操作类型（存储枚举的名称）
     */
    var operationType: String,
    
    /**
     * 修改前的字段值（JSON格式）
     */
    var oldValue: String? = null,
    
    /**
     * 修改后的字段值（JSON格式）
     */
    var newValue: String? = null,
    
    /**
     * 修改的字段名
     */
    var fieldName: String,
    
    /**
     * 描述信息
     */
    var description: String,
    
    /**
     * 是否是主任务的修改
     */
    var isMainTask: Boolean

) : BaseRecord()
