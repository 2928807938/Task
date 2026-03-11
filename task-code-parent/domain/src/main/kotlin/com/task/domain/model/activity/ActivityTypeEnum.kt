package com.task.domain.model.activity

/**
 * 活动类型枚举
 * 定义系统中可能发生的各种活动类型
 */
enum class ActivityTypeEnum(val code: Int) {
    /**
     * 创建任务
     */
    TASK_CREATED(1),

    /**
     * 更新任务
     */
    TASK_UPDATED(2),

    /**
     * 评论任务
     */
    TASK_COMMENTED(3),

    /**
     * 任务状态变更
     */
    TASK_STATUS_CHANGED(4),

    /**
     * 任务分配
     */
    TASK_ASSIGNED(5),

    /**
     * 创建项目
     */
    PROJECT_CREATED(6),

    /**
     * 更新项目
     */
    PROJECT_UPDATED(7),

    /**
     * 添加团队成员
     */
    TEAM_MEMBER_ADDED(8),

    /**
     * 上传文件
     */
    FILE_UPLOADED(9),

    /**
     * 自定义活动
     */
    CUSTOM_ACTION(10);

    companion object {
        /**
         * 根据整数编码查找对应的枚举实例
         *
         * @param code 整数编码
         * @return 对应的ActivityTypeEnum枚举实例，如果未找到则返回null
         */
        fun fromCode(code: Int): ActivityTypeEnum? =
            entries.find { it.code == code }

        /**
         * 根据整数编码查找对应的枚举实例，如果未找到则抛出异常
         *
         * @param code 整数编码
         * @return 对应的ActivityTypeEnum枚举实例
         * @throws IllegalArgumentException 如果未找到对应的枚举实例
         */
        fun fromCodeOrThrow(code: Int): ActivityTypeEnum =
            fromCode(code) ?: throw IllegalArgumentException("Invalid ActivityTypeEnum code: $code")

        /**
         * 根据名称查找对应的枚举实例
         *
         * @param name 枚举名称
         * @return 对应的ActivityTypeEnum枚举实例，如果未找到则返回null
         */
        fun fromName(name: String): ActivityTypeEnum? =
            try {
                valueOf(name)
            } catch (e: IllegalArgumentException) {
                null
            }

        /**
         * 根据名称查找对应的枚举实例，如果未找到则返回默认值
         *
         * @param name 枚举名称
         * @param defaultType 默认活动类型，如果没有找到对应的枚举值则返回此值
         * @return 对应的枚举值或默认值
         */
        fun fromName(name: String, defaultType: ActivityTypeEnum): ActivityTypeEnum =
            fromName(name) ?: defaultType
    }
}