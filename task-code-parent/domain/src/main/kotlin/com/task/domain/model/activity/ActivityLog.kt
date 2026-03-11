package com.task.domain.model.activity

import com.task.domain.model.user.User
import java.time.OffsetDateTime

/**
 * 活动日志领域模型
 * 记录系统中发生的各种活动
 */
data class ActivityLog(
    /**
     * 活动日志唯一标识
     */
    val id: Long,

    /**
     * 活动类型 (ActivityTypeEnum)
     */
    val activityType: ActivityTypeEnum,

    /**
     * 活动描述
     * 可包含占位符，如"{{user}}创建了任务{{task}}"
     */
    val description: String,

    /**
     * 活动执行者ID
     * 关联到User.id
     */
    val actorId: Long,

    /**
     * 活动执行者
     */
    val actor: User? = null,

    /**
     * 活动主要对象类型 (ResourceTypeEnum)
     */
    val objectType: ResourceTypeEnum,

    /**
     * 活动主要对象ID
     * 关联到相应对象表的id字段
     */
    val objectId: Long,

    /**
     * 活动相关对象类型 (ResourceTypeEnum)
     */
    val relatedObjectType: ResourceTypeEnum? = null,

    /**
     * 活动相关对象ID
     * 关联到相应对象表的id字段
     */
    val relatedObjectId: Long? = null,

    /**
     * 活动元数据，可存储JSON格式的额外信息
     * 可用于存储格式化描述所需的参数
     */
    val metadata: String? = null,

    /**
     * 活动发生时间
     */
    val createdAt: OffsetDateTime?,

    /**
     * 记录最后更新时间
     */
    var updatedAt: OffsetDateTime?,

    /**
     * 乐观锁版本号，用于并发控制
     */
    var version: Int
) {
    /**
     * 格式化活动描述，替换描述中的占位符
     *
     * @param params 参数映射，键为占位符名称（不含花括号），值为替换内容
     * @return 格式化后的描述
     */
    fun formatDescription(params: Map<String, String>): String {
        if (params.isEmpty()) return description

        var result = description
        params.forEach { (key, value) ->
            result = result.replace("{{$key}}", value ?: "")
        }
        return result
    }
}
