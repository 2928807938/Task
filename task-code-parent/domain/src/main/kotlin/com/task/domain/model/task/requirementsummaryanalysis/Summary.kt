package com.task.domain.model.task.requirementsummaryanalysis

/**
 * 摘要值对象
 * 包含需求的标题、概述、关键点、挑战和机会
 */
data class Summary(
    /**
     * 标题
     */
    val title: String,
    
    /**
     * 概述
     */
    val overview: String,
    
    /**
     * 关键点列表
     */
    val keyPoints: List<String>,
    
    /**
     * 挑战列表
     */
    val challenges: List<String>,
    
    /**
     * 机会列表
     */
    val opportunities: List<String>
) 