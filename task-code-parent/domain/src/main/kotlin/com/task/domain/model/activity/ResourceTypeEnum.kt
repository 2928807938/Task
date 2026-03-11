package com.task.domain.model.activity;

/**
 * 资源类型枚举
 * 定义系统中各种资源的类型
 */
enum class ResourceTypeEnum(val code: Int) {
    /**
     * 任务
     */
    TASK(1),
    
    /**
     * 项目
     */
    PROJECT(2),
    
    /**
     * 评论
     */
    COMMENT(3),
    
    /**
     * 附件
     */
    ATTACHMENT(4),
    
    /**
     * 用户
     */
    USER(5),
    
    /**
     * 团队
     */
    TEAM(6),
    
    /**
     * 标签
     */
    TAG(7),
    
    /**
     * 时间记录
     */
    TIME_ENTRY(8);
    
    companion object {
        /**
         * 根据整数值查找对应的枚举实例
         *
         * @param value 整数值
         * @return 对应的ResourceType枚举实例，如果未找到则返回null
         */
        fun fromValue(value: Int): ResourceTypeEnum? =
            entries.find { it.code == value }
        
        /**
         * 根据整数值查找对应的枚举实例，如果未找到则抛出异常
         *
         * @param value 整数值
         * @return 对应的ResourceType枚举实例
         * @throws IllegalArgumentException 如果未找到对应的枚举实例
         */
        fun fromValueOrThrow(value: Int): ResourceTypeEnum =
            fromValue(value) ?: throw IllegalArgumentException("Invalid ResourceType value: $value")

        /**
         * 根据资源类型编码获取对应的枚举值
         *
         * @param code 资源类型编码
         * @return 对应的枚举值，如果没有找到则返回null
         */
        fun fromCode(code: Int?): ResourceTypeEnum? = entries.find { it.code == code }

        /**
         * 根据资源类型编码获取对应的枚举值，如果没有找到则返回默认值
         *
         * @param code 资源类型编码
         * @param defaultType 默认资源类型，如果没有找到对应的枚举值则返回此值
         * @return 对应的枚举值或默认值
         */
        fun fromCode(code: Int, defaultType: ResourceTypeEnum): ResourceTypeEnum = fromCode(code) ?: defaultType
        
        /**
         * 根据名称查找对应的枚举实例
         *
         * @param name 枚举名称
         * @return 对应的ResourceType枚举实例，如果未找到则返回null
         */
        fun fromName(name: String): ResourceTypeEnum? =
            try {
                valueOf(name)
            } catch (e: IllegalArgumentException) {
                null
            }
    }
}