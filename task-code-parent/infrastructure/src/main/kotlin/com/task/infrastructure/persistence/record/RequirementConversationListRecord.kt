package com.task.infrastructure.persistence.record

import com.task.infrastructure.persistence.base.BaseRecord
import org.springframework.data.relational.core.mapping.Table

/**
 * 需求对话列表基础记录类
 * 映射到数据库中的 t_requirement_conversation_list 表
 */
@Table("t_requirement_conversation_list")
class RequirementConversationListRecord : BaseRecord()
