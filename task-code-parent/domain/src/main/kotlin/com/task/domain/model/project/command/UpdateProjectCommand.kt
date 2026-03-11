package com.task.domain.model.project.command

/**
 * 更新项目命令
 * 包含更新项目所需的所有信息
 */
data class UpdateProjectCommand(
    val id: Long,
    val name: String?,
    val description: String?
)