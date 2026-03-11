package com.task.infrastructure.persistence.base

import com.task.domain.model.common.*
import com.task.infrastructure.id.IdGeneratorService
import org.slf4j.LoggerFactory
import org.springframework.dao.DuplicateKeyException
import org.springframework.data.domain.Sort
import org.springframework.data.r2dbc.core.R2dbcEntityTemplate
import org.springframework.data.relational.core.query.Criteria
import org.springframework.data.relational.core.query.Query
import org.springframework.data.repository.reactive.ReactiveCrudRepository
import reactor.core.publisher.Flux
import reactor.core.publisher.Mono
import java.time.OffsetDateTime
import kotlin.reflect.KClass

/**
 * 基础Repository抽象类
 * @param T 领域模型类型
 * @param R 数据库记录类型
 * @param M Spring Data R2DBC的Mapper接口类型
 */
abstract class BaseRepository<T : Any, R : BaseRecord, M : ReactiveCrudRepository<R, Long>> {

    private val logger = LoggerFactory.getLogger(this.javaClass)
    
    protected abstract val mapper: M
    protected abstract val template: R2dbcEntityTemplate
    protected abstract val entityClass: KClass<R>
    protected abstract val idGenerator: IdGeneratorService

    /**
     * 根据ID查询
     */
    open fun findById(id: Long): Mono<T> {
        return mapper.findById(id)
            .map { record -> toEntity(record) }
    }

    /**
     * 通过ID列表查询
     */
    open fun findByIds(ids: Collection<Long>): Flux<T> {
        if (ids.isEmpty()) {
            return Flux.empty()
        }

        return mapper.findAllById(ids)
            .map { record -> toEntity(record) }
    }

    /**
     * 使用条件构建器查询单个记录
     */
    open fun <E> findOne(init: QueryConditionBuilder<E>.() -> Unit): Mono<T> {
        val builder = QueryConditionBuilder<E>()
        builder.init()
        val criteria = convertToCriteria(builder)
        
        val query = if (criteria != null) Query.query(criteria) else Query.empty()
        
        return template.select(entityClass.java)
            .matching(query)
            .one()
            .map { record -> toEntity(record as R) }
    }

    /**
     * 使用条件构建器查询记录
     */
    open fun <E> list(init: QueryConditionBuilder<E>.() -> Unit): Flux<T> {
        val builder = QueryConditionBuilder<E>()
        builder.init()
        val criteria = convertToCriteria(builder)
        
        var query = if (criteria != null) Query.query(criteria) else Query.empty()
        
        // 添加排序
        val sortFields = builder.getSortFields()
        if (sortFields.isNotEmpty()) {
            val orders = sortFields.map { 
                if (it.direction == SortDirection.ASC) 
                    Sort.Order.asc(it.name)
                else 
                    Sort.Order.desc(it.name)
            }
            query = query.sort(Sort.by(orders))
        }
        
        return template.select(entityClass.java)
            .matching(query)
            .all()
            .map { record -> toEntity(record as R) }
    }

    /**
     * 检查是否存在满足条件的记录
     */
    open fun <E> exists(init: QueryConditionBuilder<E>.() -> Unit): Mono<Boolean> {
        val builder = QueryConditionBuilder<E>()
        builder.init()
        val criteria = convertToCriteria(builder)

        val query = if (criteria != null) Query.query(criteria) else Query.empty()

        return template.exists(query, entityClass.java)
    }

    /**
     * 计算满足条件的记录数量
     */
    open fun <E> count(init: QueryConditionBuilder<E>.() -> Unit): Mono<Long> {
        val builder = QueryConditionBuilder<E>()
        builder.init()
        val criteria = convertToCriteria(builder)
        
        val query = if (criteria != null) Query.query(criteria) else Query.empty()
        
        return template.count(query, entityClass.java)
    }

