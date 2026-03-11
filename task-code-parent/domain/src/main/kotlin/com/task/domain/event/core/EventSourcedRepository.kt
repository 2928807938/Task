package com.task.domain.event.core

import reactor.core.publisher.Mono

/**
 * 事件溯源仓库接口
 * 定义事件溯源模式下的仓库操作
 * 
 * @param T 聚合根类型
 * @param ID 聚合根ID类型
 */
interface EventSourcedRepository<T, ID : Any> {
    /**
     * 保存聚合根及其未提交事件
     * 
     * @param aggregate 要保存的聚合根
     * @return 保存后的聚合根
     */
    fun save(aggregate: T): Mono<T>
    
    /**
     * 根据ID加载聚合根
     * 
     * @param id 聚合根ID
     * @return 重建后的聚合根
     */
    fun findById(id: ID): Mono<T>
}
