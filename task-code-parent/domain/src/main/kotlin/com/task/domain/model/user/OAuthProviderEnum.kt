package com.task.domain.model.user

/**
 * OAuth认证提供商枚举
 * 定义系统支持的第三方登录提供商
 */
enum class OAuthProviderEnum(val code: Int, val description: String) {
    /**
     * 微信登录
     */
    WECHAT(1, "微信"),
    
    /**
     * Google登录
     */
    GOOGLE(2, "谷歌"),
    
    /**
     * GitHub登录
     */
    GITHUB(3, "GitHub"),
    
    /**
     * 苹果登录
     */
    APPLE(4, "苹果"),
    
    /**
     * 微博登录
     */
    WEIBO(5, "微博"),
    
    /**
     * QQ登录
     */
    QQ(6, "QQ");
    
    companion object {
        /**
         * 根据提供商代码获取对应的枚举值
         * 
         * @param code 提供商代码
         * @return 对应的枚举值，如果没有找到则返回null
         */
        fun fromCode(code: Int): OAuthProviderEnum? = entries.find { it.code == code }
        
        /**
         * 根据提供商代码获取对应的枚举值，如果没有找到则返回默认值
         * 
         * @param code 提供商代码
         * @param defaultProvider 默认提供商，如果没有找到对应的枚举值则返回此值
         * @return 对应的枚举值或默认值
         */
        fun fromCode(code: Int, defaultProvider: OAuthProviderEnum): OAuthProviderEnum = fromCode(code) ?: defaultProvider
    }
}
