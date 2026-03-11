package com.task.domain.model.team

/**
 * 协作记录类型枚举
 * 定义了不同类型的协作消息和操作
 */
enum class CollaborationType(val description: String) {
    // 消息类型

    MENTION("消息"),

    NORMAL("普通消息"),
    
    // 主任务操作
    TASK_CREATED("创建任务"),
    TASK_UPDATED("更新任务"),
    STATUS_CHANGED("状态变更"),
    PRIORITY_CHANGED("优先级变更"),
    ASSIGNEE_CHANGED("负责人变更"),
    DUE_DATE_CHANGED("截止日期变更"),
    TAG_CHANGED("标签变更"),
    COMMENT_ADDED("添加评论"),
    COMMENT_UPDATED("更新评论"),
    COMMENT_DELETED("删除评论"),
    
    // 子任务操作
    SUBTASK_ADDED("添加子任务"),
    SUBTASK_REMOVED("移除子任务"),
    SUBTASK_UPDATED("更新子任务"),
    SUBTASK_STATUS_CHANGED("子任务状态变更"),
    SUBTASK_ASSIGNEE_CHANGED("子任务负责人变更"),
    
    // 其他操作
    TIME_LOGGED("记录时间"),
    ATTACHMENT_ADDED("添加附件"),
    ATTACHMENT_REMOVED("移除附件"),
    OTHER("其他变更")
}