package com.task.infrastructure.persistence.record

import com.task.infrastructure.persistence.base.BaseRecord
import org.springframework.data.relational.core.mapping.Table
import java.time.OffsetDateTime

/**
 * 项目角色表记录类
 * 映射到数据库中的t_project_role表，存储项目角色信息
 */
@Table("t_project_role")
data class ProjectRoleRecord(
    /**
     * 角色名称
     */
    var name: String,

    /**
     * 所属项目ID，关联t_projects表
     */
    var projectId: Long,

    /**
     * 角色描述
     */
    var description: String? = null,

    /**
     * 角色编码，用于系统内部标识
     */
    var code: String? = null,

    /**
     * 角色排序值，用于在界面上展示的顺序
     */
    var sortOrder: Int = 0,

    /**
     * 是否为系统预设角色，系统预设角色不可删除
     */
    var isSystem: Boolean = false
) : BaseRecord(
    id = null,
    deleted = 0,
    createdAt = null,
    updatedAt = null,
    version = 0
) {
    // 添加一个辅助构造函数，用于从领域模型转换时设置所有字段
    constructor(
        id: Long? = null,
        name: String,
        projectId: Long,
        description: String? = null,
        code: String? = null,
        sortOrder: Int = 0,
        isSystem: Boolean = false,
        createdAt: OffsetDateTime? = null,
        updatedAt: OffsetDateTime? = null,
        version: Int = 0,
        deleted: Int = 0
    ) : this(name, projectId, description, code, sortOrder, isSystem) {
        this.id = id
        this.createdAt = createdAt
        this.updatedAt = updatedAt
        this.version = version
        this.deleted = deleted
    }
}
