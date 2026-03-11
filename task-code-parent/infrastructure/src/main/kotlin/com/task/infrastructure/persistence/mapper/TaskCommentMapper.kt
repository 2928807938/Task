package com.task.infrastructure.persistence.mapper

import com.task.infrastructure.persistence.record.TaskCommentRecord
import org.springframework.data.repository.reactive.ReactiveCrudRepository
import org.springframework.stereotype.Repository

/**
 * 任务评论数据访问接口
 * 提供对任务评论表的响应式CRUD操作
 */
@Repository
interface TaskCommentMapper : ReactiveCrudRepository<TaskCommentRecord, Long> {
}
