package com.task.domain.model.common

/**
 * 启用状态枚举
 * 表示系统中各种功能或选项的启用/禁用状态
 */
enum class EnableStatusEnum(val code: Int) {
    /**
     * 禁用
     */
    DISABLED(0),
    
    /**
     * 启用
     */
    ENABLED(1);
    
    companion object {
        /**
         * 根据状态编码获取对应的枚举值
         *
         * @param code 状态编码
         * @return 对应的枚举值，如果没有找到则返回null
         */
        fun fromCode(code: Int?): EnableStatusEnum? = 
            entries.find { it.code == code }
        
        /**
         * 根据状态编码获取对应的枚举值，如果没有找到则返回默认值
         *
         * @param code 状态编码
         * @param defaultStatus 默认状态，如果没有找到对应的枚举值则返回此值
         * @return 对应的枚举值或默认值
         */
        fun fromCode(code: Int, defaultStatus: EnableStatusEnum): EnableStatusEnum = 
            fromCode(code) ?: defaultStatus
    }
}