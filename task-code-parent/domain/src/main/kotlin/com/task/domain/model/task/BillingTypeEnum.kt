package com.task.domain.model.task;

/**
 * 计费类型枚举
 * 定义时间记录的不同计费类型
 */
enum class BillingTypeEnum(val code: Int, val description: String) {
    /**
     * 不可计费
     * 用于内部任务、培训等不向客户收费的时间
     */
    NON_BILLABLE(0, "不可计费"),
    
    /**
     * 标准计费
     * 按照标准费率计费的时间
     */
    STANDARD(1, "标准计费"),
    
    /**
     * 折扣计费
     * 按照折扣费率计费的时间
     */
    DISCOUNTED(2, "折扣计费"),
    
    /**
     * 加急计费
     * 按照加急费率计费的时间，通常高于标准费率
     */
    URGENT(3, "加急计费"),
    
    /**
     * 固定计费
     * 不按时间计费，而是按固定金额计费
     */
    FIXED(4, "固定计费");
    
    companion object {
        /**
         * 根据代码获取计费类型
         * @param code 计费类型代码
         * @return 对应的计费类型，如果未找到则返回NON_BILLABLE
         */
        fun fromCode(code: Int): BillingTypeEnum {
            return entries.find { it.code == code } ?: NON_BILLABLE
        }
    }
}