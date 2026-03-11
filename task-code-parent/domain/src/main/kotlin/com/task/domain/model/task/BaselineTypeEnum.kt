package com.task.domain.model.task

/**
 * 基线类型枚举
 * 定义时间估计的不同基线类型
 */
enum class BaselineTypeEnum(val code: Int, val description: String) {
    /**
     * 初始估计
     * 任务创建时的初始时间估计
     */
    INITIAL(1, "初始估计"),

    /**
     * 修订估计
     * 任务进行中的修订时间估计
     */
    REVISED(2, "修订估计"),

    /**
     * 最终估计
     * 任务接近完成时的最终时间估计
     */
    FINAL(3, "最终估计"),

    /**
     * 实际时间
     * 任务完成后的实际花费时间
     */
    ACTUAL(4, "实际时间");

    companion object {
        /**
         * 根据代码获取基线类型
         * @param code 基线类型代码
         * @return 对应的基线类型，如果未找到则返回INITIAL
         */
        fun fromCode(code: Int): BaselineTypeEnum {
            return entries.find { it.code == code } ?: INITIAL
        }
    }
}