package com.task.infrastructure.persistence.record

import com.task.infrastructure.persistence.base.BaseRecord
import org.springframework.data.relational.core.mapping.Table

/**
 * 协议条款记录类
 * 用于存储系统中各类协议条款信息
 * 映射到数据库表 agreement_term
 */
@Table("agreement_term")
data class AgreementTermRecord(
    /**
     * 条款唯一标识符
     * 用于检索和引用特定协议条款
     */
    val key: String,
    
    /**
     * 协议条款标题
     * 显示在用户界面上的条款名称
     */
    val title: String,
    
    /**
     * 协议条款内容
     * 包含完整的协议条款文本
     */
    val content: String
) : BaseRecord() 