    /**
     * 使用条件构建器分页查询
     */
    open fun <E> page(pageRequest: PageRequest, init: QueryConditionBuilder<E>.() -> Unit): Mono<PageResult<T>> {
        val builder = QueryConditionBuilder<E>()
        builder.init()
        val criteria = convertToCriteria(builder)
        
        var query = if (criteria != null) Query.query(criteria) else Query.empty()
        
        // 添加排序
        val sortFields = builder.getSortFields()
        if (sortFields.isNotEmpty()) {
            val orders = sortFields.map { 
                if (it.direction == SortDirection.ASC) 
                    Sort.Order.asc(it.name) 
                else 
                    Sort.Order.desc(it.name)
            }
            query = query.sort(Sort.by(orders))
        }
        
        val total = template.select(entityClass.java)
            .matching(query)
            .count()
            
        val items = template.select(entityClass.java)
            .matching(query.limit(pageRequest.pageSize).offset(pageRequest.pageNumber.toLong() * pageRequest.pageSize))
            .all()
            .map { record -> toEntity(record as R) }
            .collectList()
            
        return items.zipWith(total)
            .map { tuple ->
                PageResult(
                    items = tuple.t1,
                    total = tuple.t2.toInt(),
                    page = pageRequest.pageNumber,
                    size = pageRequest.pageSize
                )
            }
    }

    /**
     * 创建或更新记录
     * 当实体ID为null时使用IdGeneratorService生成新ID，当ID不为null时执行更新操作
     * 增强了ID检查和主键冲突处理：发生冲突时自动重新生成ID并重试
     */
    open fun save(entity: T): Mono<T> {
        // 获取原始实体ID，以防止它在转换过程中丢失
        val entityId = getId(entity)
        
        // 转换为记录
        val record = toRecord(entity)
        
        // 如果实体有ID但记录ID为空，这是异常情况，可能在toRecord转换中ID丢失
        if (entityId != null && entityId > 0L && (record.id == null || record.id == 0L)) {
            logger.warn("检测到ID不一致：实体ID={}, 记录ID={}，强制使用实体ID", entityId, record.id)
            record.id = entityId  // 使用原始实体的ID
        }
        
        return if (record.id == null || record.id == 0L) {
            // ID为null，表示未持久化状态，使用IdGeneratorService生成ID并保存
            generateIdAndSave(record)
                .map { savedRecord -> toEntity(savedRecord) }
        } else {
            // ID不为null，表示已持久化状态，执行更新操作
            update(entity)
        }
    }
    
    /**
     * 生成ID并保存记录，如果发生主键冲突则自动重试
     * 最多重试3次，避免无限循环
     */
    private fun generateIdAndSave(record: R, retryCount: Int = 0): Mono<R> {
        // 最大重试次数
        val maxRetries = 3

        // 设置记录基本信息
        val now = OffsetDateTime.now()
        record.id = idGenerator.generateId()
        record.createdAt = now
        record.updatedAt = now
        record.version = 0
        record.deleted = 0

        return mapper.save(record)
            .onErrorResume { error ->
                // 判断是否是主键冲突错误
                if (error is DuplicateKeyException && 
                    error.message?.contains("_pkey") == true &&
                    retryCount < maxRetries) {
                    
                    // 记录警告日志
                    logger.warn("主键冲突，ID={}，正在重试，当前重试次数：{}", record.id, retryCount + 1)
                    
                    // 重新生成ID并重试
                    return@onErrorResume generateIdAndSave(record, retryCount + 1)
                }
                // 其他错误或超过最大重试次数，向上抛出
                Mono.error(error)
            }
    }

    /**
     * 更新记录前的钩子方法，子类可以重写此方法以添加特定的业务逻辑
     */
    protected open fun beforeUpdate(entity: T, existingRecord: R): Mono<T> {
        return Mono.just(entity)
    }

    /**
     * 更新记录后的钩子方法，子类可以重写此方法以添加特定的业务逻辑
     */
    protected open fun afterUpdate(entity: T, savedRecord: R): Mono<T> {
        return Mono.just(toEntity(savedRecord))
    }

