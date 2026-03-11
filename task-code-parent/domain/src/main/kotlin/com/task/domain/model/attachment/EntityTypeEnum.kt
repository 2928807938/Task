package com.task.domain.model.attachment

/**
 * 实体类型枚举
 * 定义可以关联附件的各种实体类型
 */
enum class EntityTypeEnum(val code: Int) {
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
     * 用户（如头像）
     */
    USER(4),

    /**
     * 团队（如团队logo）
     */
    TEAM(5),

    /**
     * 知识库文档
     */
    DOCUMENT(6),

    /**
     * 会议记录
     */
    MEETING(7);

    companion object {
        /**
         * 根据整数代码查找对应的枚举实例
         *
         * @param code 整数代码
         * @return 对应的EntityType枚举实例，如果未找到则返回null
         */
        fun fromCode(code: Int): EntityTypeEnum? =
            entries.find { it.code == code }

        /**
         * 根据整数代码查找对应的枚举实例，如果未找到则抛出异常
         *
         * @param code 整数代码
         * @return 对应的EntityType枚举实例
         * @throws IllegalArgumentException 如果未找到对应的枚举实例
         */
        fun fromCodeOrThrow(code: Int): EntityTypeEnum =
            fromCode(code) ?: throw IllegalArgumentException("Invalid EntityType code: $code")

        /**
         * 根据整数代码查找对应的枚举实例，如果未找到则返回默认值
         *
         * @param code 整数代码
         * @param defaultType 默认实体类型
         * @return 对应的枚举实例或默认值
         */
        fun fromCode(code: Int, defaultType: EntityTypeEnum): EntityTypeEnum =
            fromCode(code) ?: defaultType
    }
}