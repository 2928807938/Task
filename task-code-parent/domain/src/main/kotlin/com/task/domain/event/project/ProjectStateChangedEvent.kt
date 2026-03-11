package com.task.domain.event.project

import com.task.domain.event.core.DomainEvent
import java.time.OffsetDateTime

/**
 * 项目状态变更事件
 * 
 * 当项目状态发生变化时触发此事件
 */
data class ProjectStateChangedEvent(
    /**
     * 项目ID
     */
    val projectId: Long,

    /**
     * 旧状态ID
     */
    val oldStatusId: Long,

    /**
     * 新状态ID
     */
    val newStatusId: Long,

    /**
     * 操作者ID
     */
    val operatorId: Long,

    /**
     * 状态变更原因
     */
    val reason: String? = null,

    /**
     * 事件发生时间
     */
    val occurredAt: OffsetDateTime = OffsetDateTime.now()

) : DomainEvent() {
    /**
     * 聚合根ID，用于事件溯源
     */
    override val aggregateId: Any = projectId
    
    /**
     * 聚合根类型，用于事件分类
     */
    override val aggregateType: String = "project_status"
    
    /**
     * 获取事件数据，用于事件序列化
     * 
     * @return 事件数据
     */
    override fun getEventData(): Any {
        return mapOf(
            "projectId" to projectId,
            "oldStatusId" to oldStatusId,
            "newStatusId" to newStatusId,
            "operatorId" to operatorId,
            "reason" to reason,
            "timestamp" to timestamp
        )
    }
}
