package com.task.domain.repository

import com.task.domain.model.task.TaskDependency

/**
 * 任务依赖关系仓库接口
 * 用于管理任务依赖关系的CRUD操作
 */
interface TaskDependencyRepository : Repository<TaskDependency> {
}
