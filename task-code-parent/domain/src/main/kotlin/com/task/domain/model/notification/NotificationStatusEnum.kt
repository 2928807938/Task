package com.task.domain.model.notification

/**
 * 通知状态枚举
 * 定义通知的各种状态
 */
enum class NotificationStatusEnum(val code: Int) {
    /**
     * 未读状态
     */
    UNREAD(0),

    /**
     * 已读状态
     */
    READ(1),

    /**
     * 已归档状态
     */
    ARCHIVED(2);

    companion object {
        /**
         * 根据整数编码查找对应的枚举实例
         *
         * @param code 整数编码
         * @return 对应的NotificationStatusEnum枚举实例，如果未找到则返回null
         */
        fun fromCode(code: Int?): NotificationStatusEnum? =
            entries.find { it.code == code }

        /**
         * 根据整数编码查找对应的枚举实例，如果未找到则抛出异常
         *
         * @param code 整数编码
         * @return 对应的NotificationStatusEnum枚举实例
         * @throws IllegalArgumentException 如果未找到对应的枚举实例
         */
        fun fromCodeOrThrow(code: Int?): NotificationStatusEnum =
            fromCode(code) ?: throw IllegalArgumentException("Invalid NotificationStatusEnum code: $code")

        /**
         * 根据整数编码查找对应的枚举实例，如果未找到则返回默认值
         *
         * @param code 整数编码
         * @param defaultStatus 默认状态，如果没有找到对应的枚举值则返回此值
         * @return 对应的枚举值或默认值
         */
        fun fromCode(code: Int, defaultStatus: NotificationStatusEnum): NotificationStatusEnum =
            fromCode(code) ?: defaultStatus

        /**
         * 根据名称查找对应的枚举实例
         *
         * @param name 枚举名称
         * @return 对应的NotificationStatusEnum枚举实例，如果未找到则返回null
         */
        fun fromName(name: String): NotificationStatusEnum? =
            try {
                valueOf(name)
            } catch (e: IllegalArgumentException) {
                null
            }

        /**
         * 根据名称查找对应的枚举实例，如果未找到则返回默认值
         *
         * @param name 枚举名称
         * @param defaultStatus 默认状态，如果没有找到对应的枚举值则返回此值
         * @return 对应的枚举值或默认值
         */
        fun fromName(name: String, defaultStatus: NotificationStatusEnum): NotificationStatusEnum =
            fromName(name) ?: defaultStatus
    }
}