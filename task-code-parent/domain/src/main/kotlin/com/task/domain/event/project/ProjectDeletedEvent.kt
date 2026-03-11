package com.task.domain.event.project

import com.task.domain.event.core.DomainEvent
import java.time.OffsetDateTime

/**
 * 项目删除事件
 * 当项目被删除时发布
 */
class ProjectDeletedEvent(
    /**
     * 被删除的项目ID
     */
    val projectId: Long,

    /**
     * 项目名称
     */
    val projectName: String,

    /**
     * 执行删除操作的用户ID
     */
    val operatorId: Long,

    /**
     * 项目成员ID列表
     */
    val memberIds: List<Long>,

    /**
     * 删除时间
     */
    val deletedAt: OffsetDateTime = OffsetDateTime.now()
) : DomainEvent() {
    override val aggregateId: Any = projectId
    override val aggregateType: String = "Project"

    override fun getEventData(): Any = mapOf(
        "projectId" to projectId,
        "projectName" to projectName,
        "operatorId" to operatorId,
        "memberIds" to memberIds,
        "deletedAt" to deletedAt
    )

    override fun toString(): String {
        return "ProjectDeletedEvent(projectId=$projectId, projectName='$projectName', " +
                "operatorId=$operatorId, memberCount=${memberIds.size}, deletedAt=$deletedAt)"
    }
}