package com.task.domain.model.project.command

import com.task.domain.model.project.config.ProjectConfig
import java.time.OffsetDateTime

/**
 * 创建项目命令
 * 包含创建项目所需的所有信息
 */
data class CreateProjectCommand(

    /**
     * 项目名称
     * 不能为空
     */
    val name: String,
    
    /**
     * 项目描述
     * 项目的详细说明
     */
    val description: String,
    
    /**
     * 项目所有者ID
     * 创建项目的用户ID
     */
    val ownerId: Long,
    
    /**
     * 项目开始日期
     * 可选，项目计划开始的时间
     */
    val startDate: OffsetDateTime? = null,
    
    
    /**
     * 团队ID
     * 项目所属的团队
     */
    val teamId: Long,
    
    /**
     * 项目配置
     * 包含优先级体系类型、状态体系类型和自定义项
     */
    val config: ProjectConfig = ProjectConfig()
)