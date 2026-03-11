package com.task.infrastructure.persistence.record

import com.task.infrastructure.persistence.base.BaseRecord
import org.springframework.data.relational.core.mapping.Table
import java.time.OffsetDateTime

/**
 * 邀请链接记录类
 * 映射到数据库中的t_invite_link表，存储邀请链接信息
 */
@Table("t_invite_link")
data class InviteLinkRecord(
    /**
     * 邀请链接的唯一代码
     */
    val code: String,
    
    /**
     * 创建者ID
     */
    val creatorId: Long,
    
    /**
     * 项目ID
     */
    val projectId: Long?,
    
    /**
     * 链接有效期截止时间
     */
    val expireAt: OffsetDateTime,
    
    /**
     * 最大使用次数，null表示不限制
     */
    val maxUsageCount: Int?,
    
    /**
     * 当前已使用次数
     */
    val usedCount: Int = 0

) : BaseRecord()