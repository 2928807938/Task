package com.task.domain.model.project.config

/**
 * 状态转换规则
 * 定义从一个状态到另一个状态的转换规则
 */
data class StatusTransitionRule(
    /**
     * 源状态ID
     * 转换的起始状态ID
     */
    val fromStatusId: String,
    
    /**
     * 目标状态ID
     * 转换的目标状态ID
     */
    val toStatusId: String
)
