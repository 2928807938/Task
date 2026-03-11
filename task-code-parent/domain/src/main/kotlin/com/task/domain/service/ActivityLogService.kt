package com.task.domain.service

import com.task.domain.model.activity.ActivityLog
import com.task.domain.model.activity.ActivityTypeEnum
import com.task.domain.model.common.ComparisonOperator
import com.task.domain.model.common.PageRequest
import com.task.domain.model.common.fieldOf
import com.task.domain.repository.ActivityLogRepository
import org.springframework.stereotype.Service
import reactor.core.publisher.Mono
import java.time.OffsetDateTime

/**
 * 活动日志领域服务
 * 处理活动日志相关的业务逻辑
 */
@Service
class ActivityLogService(
    private val activityLogRepository: ActivityLogRepository
) {

    /**
     * 统计指定时间范围内的活跃用户数量
     *
     * @param userIds 用户ID列表
     * @param startDate 开始日期
     * @param endDate 结束日期
     * @return 活跃用户数量
     */
    fun countActiveUsers(
        userIds: List<Long>,
        startDate: OffsetDateTime,
        endDate: OffsetDateTime
    ): Mono<Int> {
        if (userIds.isEmpty()) {
            return Mono.just(0)
        }

        // 使用activityLogRepository查询指定时间范围内有活动的用户数量
        return activityLogRepository.list {
            fieldOf(ActivityLog::actorId, ComparisonOperator.IN, userIds)
            fieldOf(ActivityLog::createdAt, ComparisonOperator.GREATER_OR_EQUAL, startDate)
            fieldOf(ActivityLog::createdAt, ComparisonOperator.LESS_OR_EQUAL, endDate)
        }
            .map { it.actorId }
            .distinct()
            .count()
            .map { it.toInt() }
    }

    /**
     * 获取指定时间范围内的活动日志
     *
     * @param actorIds 执行者ID列表
     * @param startDate 开始日期
     * @param endDate 结束日期
     * @return 活动日志列表
     */
    fun getActivitiesByActors(
        actorIds: List<Long>,
        startDate: OffsetDateTime,
        endDate: OffsetDateTime
    ): Mono<List<ActivityLog>> {
        if (actorIds.isEmpty()) {
            return Mono.just(emptyList())
        }

        // 使用activityLogRepository查询指定时间范围内的活动日志
        return activityLogRepository.list {
            fieldOf(ActivityLog::actorId, ComparisonOperator.IN, actorIds)
            fieldOf(ActivityLog::createdAt, ComparisonOperator.GREATER_OR_EQUAL, startDate)
            fieldOf(ActivityLog::createdAt, ComparisonOperator.LESS_OR_EQUAL, endDate)
        }
            .collectList()
    }

    /**
     * 获取指定类型的最近活动
     *
     * @param actorIds 执行者ID列表
     * @param activityTypes 活动类型列表
     * @param limit 记录数量限制
     * @return 活动日志列表
     */
    fun getRecentActivitiesByType(
        actorIds: List<Long>,
        activityTypes: List<ActivityTypeEnum>,
        limit: Int
    ): Mono<List<ActivityLog>> {
        if (actorIds.isEmpty() || activityTypes.isEmpty()) {
            return Mono.just(emptyList())
        }

        return activityLogRepository.page(PageRequest(1, limit)) {
            fieldOf(ActivityLog::actorId, ComparisonOperator.IN, actorIds)
            fieldOf(ActivityLog::activityType, ComparisonOperator.IN, activityTypes)
        }
            .map { pageResult -> pageResult.items }
    }
}