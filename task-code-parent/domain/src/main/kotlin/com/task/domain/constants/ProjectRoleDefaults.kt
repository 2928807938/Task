package com.task.domain.constants

/**
 * 项目角色默认配置
 * 定义不同类型项目成员的默认权限
 * 用于简化RBAC权限分配过程
 */
object ProjectRoleDefaults {
    
    /**
     * 项目管理员默认权限
     * 拥有除项目删除外的所有权限
     */
    fun getManagerPermissions(): List<String> {
        return listOf(
            ProjectPermissions.PROJECT_VIEW,
            ProjectPermissions.PROJECT_EDIT,
            ProjectPermissions.PROJECT_MANAGE,
            ProjectPermissions.TASK_VIEW,
            ProjectPermissions.TASK_CREATE,
            ProjectPermissions.TASK_EDIT,
            ProjectPermissions.TASK_DELETE,
            ProjectPermissions.TASK_ASSIGN,
            ProjectPermissions.MEMBER_VIEW,
            ProjectPermissions.MEMBER_ADD,
            ProjectPermissions.MEMBER_REMOVE,
            ProjectPermissions.MEMBER_MANAGE,
            ProjectPermissions.PROJECT_ROLE_CREATE,
            ProjectPermissions.PROJECT_ROLE_READ,
            ProjectPermissions.PROJECT_ROLE_EDIT,
            ProjectPermissions.PROJECT_ROLE_DELETE,
            ProjectPermissions.PROJECT_PRIORITY_VIEW,
            ProjectPermissions.PROJECT_STATUS_VIEW,
            ProjectPermissions.PROJECT_TASK_STATS_VIEW,
            ProjectPermissions.PROJECT_TASK_TREND_VIEW
        )
    }
    
    /**
     * 项目开发者默认权限
     * 可以查看项目、创建和编辑任务，但不能管理成员
     */
    fun getDeveloperPermissions(): List<String> {
        return listOf(
            ProjectPermissions.PROJECT_VIEW,
            ProjectPermissions.TASK_VIEW,
            ProjectPermissions.TASK_CREATE,
            ProjectPermissions.TASK_EDIT,
            ProjectPermissions.MEMBER_VIEW,
            ProjectPermissions.PROJECT_PRIORITY_VIEW,
            ProjectPermissions.PROJECT_STATUS_VIEW,
            ProjectPermissions.PROJECT_TASK_STATS_VIEW,
            ProjectPermissions.PROJECT_TASK_TREND_VIEW
        )
    }
    
    /**
     * 项目观察者默认权限
     * 只能查看项目和任务信息，不能进行修改操作
     */
    fun getViewerPermissions(): List<String> {
        return listOf(
            ProjectPermissions.PROJECT_VIEW,
            ProjectPermissions.TASK_VIEW,
            ProjectPermissions.MEMBER_VIEW,
            ProjectPermissions.PROJECT_PRIORITY_VIEW,
            ProjectPermissions.PROJECT_STATUS_VIEW,
            ProjectPermissions.PROJECT_TASK_STATS_VIEW,
            ProjectPermissions.PROJECT_TASK_TREND_VIEW
        )
    }
    
    /**
     * 项目测试员默认权限
     * 可以查看和编辑任务，但不能创建或删除任务
     */
    fun getTesterPermissions(): List<String> {
        return listOf(
            ProjectPermissions.PROJECT_VIEW,
            ProjectPermissions.TASK_VIEW,
            ProjectPermissions.TASK_EDIT,
            ProjectPermissions.MEMBER_VIEW,
            ProjectPermissions.PROJECT_PRIORITY_VIEW,
            ProjectPermissions.PROJECT_STATUS_VIEW,
            ProjectPermissions.PROJECT_TASK_STATS_VIEW,
            ProjectPermissions.PROJECT_TASK_TREND_VIEW
        )
    }
    
    /**
     * 根据角色代码获取对应的默认权限
     * 
     * @param roleCode 角色代码
     * @return 权限列表
     */
    fun getPermissionsByRoleCode(roleCode: String): List<String> {
        return when (roleCode.lowercase()) {
            "owner" -> ProjectPermissions.getOwnerPermissions()
            "manager", "admin" -> getManagerPermissions()
            "developer", "dev" -> getDeveloperPermissions()
            "viewer", "guest" -> getViewerPermissions()
            "tester", "qa" -> getTesterPermissions()
            else -> getViewerPermissions() // 默认给予观察者权限
        }
    }
    
    /**
     * 获取所有预定义角色
     */
    fun getPredefinedRoles(): Map<String, RoleDefinition> {
        return mapOf(
            "owner" to RoleDefinition(
                name = "项目所有者",
                code = "owner",
                description = "项目创建者，拥有所有权限",
                permissions = ProjectPermissions.getOwnerPermissions(),
                isSystem = true,
                sortOrder = 1
            ),
            "manager" to RoleDefinition(
                name = "项目管理员",
                code = "manager",
                description = "负责项目管理，拥有除删除项目外的所有权限",
                permissions = getManagerPermissions(),
                isSystem = true,
                sortOrder = 2
            ),
            "developer" to RoleDefinition(
                name = "开发者",
                code = "developer",
                description = "项目开发人员，可以创建和编辑任务",
                permissions = getDeveloperPermissions(),
                isSystem = true,
                sortOrder = 3
            ),
            "tester" to RoleDefinition(
                name = "测试员",
                code = "tester",
                description = "负责项目测试，可以查看和编辑任务",
                permissions = getTesterPermissions(),
                isSystem = true,
                sortOrder = 4
            ),
            "viewer" to RoleDefinition(
                name = "观察者",
                code = "viewer",
                description = "只能查看项目信息，不能进行修改操作",
                permissions = getViewerPermissions(),
                isSystem = true,
                sortOrder = 5
            )
        )
    }
    
    /**
     * 角色定义数据类
     */
    data class RoleDefinition(
        val name: String,
        val code: String,
        val description: String,
        val permissions: List<String>,
        val isSystem: Boolean = true,
        val sortOrder: Int = 0
    )
} 