    /**
     * 更新记录
     * 与保存不同，更新必须确保实体ID存在
     */
    open fun update(entity: T): Mono<T> {
        val id = getId(entity)
        
        // 确保ID存在
        if (id == null || id == 0L) {
            return Mono.error(IllegalArgumentException("更新操作失败：ID不能为空"))
        }
        
        return Mono.just(entity)
            .flatMap { e -> beforeUpdate(e, toRecord(e)) }
            .map { e -> toRecord(e) }
            .flatMap { record -> 
                // 确保ID存在
                if (record.id == null || record.id == 0L) {
                    logger.error("更新记录时ID为空，无法执行更新操作")
                    return@flatMap Mono.error<R>(IllegalArgumentException("更新记录时ID不能为空"))
                }
                
                // 设置更新时间
                if (record is BaseRecord) {
                    record.updatedAt = OffsetDateTime.now()
                    // 关键修改：标记为非新实体，确保执行UPDATE操作
                    record.markAsNotNew()
                }
                
                mapper.save(record)
            }
            .flatMap { savedRecord -> afterUpdate(entity, savedRecord) }
    }

    /**
     * 删除记录
     * 实际上是将记录标记为已删除（逻辑删除），将deleted字段设置为当前时间的秒级时间戳
     */
    open fun delete(id: Long): Mono<Void> {
        return mapper.findById(id)
            .switchIfEmpty(Mono.error(IllegalArgumentException("Entity not found with id: $id")))
            .flatMap { record ->
                record.deleted = (System.currentTimeMillis() / 1000).toInt()
                record.updatedAt = OffsetDateTime.now()
                // 标记为非新实体，确保执行UPDATE操作而不是INSERT操作
                if (record is BaseRecord) {
                    record.markAsNotNew()
                }
                mapper.save(record)
            }
            .then()
    }

    /**
     * 批量删除记录
     * 实际上是将记录标记为已删除（逻辑删除），将deleted字段设置为当前时间的秒级时间戳
     */
    open fun deleteBatch(ids: Collection<Long>): Mono<Void> {
        if (ids.isEmpty()) {
            return Mono.empty()
        }
        
        val timestamp = (System.currentTimeMillis() / 1000).toInt()
        val now = OffsetDateTime.now()
        
        return Flux.fromIterable(ids)
            .flatMap { id -> 
                mapper.findById(id)
                    .filter { record -> record.deleted == 0 } // 只更新未删除的记录
                    .flatMap { record ->
                        // 确保记录被标记为非新实体（这样save会执行UPDATE而不是INSERT）
                        record.markAsNotNew()
                        // 更新记录的删除标志
                        record.deleted = timestamp
                        record.updatedAt = now
                        // 使用save方法，现在它会正确执行UPDATE
                        mapper.save(record)
                    }
            }
            .then()
    }

    /**
     * 批量保存记录
     */
    open fun saveBatch(entities: Collection<T>): Flux<T> {
        return Flux.fromIterable(entities)
            .flatMap { entity -> save(entity) }
    }

    /**
     * 批量更新记录
     */
    open fun updateBatch(entities: Collection<T>): Flux<T> {
        return Flux.fromIterable(entities)
            .flatMap { entity -> update(entity) }
    }

    /**
     * 获取实体ID
     */
    protected abstract fun getId(entity: T): Long?

    /**
     * 将数据库记录转换为领域模型
     */
    protected abstract fun toEntity(record: R): T

    /**
     * 将领域模型转换为数据库记录
     */
    protected abstract fun toRecord(entity: T): R
    
    /**
     * 将 QueryConditionBuilder 转换为 Criteria
     */
    private fun <E> convertToCriteria(builder: QueryConditionBuilder<E>): Criteria? {
        // 处理字段条件
        val fieldCriteria = convertFieldsToCriteria(builder.getFields())
        
        // 处理条件组
        val groupCriteria = convertGroupsToCriteria(builder.getGroups())
        
        // 添加逻辑删除条件
        val deletedCriteria = Criteria.where("deleted").`is`(0)
        
        // 合并条件
        return when {
            fieldCriteria != null && groupCriteria != null -> deletedCriteria.and(fieldCriteria).and(groupCriteria)
            fieldCriteria != null -> deletedCriteria.and(fieldCriteria)
            groupCriteria != null -> deletedCriteria.and(groupCriteria)
            else -> deletedCriteria
        }
    }

