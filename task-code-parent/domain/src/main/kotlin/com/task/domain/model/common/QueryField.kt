package com.task.domain.model.common

import kotlin.reflect.KProperty
import kotlin.reflect.KProperty1

/**
 * 逻辑操作符
 */
enum class LogicOperator {
    AND, OR
}

/**
 * 通用属性引用扩展函数
 * 为QueryConditionBuilder添加使用属性引用的扩展方法
 */
fun <E, R> QueryConditionBuilder<E>.fieldOf(
    property: KProperty1<E, R>,
    operator: ComparisonOperator,
    value: R? = null
) {
    // 获取属性名
    val fieldName = property.name
    
    when (operator) {
        ComparisonOperator.IS_NULL -> {
            // 对IS_NULL操作符进行特殊处理
            // 将驼峰命名法转换为下划线格式
            val dbFieldName = fieldName.replace(Regex("([a-z0-9])([A-Z])"), "$1_$2").lowercase()
            field(dbFieldName, ComparisonOperator.IS_NULL, null)
        }
        ComparisonOperator.IS_NOT_NULL -> {
            // 对IS_NOT_NULL操作符进行特殊处理
            // 将驼峰命名法转换为下划线格式
            val dbFieldName = fieldName.replace(Regex("([a-z0-9])([A-Z])"), "$1_$2").lowercase()
            field(dbFieldName, ComparisonOperator.IS_NOT_NULL, null)
        }
        else -> {
            // 其他操作符保持原样
            field(fieldName, operator, value)
        }
    }
}

/**
 * 使用属性引用添加IS_NULL条件
 * @param property 属性引用
 * @return 当前构建器
 */
fun <E, R> QueryConditionBuilder<E>.isNullOf(property: KProperty1<E, R>) {
    isNull(property.name)
}

/**
 * 使用属性引用添加IS_NOT_NULL条件
 * @param property 属性引用
 * @return 当前构建器
 */
fun <E, R> QueryConditionBuilder<E>.isNotNullOf(property: KProperty1<E, R>) {
    isNotNull(property.name)
}

/**
 * 创建升序排序字段
 */
fun <E, R> asc(property: KProperty1<E, R>): SortField {
    return SortField(property.name, SortDirection.ASC)
}

/**
 * 创建降序排序字段
 */
fun <E, R> desc(property: KProperty1<E, R>): SortField {
    return SortField(property.name, SortDirection.DESC)
}

/**
 * 创建升序排序字段（字符串版本）
 */
fun asc(fieldName: String): SortField {
    return SortField(fieldName, SortDirection.ASC)
}

/**
 * 创建降序排序字段（字符串版本）
 */
fun desc(fieldName: String): SortField {
    return SortField(fieldName, SortDirection.DESC)
}


/**
 * 查询条件构建器
 * @param E 实体类型
 */
class QueryConditionBuilder<E> {
    private val fields = mutableListOf<QueryField<*>>()
    private val groups = mutableListOf<QueryConditionGroup<E>>()
    private val sortFields = mutableListOf<SortField>()
    private var currentLogicOperator = LogicOperator.AND

    /**
     * 添加字段条件
     * @param name 字段名
     * @param operator 比较操作符
     * @param value 字段值
     * @return 当前构建器
     */
    fun <T> field(name: String, operator: ComparisonOperator, value: T?): QueryConditionBuilder<E> {
        if (value != null || operator == ComparisonOperator.IS_NULL || operator == ComparisonOperator.IS_NOT_NULL) {
            fields.add(QueryField(name, operator, value, currentLogicOperator))
        }
        return this
    }
    
    /**
     * 添加IS_NULL字段条件
     * @param name 字段名
     * @return 当前构建器
     */
    fun isNull(name: String): QueryConditionBuilder<E> {
        fields.add(QueryField<Any?>(name, ComparisonOperator.IS_NULL, null, currentLogicOperator))
        return this
    }
    
    /**
     * 添加IS_NOT_NULL字段条件
     * @param name 字段名
     * @return 当前构建器
     */
    fun isNotNull(name: String): QueryConditionBuilder<E> {
        fields.add(QueryField<Any?>(name, ComparisonOperator.IS_NOT_NULL, null, currentLogicOperator))
        return this
    }

    /**
     * 使用属性引用添加字段条件
     * @param property 属性引用
     * @param operator 比较操作符
     * @param value 字段值
     * @return 当前构建器
     */
    inline fun <reified T, R> field(property: KProperty<R>, operator: ComparisonOperator, value: R?): QueryConditionBuilder<E> {
        return field(property.name, operator, value)
    }

    /**
     * 添加AND条件组
     * @param init 条件组初始化函数
     * @return 当前构建器
     */
    fun and(init: QueryConditionBuilder<E>.() -> Unit): QueryConditionBuilder<E> {
        val builder = QueryConditionBuilder<E>()
        builder.init()
        groups.add(QueryConditionGroup(builder.fields, builder.groups, LogicOperator.AND))
        return this
    }

    /**
     * 添加OR条件组
     * @param init 条件组初始化函数
     * @return 当前构建器
     */
    fun or(init: QueryConditionBuilder<E>.() -> Unit): QueryConditionBuilder<E> {
        val builder = QueryConditionBuilder<E>()
        builder.init()
        groups.add(QueryConditionGroup(builder.fields, builder.groups, LogicOperator.OR))
        return this
    }

    /**
     * 设置后续条件使用AND连接
     * @return 当前构建器
     */
    fun and(): QueryConditionBuilder<E> {
        currentLogicOperator = LogicOperator.AND
        return this
    }

    /**
     * 设置后续条件使用OR连接
     * @return 当前构建器
     */
    fun or(): QueryConditionBuilder<E> {
        currentLogicOperator = LogicOperator.OR
        return this
    }

    /**
     * 获取所有字段条件
     * @return 字段条件列表
     */
    fun getFields(): List<QueryField<*>> = fields

    /**
     * 获取所有条件组
     * @return 条件组列表
     */
    fun getGroups(): List<QueryConditionGroup<E>> = groups

    /**
     * 添加排序条件
     * @param sortFields 排序字段列表
     * @return 当前构建器
     */
    fun orderBy(vararg sortFields: SortField): QueryConditionBuilder<E> {
        this.sortFields.addAll(sortFields)
        return this
    }

    /**
     * 获取排序字段列表
     * @return 排序字段列表
     */
    fun getSortFields(): List<SortField> = sortFields
}

/**
 * 查询条件字段
 * @param T 字段类型
 * @param name 字段名
 * @param operator 比较操作符
 * @param value 字段值，对于IS_NULL和IS_NOT_NULL操作符可以为null
 * @param logicOperator 逻辑操作符
 */
data class QueryField<T>(
    val name: String,
    val operator: ComparisonOperator,
    val value: T?,
    val logicOperator: LogicOperator = LogicOperator.AND
)

/**
 * 查询条件组
 * @param fields 字段条件列表
 * @param groups 子条件组列表
 * @param logicOperator 逻辑操作符
 */
data class QueryConditionGroup<E>(
    val fields: List<QueryField<*>>,
    val groups: List<QueryConditionGroup<E>>,
    val logicOperator: LogicOperator
)

/**
 * 排序方向枚举
 */
enum class SortDirection {
    ASC,  // 升序
    DESC  // 降序
}

/**
 * 排序字段
 * @param name 字段名
 * @param direction 排序方向
 */
data class SortField(
    val name: String,
    val direction: SortDirection
)