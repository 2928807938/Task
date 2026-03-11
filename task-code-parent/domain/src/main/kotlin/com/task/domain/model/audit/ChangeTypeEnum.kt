package com.task.domain.model.audit

/**
 * 变更类型枚举
 * 定义系统中可能发生的各种变更类型
 */
enum class ChangeTypeEnum(val code: Int) {
    /**
     * 创建
     * 表示新建一个实体
     */
    CREATE(1),

    /**
     * 更新
     * 表示修改实体的属性
     */
    UPDATE(2),

    /**
     * 删除
     * 表示将实体标记为已删除（通常是逻辑删除）
     */
    DELETE(3),

    /**
     * 恢复
     * 表示将已删除的实体恢复为正常状态
     */
    RESTORE(4);

    companion object {
        /**
         * 根据代码获取对应的枚举值
         *
         * @param code 变更类型代码
         * @return 对应的枚举值，如果找不到则返回null
         */
        fun fromCode(code: Int): ChangeTypeEnum? {
            return entries.find { it.code == code }
        }

        /**
         * 根据代码获取对应的枚举值，如果找不到则抛出异常
         *
         * @param code 变更类型代码
         * @return 对应的枚举值
         * @throws IllegalArgumentException 如果找不到对应的枚举值
         */
        fun fromCodeOrThrow(code: Int): ChangeTypeEnum {
            return fromCode(code) ?: throw IllegalArgumentException("未知的变更类型代码: $code")
        }
    }
}
