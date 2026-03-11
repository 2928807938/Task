package com.task.domain.model.task

import com.task.domain.model.user.User
import java.time.Duration
import java.time.OffsetDateTime

/**
 * 时间记录领域模型
 * 代表用户在任务上花费的时间记录
 */
data class TimeEntry(
    /**
     * 时间记录唯一标识
     */
    val id: Long,

    /**
     * 所属任务ID
     */
    val taskId: Long,

    /**
     * 所属任务
     */
    val task: Task? = null,

    /**
     * 用户ID
     */
    val userId: Long,

    /**
     * 用户
     */
    val user: User? = null,

    /**
     * 开始时间
     */
    val startTime: OffsetDateTime,

    /**
     * 结束时间
     */
    val endTime: OffsetDateTime? = null,

    /**
     * 持续时间（秒）
     * 如果endTime为空，则此字段也为空
     */
    val duration: Long? = null,

    /**
     * 描述
     */
    val description: String? = null,

    /**
     * 计费类型
     * @see BillingTypeEnum
     */
    val billingType: Int = BillingTypeEnum.STANDARD.code,

    /**
     * 创建时间
     */
    val createdAt: OffsetDateTime,

    /**
     * 更新时间
     */
    val updatedAt: OffsetDateTime? = null,

    /**
     * 乐观锁版本号，用于并发控制
     */
    var version: Int
) {
    /**
     * 计算时间记录的持续时间
     * @return 如果endTime不为空，则返回从startTime到endTime的持续时间；否则返回null
     */
    fun calculateDuration(): Duration? {
        return endTime?.let { Duration.between(startTime, it) }
    }

    /**
     * 判断时间记录是否正在进行中
     * @return 如果endTime为空则返回true，否则返回false
     */
    fun isRunning(): Boolean = endTime == null

    /**
     * 判断时间记录是否可计费
     * @return 如果计费类型不是NON_BILLABLE则返回true，否则返回false
     */
    fun isBillable(): Boolean = billingType != BillingTypeEnum.NON_BILLABLE.code

    /**
     * 获取计费类型枚举
     * @return 对应的计费类型枚举
     */
    fun getBillingTypeEnum(): BillingTypeEnum = BillingTypeEnum.fromCode(billingType)
}
