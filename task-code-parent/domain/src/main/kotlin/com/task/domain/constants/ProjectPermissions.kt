package com.task.domain.constants

/**
 * 项目权限常量
 * 定义项目相关的所有操作权限编码
 * 用于RBAC权限控制，主要针对项目级别的操作
 * 
 * 注意：这些常量与ProjectService中使用的权限代码必须保持一致
 */
object ProjectPermissions {
    
    // 项目基本操作
    const val PROJECT_VIEW = "project:view"              // 查看项目
    const val PROJECT_EDIT = "project:edit"              // 编辑项目
    const val PROJECT_DELETE = "project:delete"          // 删除项目
    const val PROJECT_MANAGE = "project:manage"          // 管理项目

    // 任务相关权限
    const val TASK_VIEW = "task:view"                    // 查看任务
    const val TASK_CREATE = "task:create"                // 创建任务
    const val TASK_EDIT = "task:edit"                    // 编辑任务
    const val TASK_DELETE = "task:delete"                // 删除任务
    const val TASK_ASSIGN = "task:assign"                // 分配任务

    // 项目成员管理
    const val MEMBER_VIEW = "member:view"                // 查看成员
    const val MEMBER_ADD = "member:add"                  // 添加成员
    const val MEMBER_REMOVE = "member:remove"            // 移除成员
    const val MEMBER_MANAGE = "member:manage"            // 管理成员权限

    // 项目角色管理
    const val PROJECT_ROLE_CREATE = "project:role:create"    // 创建角色
    const val PROJECT_ROLE_READ = "project:role:read"        // 查看角色
    const val PROJECT_ROLE_EDIT = "project:role:edit"        // 编辑角色
    const val PROJECT_ROLE_DELETE = "project:role:delete"    // 删除角色

    // 项目数据查看
    const val PROJECT_PRIORITY_VIEW = "project:priority:view" // 查看优先级体系
    const val PROJECT_STATUS_VIEW = "project:status:view"     // 查看状态列表
    const val PROJECT_TASK_STATS_VIEW = "project:task:stats:view" // 查看任务统计
    const val PROJECT_TASK_TREND_VIEW = "project:task:trend:view" // 查看任务趋势
    
    /**
     * 获取项目所有者的所有权限代码
     * 与ProjectService.assignOwnerRolePermissions方法中的权限列表保持一致
     */
    fun getOwnerPermissions(): List<String> {
        return listOf(
            PROJECT_VIEW,       // 查看项目
            PROJECT_EDIT,       // 编辑项目
            PROJECT_DELETE,     // 删除项目
            PROJECT_MANAGE,     // 管理项目
            TASK_VIEW,          // 查看任务
            TASK_CREATE,        // 创建任务
            TASK_EDIT,          // 编辑任务
            TASK_DELETE,        // 删除任务
            TASK_ASSIGN,        // 分配任务给其他成员
            MEMBER_VIEW,        // 查看成员
            MEMBER_ADD,         // 添加成员
            MEMBER_REMOVE,      // 移除成员
            MEMBER_MANAGE       // 管理成员权限
        )
    }
    
    /**
     * 获取所有权限的描述信息
     */
    fun getPermissionDescriptions(): Map<String, String> {
        return mapOf(
            PROJECT_VIEW to "允许查看项目基本信息",
            PROJECT_EDIT to "允许修改项目基本信息",
            PROJECT_DELETE to "允许删除项目",
            PROJECT_MANAGE to "允许管理项目设置和配置",
            TASK_VIEW to "允许查看任务",
            TASK_CREATE to "允许创建新任务",
            TASK_EDIT to "允许编辑任务信息",
            TASK_DELETE to "允许删除任务",
            TASK_ASSIGN to "允许分配任务给其他成员",
            MEMBER_VIEW to "允许查看项目成员",
            MEMBER_ADD to "允许添加新项目成员",
            MEMBER_REMOVE to "允许移除项目成员",
            MEMBER_MANAGE to "允许管理成员角色和权限",
            PROJECT_ROLE_CREATE to "允许创建项目角色",
            PROJECT_ROLE_READ to "允许查看项目角色",
            PROJECT_ROLE_EDIT to "允许编辑项目角色",
            PROJECT_ROLE_DELETE to "允许删除项目角色",
            PROJECT_PRIORITY_VIEW to "允许查看项目优先级体系",
            PROJECT_STATUS_VIEW to "允许查看项目状态列表",
            PROJECT_TASK_STATS_VIEW to "允许查看项目任务统计",
            PROJECT_TASK_TREND_VIEW to "允许查看项目任务趋势"
        )
    }
}
