package com.task.domain.event.core

/**
 * 事件溯源聚合根接口
 * 用于支持事件溯源模式的聚合根实现
 * 
 * 事件溯源模式中，聚合根的状态由事件历史重建，而不是直接持久化
 */
interface EventSourcedAggregate<ID> {
    /**
     * 获取聚合根ID
     */
    fun getAggregateId(): ID
    
    /**
     * 获取聚合根类型
     */
    fun getAggregateType(): String
    
    /**
     * 获取当前版本号
     */
    fun getVersion(): Long
    
    /**
     * 获取未提交的事件列表
     */
    fun getUncommittedEvents(): List<DomainEvent>
    
    /**
     * 清除未提交的事件列表
     */
    fun clearUncommittedEvents()
    
    /**
     * 应用事件到聚合根，更新状态
     * @param event 要应用的事件
     */
    fun applyEvent(event: DomainEvent)
    
    /**
     * 从事件历史重建聚合根状态
     * @param events 事件历史
     */
    fun loadFromHistory(events: List<DomainEvent>)
}
