package com.task.domain.model.task.requirementsuggestion

/**
 * 建议值对象
 * 表示系统给出的智能建议
 */
data class Suggestion(
    /**
     * 建议类型
     */
    val type: String,
    
    /**
     * 建议标题
     */
    val title: String,
    
    /**
     * 图标
     * 可用于UI展示的图标标识
     */
    val icon: String,
    
    /**
     * 颜色
     * 可用于UI展示的颜色标识
     */
    val color: String,
    
    /**
     * 建议描述
     */
    val description: String
) 