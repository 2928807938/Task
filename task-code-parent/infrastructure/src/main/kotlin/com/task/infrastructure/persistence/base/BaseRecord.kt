package com.task.infrastructure.persistence.base

import org.springframework.data.annotation.Id
import org.springframework.data.annotation.Transient
import org.springframework.data.annotation.Version
import org.springframework.data.domain.Persistable
import java.time.OffsetDateTime

/**
 * 基础记录类
 * 包含所有数据库记录类共有的字段
 * 作为所有记录类的父类，提供通用字段的默认实现
 */
abstract class BaseRecord(
    /**
     * 用户唯一标识，TSID格式（有序的分布式ID）
     */
    @Id
    @get:JvmName("_getId")
    open var id: Long? = null,

    /**
     * 逻辑删除标志，0表示未删除，1表示已删除
     */
    open var deleted: Int = 0,
    
    /**
     * 记录创建时间
     */
    open var createdAt: OffsetDateTime? = OffsetDateTime.now(),
    
    /**
     * 记录最后更新时间
     */
    open var updatedAt: OffsetDateTime? = null,
    
    /**
     * 乐观锁版本号，用于并发控制
     */
    @Version
    open var version: Int = 0
) : Persistable<Long> {
    
    /**
     * 标记实体是否为新实体
     * 用于控制Spring Data R2DBC的INSERT/UPDATE行为
     */
    @Transient
    private var isNewEntity: Boolean = true
    
    override fun getId(): Long? = id
    
    /**
     * 判断实体是否为新实体
     * 返回true时执行INSERT，返回false时执行UPDATE
     */
    override fun isNew(): Boolean {
        return isNewEntity
    }
    
    /**
     * 标记实体为已存在（用于更新操作）
     */
    fun markAsNotNew() {
        isNewEntity = false
    }
    
    /**
     * 标记实体为新实体（用于插入操作）
     */
    fun markAsNew() {
        isNewEntity = true
    }
}
