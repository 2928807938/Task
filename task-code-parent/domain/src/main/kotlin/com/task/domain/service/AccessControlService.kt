package com.task.domain.service

import com.task.domain.model.common.ComparisonOperator
import com.task.domain.model.common.fieldOf
import com.task.domain.model.project.ProjectMember
import com.task.domain.model.project.ProjectRolePermission
import com.task.domain.repository.*
import com.task.domain.constants.ProjectPermissions
import org.slf4j.LoggerFactory
import org.springframework.stereotype.Service
import reactor.core.publisher.Mono

/**
 * 访问控制服务
 * 负责处理复杂的权限验证逻辑，主要用于非入侵权限注解无法覆盖的特殊场景
 * 
 * 注意：大部分简单的项目权限检查已经由非入侵权限注解(@RequireProjectPermission等)处理
 * 此服务主要处理需要业务逻辑判断的复杂权限场景
 */
@Service
class AccessControlService(
    private val projectRepository: ProjectRepository,
    private val projectMemberRepository: ProjectMemberRepository,
    private val projectRolePermissionRepository: ProjectRolePermissionRepository,
    private val permissionRepository: PermissionRepository
) {
    private val log = LoggerFactory.getLogger(this::class.java)

    /**
     * 检查用户是否有特定的项目权限
     * 基于RBAC模型的核心权限检查方法
     * 
     * 此方法主要用于TaskApplicationService中的复杂权限逻辑
     * 大部分简单的权限检查应该使用@RequireProjectPermission注解
     *
     * @param userId 用户ID
     * @param projectId 项目ID
     * @param permissionCode 权限代码
     * @return 如果用户有权限返回true，否则返回false
     */
    fun hasProjectPermission(userId: Long, projectId: Long, permissionCode: String): Mono<Boolean> {
        log.debug("检查用户项目权限，用户ID={}，项目ID={}，权限={}", userId, projectId, permissionCode)
        
        // 首先检查是否是项目所有者（项目所有者拥有所有权限）
        return projectRepository.findById(projectId)
            .flatMap { project ->
                if (project.creatorId == userId) {
                    log.debug("用户是项目所有者，拥有所有权限，用户ID={}，项目ID={}", userId, projectId)
                    return@flatMap Mono.just(true)
                }
                
                // 检查用户在项目中的角色权限
                checkUserProjectRolePermission(userId, projectId, permissionCode)
            }
            .defaultIfEmpty(false)
    }
    
    /**
     * 检查用户在项目中的角色权限
     * 
     * @param userId 用户ID
     * @param projectId 项目ID
     * @param permissionCode 权限代码
     * @return 如果有权限返回true，否则返回false
     */
    private fun checkUserProjectRolePermission(userId: Long, projectId: Long, permissionCode: String): Mono<Boolean> {
        // 查找用户在项目中的成员记录
        return projectMemberRepository.findOne {
            fieldOf(ProjectMember::projectId, ComparisonOperator.EQUALS, projectId)
            fieldOf(ProjectMember::userId, ComparisonOperator.EQUALS, userId)
        }
        .flatMap { projectMember ->
            // 获取用户角色的权限
            projectRolePermissionRepository.list {
                fieldOf(ProjectRolePermission::projectRoleId, ComparisonOperator.EQUALS, projectMember.roleId)
            }
            .flatMap { rolePermission ->
                permissionRepository.findById(rolePermission.permissionId)
            }
            .any { permission -> permission.code == permissionCode }
        }
        .defaultIfEmpty(false)
    }
}