package com.task.domain.exception

import com.task.domain.model.task.Task

/**
 * 自定义异常：表示有任务需要重新分配
 * 
 * 当尝试移除一个项目成员时，如果该成员还有未完成的任务，
 * 将抛出此异常，提示用户需要先处理这些任务
 */
class TasksNeedReassignmentException(
    message: String,
    val tasks: List<Task>
) : Exception(message)
