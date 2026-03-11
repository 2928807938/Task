package com.task.domain.model.versioning;

/**
 * 文档版本类型枚举
 * 定义系统中文档版本的类型
 */
enum class VersionTypeEnum(val code: Int, val description: String) {
    /**
     * 主版本，表示重大更新或重要里程碑
     * 例如：1.0, 2.0
     */
    MAJOR(1, "主版本"),
    
    /**
     * 次版本，表示功能更新或增强
     * 例如：1.1, 1.2
     */
    MINOR(2, "次版本"),
    
    /**
     * 修订版本，表示错误修复或小改进
     * 例如：1.0.1, 1.1.1
     */
    PATCH(3, "修订版本"),
    
    /**
     * Alpha测试版本，表示早期测试版本
     * 例如：1.0-alpha
     */
    ALPHA(4, "Alpha测试版本"),
    
    /**
     * Beta测试版本，表示公开测试版本
     * 例如：1.0-beta
     */
    BETA(5, "Beta测试版本"),
    
    /**
     * 发布候选版本，即将正式发布的版本
     * 例如：1.0-rc
     */
    RC(6, "发布候选版本");
    
    companion object {
        /**
         * 根据类型码获取对应的枚举值
         * 
         * @param code 类型码
         * @return 对应的枚举值，如果没有找到则返回null
         */
        fun fromCode(code: Int): VersionTypeEnum? = entries.find { it.code == code }
        
        /**
         * 根据类型码获取对应的枚举值，如果没有找到则返回默认值
         * 
         * @param code 类型码
         * @param defaultType 默认类型，如果没有找到对应的枚举值则返回此值
         * @return 对应的枚举值或默认值
         */
        fun fromCode(code: Int, defaultType: VersionTypeEnum): VersionTypeEnum = fromCode(code) ?: defaultType
        
        /**
         * 判断是否为主版本
         * 
         * @param versionType 版本类型
         * @return 如果是主版本返回true，否则返回false
         */
        fun isMajorVersion(versionType: VersionTypeEnum): Boolean = versionType == MAJOR
    }
}