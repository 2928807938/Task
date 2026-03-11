package com.task.application.vo

import java.time.OffsetDateTime

/**
 * 沟通记录数据传输对象
 * 表示团队成员之间的沟通记录
 */
data class CommunicationRecordVO(
    // 记录ID
    val id: Long,
    // 发送者ID
    val senderId: Long,
    // 发送者名称
    val senderName: String,
    // 消息内容
    val content: String,
    // 发送时间
    val sentAt: OffsetDateTime,
    // 未读消息数（如果有）
    val unreadCount: Int? = null
)