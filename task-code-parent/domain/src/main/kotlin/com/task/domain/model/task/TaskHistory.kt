package com.task.domain.model.task

import java.time.OffsetDateTime

/**
 * 任务历史记录
 * 用于记录任务的修改历史
 */
data class TaskHistory(
    /**
     * 记录ID
     */
    var id: Long? = null,
    
    /**
     * 任务ID
     */
    val taskId: Long,
    
    /**
     * 修改人ID
     */
    val userId: Long,
    
    /**
     * 操作类型
     */
    val operationType: OperationType,
    
    /**
     * 修改前的字段值（JSON格式）
     */
    val oldValue: String? = null,
    
    /**
     * 修改后的字段值（JSON格式）
     */
    val newValue: String? = null,
    
    /**
     * 修改的字段名
     */
    val fieldName: String,
    
    /**
     * 描述信息
     */
    val description: String,
    
    /**
     * 是否是主任务的修改
     */
    val isMainTask: Boolean,

    /**
     * 记录创建时间
     */
    var createdAt: OffsetDateTime? = OffsetDateTime.now(),

    /**
     * 记录最后更新时间
     */
    var updatedAt: OffsetDateTime? = null,

    /**
     * 乐观锁版本号，用于并发控制
     */
    var version: Int
)

/**
 * 操作类型枚举
 */
enum class OperationType {
    CREATE,      // 创建
    UPDATE,      // 更新
    DELETE,      // 删除
    ASSIGN,      // 分配
    STATUS_CHANGE, // 状态变更
    PRIORITY_CHANGE, // 优先级变更
    DESCRIPTION_CHANGE, // 描述变更
    TITLE_CHANGE, // 标题变更
    STARTTIME_CHANGE, // 开始时间变更
    DUEDATE_CHANGE  // 截止日期变更
}
