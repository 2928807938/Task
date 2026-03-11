package com.task.application.request

/**
 * 创建协议条款请求
 */
data class CreateAgreementTermRequest(
    /**
     * 条款唯一标识键
     */
    val key: String,
    
    /**
     * 条款标题
     */
    val title: String,
    
    /**
     * 条款内容（Markdown格式）
     */
    val content: String
)

/**
 * 更新协议条款请求
 */
data class UpdateAgreementTermRequest(
    /**
     * 条款标题
     */
    val title: String,
    
    /**
     * 条款内容（Markdown格式）
     */
    val content: String
) 