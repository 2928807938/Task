package com.task.domain.repository

import com.task.domain.model.common.PageRequest
import com.task.domain.model.common.PageResult
import com.task.domain.model.common.QueryConditionBuilder
import reactor.core.publisher.Flux
import reactor.core.publisher.Mono

/**
 * 通用Repository接口
 * 定义所有Repository共有的数据访问操作
 * @param T 领域模型类型
 */
interface Repository<T : Any> {
    /**
     * 根据ID查询
     */
    fun findById(id: Long): Mono<T>

    /**
     * 通过ID列表查询
     */
    fun findByIds(ids: Collection<Long>): Flux<T>
    
    /**
     * 使用条件构建器查询单个记录
     */
    fun <E> findOne(init: QueryConditionBuilder<E>.() -> Unit): Mono<T>

    /**
     * 使用条件构建器查询记录（不分页）
     */
    fun <E> list(init: QueryConditionBuilder<E>.() -> Unit): Flux<T>
    
    /**
     * 检查是否存在满足条件的记录
     */
    fun <E> exists(init: QueryConditionBuilder<E>.() -> Unit): Mono<Boolean>

    /**
     * 计算满足条件的记录数量
     */
    fun <E> count(init: QueryConditionBuilder<E>.() -> Unit): Mono<Long>

    /**
     * 使用条件构建器分页查询
     */
    fun <E> page(pageRequest: PageRequest, init: QueryConditionBuilder<E>.() -> Unit): Mono<PageResult<T>>

    /**
     * 创建记录
     */
    fun save(entity: T): Mono<T>

    /**
     * 更新记录
     */
    fun update(entity: T): Mono<T>

    /**
     * 删除记录
     */
    fun delete(id: Long): Mono<Void>

    /**
     * 批量删除记录
     */
    fun deleteBatch(ids: Collection<Long>): Mono<Void>

    /**
     * 批量保存记录
     */
    fun saveBatch(entities: Collection<T>): Flux<T>

    /**
     * 批量更新记录
     */
    fun updateBatch(entities: Collection<T>): Flux<T>
}