package com.task.domain.event.core

import com.task.shared.context.RequestContextHolder
import java.time.OffsetDateTime

/**
 * 领域事件基类
 * 所有领域事件都应继承此类
 */
abstract class DomainEvent {

    /**
     * 用户唯一标识
     */
    var id: Long? = null
    
    /**
     * 事件发生时间
     */
    val timestamp: OffsetDateTime = OffsetDateTime.now()
    
    /**
     * 事件类型，默认为类的简单名称
     */
    open val eventType: String = this.javaClass.simpleName
    
    /**
     * 事件版本，用于事件架构演进
     */
    open val version: String = "1.0"
    
    /**
     * 聚合根ID，表示事件关联的领域对象ID
     */
    abstract val aggregateId: Any
    
    /**
     * 聚合根类型，表示事件关联的领域对象类型
     */
    abstract val aggregateType: String
    
    /**
     * 请求上下文信息，用于跟踪和审计
     */
    open val traceId: String? = RequestContextHolder.getTraceId()
    open val tenantId: String? = RequestContextHolder.getTenantId()
    
    /**
     * 获取事件数据，子类需要实现此方法提供具体事件数据
     * 此方法用于序列化事件时获取事件数据
     */
    abstract fun getEventData(): Any
    
    override fun toString(): String {
        return "DomainEvent(id='$id', eventType='$eventType', " +
                "aggregateId=$aggregateId, aggregateType='$aggregateType', " +
                "timestamp=$timestamp, version='$version', " +
                "traceId=$traceId, tenantId=$tenantId)"
    }
}
