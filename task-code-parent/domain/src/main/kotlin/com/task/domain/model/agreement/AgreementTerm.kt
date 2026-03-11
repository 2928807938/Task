package com.task.domain.model.agreement

import java.time.OffsetDateTime

/**
 * 协议条款领域模型
 * 表示系统中的协议、条款等法律文本
 */
data class AgreementTerm(
    /**
     * 唯一标识
     */
    val id: Long?,
    
    /**
     * 条款唯一标识键，用于快速查询
     */
    val key: String,
    
    /**
     * 条款标题
     */
    val title: String,
    
    /**
     * 条款内容（Markdown格式）
     */
    val content: String,
    
    /**
     * 是否删除
     */
    val deleted: Int = 0,
    
    /**
     * 创建时间
     */
    val createdAt: OffsetDateTime?,
    
    /**
     * 最后更新时间
     */
    val updatedAt: OffsetDateTime?,
    
    /**
     * 乐观锁版本号
     */
    val version: Int = 0
) {
    companion object {
        /**
         * 创建新的协议条款
         */
        fun create(
            key: String,
            title: String,
            content: String
        ): AgreementTerm {
            val now = OffsetDateTime.now()
            return AgreementTerm(
                id = null,
                key = key,
                title = title,
                content = content,
                deleted = 0,
                createdAt = now,
                updatedAt = now,
                version = 0
            )
        }
    }
    
    /**
     * 更新条款内容
     */
    fun update(title: String, content: String): AgreementTerm {
        return this.copy(
            title = title,
            content = content,
            updatedAt = OffsetDateTime.now()
        )
    }
} 