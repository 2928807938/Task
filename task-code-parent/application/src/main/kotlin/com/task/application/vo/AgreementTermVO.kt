package com.task.application.vo

import java.time.OffsetDateTime

/**
 * 协议条款数据传输对象
 */
data class AgreementTermVO(
    /**
     * 唯一标识
     */
    val id: Long?,
    
    /**
     * 条款唯一标识键
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
     * 创建时间
     */
    val createdAt: OffsetDateTime?,
    
    /**
     * 最后更新时间
     */
    val updatedAt: OffsetDateTime?
) {
    companion object {
        /**
         * 从领域模型创建DTO
         */
        fun fromDomain(domain: com.task.domain.model.agreement.AgreementTerm): AgreementTermVO {
            return AgreementTermVO(
                id = domain.id,
                key = domain.key,
                title = domain.title,
                content = domain.content,
                createdAt = domain.createdAt,
                updatedAt = domain.updatedAt
            )
        }
    }
}