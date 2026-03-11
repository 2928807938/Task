package com.task.infrastructure.persistence.record

import com.task.domain.model.team.CollaborationType
import com.task.infrastructure.persistence.base.BaseRecord
import org.springframework.data.relational.core.mapping.Table

/**
 * 协作记录类
 * 映射到数据库中的t_collaboration_record表，存储任务协作信息
 */
@Table("t_collaboration_record")
data class CollaborationRecord(
    /**
     * 所属任务ID
     */
    val taskId: Long,

    /**
     * 发送者ID
     */
    val senderId: Long,

    /**
     * 提及的用户ID
     */
    val mentionedUserId: Long?,

    /**
     * 消息内容
     */
    val content: String,

    /**
     * 消息类型
     */
    val type: CollaborationType

) : BaseRecord() 