    /**
     * 将字段条件列表转换为 Criteria
     */
    private fun convertFieldsToCriteria(fields: List<QueryField<*>>): Criteria? {
        if (fields.isEmpty()) {
            return null
        }
        
        var criteria: Criteria? = null
        
        for (field in fields) {
            val fieldCriteria = convertFieldToCriteria(field)
            
            criteria = when {
                criteria == null -> fieldCriteria
                field.logicOperator == LogicOperator.AND -> criteria.and(fieldCriteria)
                else -> criteria.or(fieldCriteria)
            }
        }
        
        return criteria
    }

    /**
     * 将单个字段条件转换为 Criteria
     */
    private fun convertFieldToCriteria(field: QueryField<*>): Criteria {
        return when (field.operator) {
            ComparisonOperator.EQUALS -> Criteria.where(field.name).`is`(field.value!!)
            ComparisonOperator.NOT_EQUALS -> Criteria.where(field.name).not(field.value!!)
            ComparisonOperator.GREATER_THAN -> Criteria.where(field.name).greaterThan(field.value!!)
            ComparisonOperator.LESS_THAN -> Criteria.where(field.name).lessThan(field.value!!)
            ComparisonOperator.GREATER_OR_EQUAL -> Criteria.where(field.name).greaterThanOrEquals(field.value!!)
            ComparisonOperator.LESS_OR_EQUAL -> Criteria.where(field.name).lessThanOrEquals(field.value!!)
            ComparisonOperator.LIKE -> Criteria.where(field.name).like(field.value.toString())
            ComparisonOperator.NOT_LIKE -> Criteria.where(field.name).notLike(field.value.toString())
            ComparisonOperator.IN -> Criteria.where(field.name).`in`(field.value as Collection<*>)
            ComparisonOperator.NOT_IN -> Criteria.where(field.name).notIn(field.value as Collection<*>)
            ComparisonOperator.IS_NULL -> Criteria.where(field.name).isNull()
            ComparisonOperator.IS_NOT_NULL -> Criteria.where(field.name).isNotNull()
            ComparisonOperator.STARTS_WITH -> Criteria.where(field.name).like("${field.value}%")
            ComparisonOperator.ENDS_WITH -> Criteria.where(field.name).like("%${field.value}")
            ComparisonOperator.CONTAINS -> Criteria.where(field.name).like("%${field.value}%")
            ComparisonOperator.NOT_CONTAINS -> Criteria.where(field.name).notLike("%${field.value}%")
            // 对于复杂操作符，可能需要自定义SQL或使用数据库特定功能
            else -> Criteria.where(field.name).`is`(field.value!!) // 默认使用等于操作符
        }
    }

    /**
     * 将条件组列表转换为 Criteria
     */
    private fun <E> convertGroupsToCriteria(groups: List<QueryConditionGroup<E>>): Criteria? {
        if (groups.isEmpty()) {
            return null
        }
        
        var criteria: Criteria? = null
        
        for (group in groups) {
            // 构建组内字段条件
            val fieldCriteria = convertFieldsToCriteria(group.fields)
            
            // 构建组内子组条件
            val subGroupCriteria = convertGroupsToCriteria(group.groups)
            
            // 合并组内条件
            val groupCriteria = when {
                fieldCriteria != null && subGroupCriteria != null -> fieldCriteria.and(subGroupCriteria)
                fieldCriteria != null -> fieldCriteria
                subGroupCriteria != null -> subGroupCriteria
                else -> null
            }
            
            if (groupCriteria != null) {
                criteria = when {
                    criteria == null -> groupCriteria
                    group.logicOperator == LogicOperator.AND -> criteria.and(groupCriteria)
                    else -> criteria.or(groupCriteria)
                }
            }
        }
        
        return criteria
    }
}