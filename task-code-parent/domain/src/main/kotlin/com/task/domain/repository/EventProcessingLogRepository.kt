package com.task.domain.repository

import com.task.domain.event.core.EventProcessingLog

/**
 * 事件处理日志仓库接口
 * 定义活动日志相关的数据访问操作
 */
interface EventProcessingLogRepository : Repository<EventProcessingLog>{
}
