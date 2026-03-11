package com.task.domain.model.user

/**
 * 用户状态枚举
 * 定义系统中用户可能的状态
 */
enum class UserStatusEnum(val code: Int, val description: String) {
    /**
     * 活跃状态，用户可以正常使用系统
     */
    ACTIVE(1, "活跃可用"),
    
    /**
     * 非活跃状态，用户账号已被停用
     */
    INACTIVE(0, "已停用");
    
    companion object {
        /**
         * 根据状态码获取对应的枚举值
         * 
         * @param code 状态码
         * @return 对应的枚举值，如果没有找到则返回null
         */
        fun fromCode(code: Int): UserStatusEnum? = entries.find { it.code == code }
        
        /**
         * 根据状态码获取对应的枚举值，如果没有找到则返回默认值
         * 
         * @param code 状态码
         * @param defaultStatus 默认状态，如果没有找到对应的枚举值则返回此值
         * @return 对应的枚举值或默认值
         */
        fun fromCode(code: Int, defaultStatus: UserStatusEnum): UserStatusEnum = fromCode(code) ?: defaultStatus
    }
}
