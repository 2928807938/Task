package com.task.domain.repository

import com.task.domain.event.core.DomainEvent

/**
 * 领域事件仓储接口
 * 定义领域事件持久化和查询的业务操作
 */
interface DomainEventRepository  : Repository<DomainEvent>{
}