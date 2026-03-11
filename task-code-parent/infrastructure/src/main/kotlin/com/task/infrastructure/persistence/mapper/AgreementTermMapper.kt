package com.task.infrastructure.persistence.mapper

import com.task.infrastructure.persistence.record.AgreementTermRecord
import org.springframework.data.repository.reactive.ReactiveCrudRepository

/**
 * 协议条款Mapper接口
 * 提供R2DBC操作方法
 */
interface AgreementTermMapper : ReactiveCrudRepository<AgreementTermRecord, Long> {
} 