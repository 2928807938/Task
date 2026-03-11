package com.task.domain.event.project

import com.task.domain.event.core.DomainEvent
import java.time.OffsetDateTime

/**
 * 项目成员添加事件
 * 当新成员被添加到项目时发布
 */
class ProjectMemberAddedEvent(
    /**
     * 项目ID
     */
    val projectId: Long,

    /**
     * 被添加的用户ID
     */
    val userId: Long,

    /**
     * 执行添加操作的用户ID
     */
    val operatorId: Long,

    /**
     * 添加时间
     */
    val addedAt: OffsetDateTime = OffsetDateTime.now()
) : DomainEvent() {
    override val aggregateId: Any = projectId
    override val aggregateType: String = "Project"

    override fun getEventData(): Any = mapOf(
        "projectId" to projectId,
        "userId" to userId,
        "operatorId" to operatorId,
        "addedAt" to addedAt
    )

    override fun toString(): String {
        return "ProjectMemberAddedEvent(projectId=$projectId, userId=$userId, " +
                "operatorId=$operatorId, addedAt=$addedAt)"
    }
}