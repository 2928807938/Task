package com.task.infrastructure.persistence.mapper

import com.task.infrastructure.persistence.record.UserOauthRecord
import org.springframework.data.repository.reactive.ReactiveCrudRepository
import org.springframework.stereotype.Repository

/**
 * 用户第三方登录数据访问接口
 * 提供对用户第三方登录表的响应式CRUD操作
 */
@Repository
interface UserOauthMapper : ReactiveCrudRepository<UserOauthRecord, Long> {
}
