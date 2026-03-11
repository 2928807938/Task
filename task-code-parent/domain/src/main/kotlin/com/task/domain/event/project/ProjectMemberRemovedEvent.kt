package com.task.domain.event.project

import com.task.domain.event.core.DomainEvent
import java.time.OffsetDateTime

/**
 * 项目成员移除事件
 * 当成员从项目中被移除时发布
 */
class ProjectMemberRemovedEvent(
    /**
     * 项目ID
     */
    val projectId: Long,

    /**
     * 被移除的用户ID
     */
    val userId: Long,

    /**
     * 执行移除操作的用户ID
     */
    val operatorId: Long,

    /**
     * 移除时间
     */
    val removedAt: OffsetDateTime = OffsetDateTime.now()
) : DomainEvent() {
    override val aggregateId: Any = projectId
    override val aggregateType: String = "Project"

    override fun getEventData(): Any = mapOf(
        "projectId" to projectId,
        "userId" to userId,
        "operatorId" to operatorId,
        "removedAt" to removedAt
    )

    override fun toString(): String {
        return "ProjectMemberRemovedEvent(projectId=$projectId, userId=$userId, " +
                "operatorId=$operatorId, removedAt=$removedAt)"
    }
}