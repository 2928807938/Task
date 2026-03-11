package com.task.infrastructure.persistence.mapper

import com.task.infrastructure.persistence.record.UserRecord
import org.springframework.data.repository.reactive.ReactiveCrudRepository
import org.springframework.stereotype.Repository

/**
 * 用户数据访问接口
 * 提供对用户表的响应式CRUD操作
 */
@Repository
interface UserMapper : ReactiveCrudRepository<UserRecord, Long>
