package com.task.infrastructure.persistence.record

import com.task.infrastructure.persistence.base.BaseRecord
import org.springframework.data.relational.core.mapping.Table

/**
 * 用户个人资料表记录类
 * 映射到数据库中的t_user_profile表，存储用户的扩展信息
 */
@Table("t_user_profile")
data class UserProfileRecord(
    
    /**
     * 关联的用户ID，一对一关系
     */
    val userId: Long,
    
    /**
     * 用户全名，真实姓名
     */
    val fullName: String? = null,
    
    /**
     * 用户联系电话
     */
    val phone: String? = null,

) : BaseRecord()
