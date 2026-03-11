package com.task.infrastructure.persistence.mapper

import com.task.infrastructure.persistence.record.UserProfileRecord
import org.springframework.data.repository.reactive.ReactiveCrudRepository
import org.springframework.stereotype.Repository

/**
 * 用户个人资料数据访问接口
 * 提供对用户个人资料表的响应式CRUD操作
 */
@Repository
interface UserProfileMapper : ReactiveCrudRepository<UserProfileRecord, Long> {
}
