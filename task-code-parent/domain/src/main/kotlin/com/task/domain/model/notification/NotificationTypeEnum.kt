package com.task.domain.model.notification

/**
 * 通知类型枚举
 * 定义系统中的各种通知类型
 */
enum class NotificationTypeEnum(val code: Int) {
    /**
     * 任务分配通知
     */
    TASK_ASSIGNED(1),

    /**
     * 任务更新通知
     */
    TASK_UPDATED(2),

    /**
     * 任务评论通知
     */
    TASK_COMMENTED(3),

    /**
     * 任务即将到期通知
     */
    TASK_DUE_SOON(4),

    /**
     * 任务已逾期通知
     */
    TASK_OVERDUE(5),

    /**
     * 被提及(@)通知
     */
    MENTION(6),

    /**
     * 项目更新通知
     */
    PROJECT_UPDATED(7),

    /**
     * 团队更新通知
     */
    TEAM_UPDATED(8),

    /**
     * 自定义通知
     */
    CUSTOM(9);

    companion object {
        /**
         * 根据整数编码查找对应的枚举实例
         *
         * @param code 整数编码
         * @return 对应的NotificationTypeEnum枚举实例，如果未找到则返回null
         */
        fun fromCode(code: Int): NotificationTypeEnum? =
            entries.find { it.code == code }

        /**
         * 根据整数编码查找对应的枚举实例，如果未找到则抛出异常
         *
         * @param code 整数编码
         * @return 对应的NotificationTypeEnum枚举实例
         * @throws IllegalArgumentException 如果未找到对应的枚举实例
         */
        fun fromCodeOrThrow(code: Int): NotificationTypeEnum =
            fromCode(code) ?: throw IllegalArgumentException("Invalid NotificationTypeEnum code: $code")

        /**
         * 根据整数编码查找对应的枚举实例，如果未找到则返回默认值
         *
         * @param code 整数编码
         * @param defaultType 默认通知类型，如果没有找到对应的枚举值则返回此值
         * @return 对应的枚举值或默认值
         */
        fun fromCode(code: Int, defaultType: NotificationTypeEnum): NotificationTypeEnum =
            fromCode(code) ?: defaultType

        /**
         * 根据名称查找对应的枚举实例
         *
         * @param name 枚举名称
         * @return 对应的NotificationTypeEnum枚举实例，如果未找到则返回null
         */
        fun fromName(name: String): NotificationTypeEnum? =
            try {
                valueOf(name)
            } catch (e: IllegalArgumentException) {
                null
            }

        /**
         * 根据名称查找对应的枚举实例，如果未找到则返回默认值
         *
         * @param name 枚举名称
         * @param defaultType 默认通知类型，如果没有找到对应的枚举值则返回此值
         * @return 对应的枚举值或默认值
         */
        fun fromName(name: String, defaultType: NotificationTypeEnum): NotificationTypeEnum =
            fromName(name) ?: defaultType
    }
}