package com.task.application.vo

/**
 * 项目成员简化视图对象
 * 只包含成员ID和成员名称
 */
data class ProjectMemberSimpleVO(

    /**
     * 成员ID，成员的唯一标识符
     */
    val id: Long,

    /**
     * 成员名称
     */
    val name: String
)
