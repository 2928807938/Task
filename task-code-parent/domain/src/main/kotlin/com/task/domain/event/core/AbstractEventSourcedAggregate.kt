package com.task.domain.event.core

/**
 * 事件溯源聚合根抽象基类
 * 提供事件溯源聚合根的基本实现
 * 
 * @param ID 聚合根ID类型
 */
abstract class AbstractEventSourcedAggregate<ID> : EventSourcedAggregate<ID> {
    
    private var version: Long = 0
    private val uncommittedEvents = mutableListOf<DomainEvent>()
    
    /**
     * 获取当前版本号
     */
    override fun getVersion(): Long = version
    
    /**
     * 获取未提交的事件列表
     */
    override fun getUncommittedEvents(): List<DomainEvent> = uncommittedEvents.toList()
    
    /**
     * 清除未提交的事件列表
     */
    override fun clearUncommittedEvents() {
        uncommittedEvents.clear()
    }
    
    /**
     * 从事件历史重建聚合根状态
     * @param events 事件历史
     */
    override fun loadFromHistory(events: List<DomainEvent>) {
        events.forEach { 
            applyEvent(it, false)
            version++
        }
    }
    
    /**
     * 应用事件并选择是否添加到未提交事件列表
     * @param event 要应用的事件
     * @param isNew 是否为新事件，如果是则添加到未提交事件列表
     */
    protected fun applyEvent(event: DomainEvent, isNew: Boolean) {
        // 应用事件更新状态
        applyEvent(event)
        
        // 如果是新事件，添加到未提交事件列表
        if (isNew) {
            uncommittedEvents.add(event)
            version++
        }
    }
    
    /**
     * 应用事件到聚合根，更新状态
     * 子类需要实现此方法，根据事件类型更新聚合根状态
     * 
     * @param event 要应用的事件
     */
    override abstract fun applyEvent(event: DomainEvent)
}
