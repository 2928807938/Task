package com.task.domain.service

import com.task.domain.constants.ProjectPermissions
import com.task.domain.event.project.ProjectDeletedEvent
import com.task.domain.event.project.ProjectMemberAddedEvent
import com.task.domain.event.project.ProjectMemberRemovedEvent
import com.task.domain.event.project.ProjectStateChangedEvent
import com.task.domain.exception.TasksNeedReassignmentException
import com.task.domain.model.attachment.EntityTypeEnum
import com.task.domain.model.common.*
import com.task.domain.model.permission.Permission
import com.task.domain.model.project.*
import com.task.domain.model.project.command.CreateProjectCommand
import com.task.domain.model.project.command.UpdateProjectCommand
import com.task.domain.model.project.config.CustomStatusItem
import com.task.domain.model.project.config.ProjectConfig
import com.task.domain.model.project.config.StatusTransitionRule
import com.task.domain.model.project.state.ProjectStateContext
import com.task.domain.model.project.state.ProjectStateMachineFactory
import com.task.domain.model.task.Task
import com.task.domain.model.user.User
import com.task.domain.repository.*
import com.task.domain.state.DynamicStateMachine
import com.task.domain.transaction.ReactiveTransactionalOutbox
import com.task.domain.transaction.ReactiveTransactionalOutboxContext.registerEvent
import org.slf4j.LoggerFactory
import org.springframework.stereotype.Service
import reactor.core.publisher.Flux
import reactor.core.publisher.Mono
import java.time.OffsetDateTime

/**
 * 项目服务
 * 负责处理与项目、项目成员、项目角色相关的领域逻辑
 */
@Service
class ProjectService(
    private val projectRepository: ProjectRepository,
    private val projectMemberRepository: ProjectMemberRepository,
    private val projectRoleRepository: ProjectRoleRepository,
    private val userRepository: UserRepository,
    private val teamRepository: TeamRepository,
    private val permissionRepository: PermissionRepository,
    private val projectRolePermissionRepository: ProjectRolePermissionRepository,
    private val projectStatusRepository: ProjectStatusRepository,
    private val projectStatusTransitionRepository: ProjectStatusTransitionRepository,
    private val projectStatusMappingRepository: ProjectStatusMappingRepository,
    private val projectStateMachineFactory: ProjectStateMachineFactory,
    private val taskService: TaskService,
    private val projectArchiveRecordRepository: ProjectArchiveRecordRepository,
    private val attachmentService: AttachmentService,
    private val taskRepository: TaskRepository,
    private val accessControlService: AccessControlService,
) {

    val log = LoggerFactory.getLogger(this::class.java)

    /**
     * 获取项目可用的状态列表
     * 返回项目关联的所有状态，按displayOrder排序
     * 
     * @param projectId 项目ID
     * @return 项目状态列表的Flux流
     */
    fun getAllProjectStatuses(projectId: Long): Flux<ProjectStatus> {
        log.info("获取项目状态列表，项目ID={}", projectId)
        
        // 首先验证项目的存在性（权限检查）
        return projectRepository.findById(projectId)
            .switchIfEmpty(Mono.error(IllegalArgumentException("项目不存在，ID: $projectId")))
            .flatMapMany { project ->
                // 查询项目关联的状态映射关系
                projectStatusMappingRepository.list {
                    fieldOf(ProjectStatusMapping::projectId, ComparisonOperator.EQUALS, projectId)
                }
                .collectList()
                .flatMapMany { mappings ->
                    // 提取所有状态ID
                    val statusIds = mappings.map { it.statusId }
                    log.debug("项目ID={}关联了{}\u4e2a状态", projectId, statusIds.size)
                    
                    if (statusIds.isEmpty()) {
                        // 如果没有关联的状态，返回空列表
                        log.debug("项目ID={}没有关联任何状态，返回空列表", projectId)
                        Flux.empty()
                    } else {
                        // 根据状态ID列表查询对应的状态信息
                        projectStatusRepository.list {
                            // 条件：状态ID在映射关系中存在
                            fieldOf(ProjectStatus::id, ComparisonOperator.IN, statusIds)
                            // 排序：按displayOrder升序排序
                            orderBy(asc(ProjectStatus::displayOrder))
                        }
                        // 直接返回状态列表，不做额外处理
                    }
                }
                .doOnComplete { log.debug("成功获取项目状态列表，项目ID={}", projectId) }
            }
            .doOnError { error -> log.error("获取项目状态列表失败，项目ID={}: {}", projectId, error.message, error) }
    }

    /**
     * 根据ID查找项目
     *
     * @param id 项目ID
     * @return 项目
     */
    fun findById(id: Long): Mono<Project> {
        return projectRepository.findById(id)
    }

    /**
     * 创建项目
     *
     * @param command 创建项目命令
     * @return 创建的项目
     */
    @ReactiveTransactionalOutbox
    fun createProject(command: CreateProjectCommand): Mono<Project> {
        log.info("开始创建项目: {}", command.name)

        // 验证项目名称
        if (command.name.isBlank()) {
            return Mono.error(IllegalArgumentException("项目名称不能为空"))
        }

        // 创建项目实体
        val project = Project(
            name = command.name,
            description = command.description,
            teamId = command.teamId,
            creatorId = command.ownerId,
            version = 1
        )

        // 初始化权限记录
        val initPermissionsMono = ensurePermissionsExist()
            .doOnSuccess { 
                log.info("权限记录检查完成") 
            }
            .doOnError { error ->
                log.error("初始化权限记录失败: {}", error.message, error)
            }

        // 保存项目
        return initPermissionsMono
            .then(projectRepository.save(project))
            .doOnSuccess { savedProject ->
                log.info("项目创建成功: ID={}, 名称={}", savedProject.id, savedProject.name)
            }
            .doOnError { error ->
                log.error("项目创建失败: {}", error.message, error)
            }
            .flatMap { savedProject ->
                // 创建项目后先添加所有者为成员
                val addOwnerMono = addProjectOwnerAsMember(savedProject.id, command.ownerId)
                
                // 初始化项目优先级体系
                val initPriorityMono = taskService.initProjectPrioritySystem(savedProject.id!!, command.config)
                    .doOnSuccess { log.info("项目优先级体系初始化成功: 项目ID={}", savedProject.id) }
                    .doOnError { error -> log.error("项目优先级体系初始化失败: 项目ID={}, 错误: {}", savedProject.id, error.message, error) }
                    .onErrorResume { Mono.empty() } // 即使初始化优先级失败也继续创建项目
                
                // 初始化项目状态体系
                val initStateMono = initProjectStateSystem(savedProject.id, command.config)
                    .doOnSuccess { log.info("项目状态体系初始化成功: 项目ID={}", savedProject.id) }
                    .doOnError { error -> log.error("项目状态体系初始化失败: 项目ID={}, 错误: {}", savedProject.id, error.message, error) }
                    .onErrorResume { Mono.empty() } // 即使初始化状态体系失败也继续创建项目
                
                // 并行执行三个任务，当所有任务完成后返回项目
                Mono.`when`(addOwnerMono, initPriorityMono, initStateMono)
                    .then(Mono.just(savedProject))
            }    
    }

    /**
     * 将项目所有者添加为项目成员
     * 增强版本，使用重试机制和强化错误处理
     *
     * @param projectId 项目ID
     * @param userId 用户ID
     * @return 完成信号
     */
    private fun addProjectOwnerAsMember(projectId: Long?, userId: Long): Mono<Void> {
        if (projectId == null) {
            log.error("无法添加项目所有者为成员：项目ID为空")
            return Mono.error(IllegalArgumentException("项目ID不能为空"))
        }
        
        log.info("重要操作: 正在将用户ID={}添加为项目ID={}的所有者成员", userId, projectId)
        
        // 查找项目所有者角色
        return projectRoleRepository.findOne {
            fieldOf(ProjectRole::name, ComparisonOperator.EQUALS, "所有者")
            fieldOf(ProjectRole::projectId, ComparisonOperator.EQUALS, projectId)
        }
        .switchIfEmpty(
            // 如果没有找到所有者角色，则创建一个新的角色
            Mono.defer {
                log.info("为项目ID={}创建所有者角色", projectId)
                
                val ownerRole = ProjectRole(
                    id = 0, // 新建记录，ID由数据库生成
                    name = "所有者",
                    projectId = projectId,
                    description = "项目所有者，拥有项目的所有权限",
                    isSystem = true,
                    createdAt = OffsetDateTime.now(),
                    version = 1
                )
                
                projectRoleRepository.save(ownerRole)
                    .doOnSuccess { savedRole ->
                        log.info("成功创建所有者角色，角色ID={}", savedRole.id)
                    }
                    .doOnError { error ->
                        log.error("创建所有者角色失败，将重试: {}", error.message, error)
                    }
                    // 如果创建角色失败，尝试重试
                    .retry(3)
            }
        )
        .flatMap { role ->
            // 创建项目成员对象
            val projectMember = ProjectMember(
                id = 0, // 新建记录，ID由数据库生成
                projectId = projectId,
                userId = userId,
                roleId = role.id,
                joinedAt = OffsetDateTime.now(),
                version = 1
            )
            
            // 确保为所有者角色分配权限
            val assignRolePermissionsMono = assignOwnerRolePermissions(projectId, role.id)
                .doOnSuccess { 
                    log.info("成功为项目ID={}的所有者角色分配权限", projectId) 
                }
                .doOnError { error ->
                    log.error("为所有者角色分配权限失败，将重试: {}", error.message, error)
                }
                .retry(3) // 权限分配重试三次
            
            // 检查用户是否已经是项目成员（未删除的）
            projectMemberRepository.exists {
                fieldOf(ProjectMember::projectId, ComparisonOperator.EQUALS, projectId)
                fieldOf(ProjectMember::userId, ComparisonOperator.EQUALS, userId)
                fieldOf(ProjectMember::deleted, ComparisonOperator.EQUALS, 0)
            }
            .flatMap { exists ->
                if (exists) {
                    log.info("用户ID={}已经是项目ID={}的成员，只需更新权限", userId, projectId)
                    // 即使用户已存在，也要确保其权限正确
                    assignRolePermissionsMono
                        .then(Mono.empty<Void>())
                        .onErrorResume { e ->
                            log.error("更新项目所有者权限失败: {}", e.message, e)
                            Mono.empty()
                        }
                } else {
                    log.info("用户ID={}不是项目ID={}的成员，添加为所有者成员", userId, projectId)
                    // 保存项目成员
                    projectMemberRepository.save(projectMember)
                        .doOnSuccess { savedMember ->
                            log.info("成功将用户ID={}添加为项目ID={}的所有者成员，成员ID={}", 
                                userId, projectId, savedMember.id)
                        }
                        .doOnError { error ->
                            log.error("添加项目所有者成员失败，将重试: {}", error.message, error)
                        }
                        // 如果保存失败，重试三次
                        .retry(3)
                        // 在保存项目成员后执行权限分配
                        .then(assignRolePermissionsMono)
                        .then()
                        .onErrorResume { e ->
                            log.error("创建项目成员或分配权限失败，将重试一次整个流程: {}", e.message, e)
                            // 整个流程重试一次
                            projectMemberRepository.save(projectMember)
                                .then(assignRolePermissionsMono)
                                .then()
                                .onErrorResume { finalError ->
                                    log.error("再次尝试添加项目所有者成员失败，这可能导致数据隔离问题: {}", finalError.message, finalError)
                                    Mono.empty()
                                }
                        }
                }
            }
        }
        // 添加最终的错误处理，避免整个流程因为异常而失败
        .onErrorResume { e ->
            log.error("添加项目所有者为成员过程中发生异常: {}", e.message, e)
            // 即使出错也不应阻止项目创建，但要记录详细日志
            Mono.empty()
        }
    }

    /**
     * 为普通成员角色分配基础权限
     * 普通成员将获得查看项目、查看任务、查看成员等基础权限
     *
     * @param projectId 项目ID
     * @param roleId 角色ID
     * @return 完成信号
     */
    private fun assignMemberRolePermissions(projectId: Long, roleId: Long): Mono<Void> {
        log.info("开始为项目ID={}的普通成员角色ID={}分配权限", projectId, roleId)
        
        // 1. 获取普通成员的基础权限代码
        val permissionCodes = listOf(
            ProjectPermissions.PROJECT_VIEW,       // 查看项目
            ProjectPermissions.TASK_VIEW,          // 查看任务
            ProjectPermissions.TASK_CREATE,        // 创建任务
            ProjectPermissions.TASK_EDIT,          // 编辑任务（自己创建的）
            ProjectPermissions.MEMBER_VIEW,        // 查看成员
            ProjectPermissions.PROJECT_PRIORITY_VIEW, // 查看优先级体系
            ProjectPermissions.PROJECT_STATUS_VIEW,   // 查看状态列表
            ProjectPermissions.PROJECT_TASK_STATS_VIEW, // 查看任务统计
            ProjectPermissions.PROJECT_TASK_TREND_VIEW  // 查看任务趋势
        )
        
        // 2. 查询这些权限代码对应的权限记录
        return permissionRepository.list {
            fieldOf(Permission::code, ComparisonOperator.IN, permissionCodes)
        }
        .collectList()
        .flatMap { permissions ->
            if (permissions.isEmpty()) {
                log.warn("没有找到任何权限记录，无法为普通成员角色分配权限")
                return@flatMap Mono.empty<Void>()
            }
            
            log.info("为项目ID={}的普通成员角色分配{}\u9879权限", projectId, permissions.size)
            
            // 3. 创建角色-权限关联
            Flux.fromIterable(permissions)
                .flatMap { permission ->
                    // 先检查是否已存在该角色-权限关联
                    projectRolePermissionRepository.exists {
                        fieldOf(ProjectRolePermission::projectRoleId, ComparisonOperator.EQUALS, roleId)
                        fieldOf(ProjectRolePermission::permissionId, ComparisonOperator.EQUALS, permission.id)
                    }
                    .flatMap { exists ->
                        if (exists) {
                            log.debug("角色ID={}已经具有权限{}，跳过", roleId, permission.code)
                            Mono.empty()
                        } else {
                            // 创建新的角色-权限关联
                            val rolePermission = ProjectRolePermission(
                                id = 0, // 新建记录，ID由数据库生成
                                projectRoleId = roleId,
                                permissionId = permission.id,
                                createdAt = OffsetDateTime.now(),
                                version = 1
                            )
                            
                            projectRolePermissionRepository.save(rolePermission)
                                .doOnSuccess { _ ->
                                    log.debug("成功为普通成员角色ID={}分配权限{}", roleId, permission.code)
                                }
                        }
                    }
                }
                .collectList()
                .then()
        }
        .doOnSuccess {
            log.info("成功为项目ID={}的普通成员角色分配权限", projectId)
        }
        .doOnError { error ->
            log.error("为普通成员角色分配权限失败：{}", error.message, error)
        }
    }

    /**
     * 为所有者角色分配权限
     * 所有者将获得所有项目相关权限，包括查看、编辑、删除、管理成员等
     *
     * @param projectId 项目ID
     * @param roleId 角色ID
     * @return 完成信号
     */
    private fun assignOwnerRolePermissions(projectId: Long, roleId: Long): Mono<Void> {
        log.info("开始为项目ID={}的所有者角色ID={}分配权限", projectId, roleId)
        
        // 1. 获取项目相关的所有权限代码（使用统一的权限常量）
        val permissionCodes = ProjectPermissions.getOwnerPermissions()
        
        // 2. 查询这些权限代码对应的权限记录
        return permissionRepository.list {
            fieldOf(Permission::code, ComparisonOperator.IN, permissionCodes)
        }
        .collectList()
        .flatMap { permissions ->
            if (permissions.isEmpty()) {
                log.warn("没有找到任何权限记录，无法为所有者角色分配权限")
                return@flatMap Mono.empty<Void>()
            }
            
            log.info("为项目ID={}的所有者角色分配{}\u9879权限", projectId, permissions.size)
            
            // 3. 创建角色-权限关联
            Flux.fromIterable(permissions)
                .flatMap { permission ->
                    // 先检查是否已存在该角色-权限关联
                    projectRolePermissionRepository.exists {
                        fieldOf(ProjectRolePermission::projectRoleId, ComparisonOperator.EQUALS, roleId)
                        fieldOf(ProjectRolePermission::permissionId, ComparisonOperator.EQUALS, permission.id)
                    }
                    .flatMap { exists ->
                        if (exists) {
                            log.debug("角色ID={}已经具有权限{}，跳过", roleId, permission.code)
                            Mono.empty()
                        } else {
                            // 创建新的角色-权限关联
                            val rolePermission = ProjectRolePermission(
                                id = 0, // 新建记录，ID由数据库生成
                                projectRoleId = roleId,
                                permissionId = permission.id,
                                createdAt = OffsetDateTime.now(),
                                version = 1
                            )
                            
                            projectRolePermissionRepository.save(rolePermission)
                                .doOnSuccess { _ ->
                                    log.debug("成功为角色ID={}分配权限{}", roleId, permission.code)
                                }
                        }
                    }
                }
                .collectList()
                .then()
        }
        .doOnSuccess {
            log.info("成功为项目ID={}的所有者角色分配权限", projectId)
        }
        .doOnError { error ->
            log.error("为所有者角色分配权限失败：{}", error.message, error)
        }
    }

    /**
     * 根据权限代码获取权限名称
     */
    private fun getPermissionName(code: String): String {
        return when (code) {
            ProjectPermissions.PROJECT_VIEW -> "查看项目"
            ProjectPermissions.PROJECT_EDIT -> "编辑项目"
            ProjectPermissions.PROJECT_DELETE -> "删除项目"
            ProjectPermissions.PROJECT_MANAGE -> "管理项目"
            ProjectPermissions.TASK_VIEW -> "查看任务"
            ProjectPermissions.TASK_CREATE -> "创建任务"
            ProjectPermissions.TASK_EDIT -> "编辑任务"
            ProjectPermissions.TASK_DELETE -> "删除任务"
            ProjectPermissions.TASK_ASSIGN -> "分配任务"
            ProjectPermissions.MEMBER_VIEW -> "查看成员"
            ProjectPermissions.MEMBER_ADD -> "添加成员"
            ProjectPermissions.MEMBER_REMOVE -> "移除成员"
            ProjectPermissions.MEMBER_MANAGE -> "管理成员权限"
            ProjectPermissions.PROJECT_ROLE_CREATE -> "创建项目角色"
            ProjectPermissions.PROJECT_ROLE_READ -> "查看项目角色"
            ProjectPermissions.PROJECT_ROLE_EDIT -> "编辑项目角色"
            ProjectPermissions.PROJECT_ROLE_DELETE -> "删除项目角色"
            ProjectPermissions.PROJECT_PRIORITY_VIEW -> "查看优先级体系"
            ProjectPermissions.PROJECT_STATUS_VIEW -> "查看状态列表"
            ProjectPermissions.PROJECT_TASK_STATS_VIEW -> "查看任务统计"
            ProjectPermissions.PROJECT_TASK_TREND_VIEW -> "查看任务趋势"
            else -> code.split(":").last().replaceFirstChar { it.uppercase() }
        }
    }

    /**
     * 确保系统中存在必要的权限记录
     * 该方法检查并创建支持RBAC权限模型的基本权限记录
     * 
     * @return 完成信号
     */
    private fun ensurePermissionsExist(): Mono<Void> {
        log.info("检查并初始化系统权限记录")
        
        // 获取权限描述信息
        val permissionDescriptions = ProjectPermissions.getPermissionDescriptions()
        
        // 根据权限常量动态生成所需的权限数据
        val requiredPermissions = ProjectPermissions.getOwnerPermissions().map { code ->
            Permission(
                id = 0, // 新记录ID由数据库生成
                name = getPermissionName(code),
                code = code,
                description = permissionDescriptions[code],
                createdAt = OffsetDateTime.now(),
                version = 1
            )
        }
        
        // 逐个检查并创建权限
        return Flux.fromIterable(requiredPermissions)
            .flatMap { permission ->
                // 检查权限是否存在
                permissionRepository.exists {
                    fieldOf(Permission::code, ComparisonOperator.EQUALS, permission.code)
                }
                .flatMap { exists ->
                    if (exists) {
                        // 已存在，跳过
                        log.debug("权限{}已存在，跳过创建", permission.code)
                        Mono.empty<Permission>()
                    } else {
                        // 不存在，创建
                        log.info("创建权限记录: {}", permission.code)
                        permissionRepository.save(permission)
                            .doOnSuccess { saved ->
                                log.info("成功创建权限记录: {}, ID={}", saved.code, saved.id)
                            }
                    }
                }
            }
            .collectList()
            .then()
    }

    /**
     * 查询用户作为成员的项目列表
     *
     * @param userId 用户ID
     * @param name 可选的项目名称，用于模糊搜索
     * @param pageNumber 页码，从0开始
     * @param size 每页大小
     * @param sortField 排序字段
     * @param sortOrder 排序顺序 (asc/desc)
     * @return 分页查询结果
     */
    fun findProjectsByMemberId(userId: Long, name: String?, pageNumber: Int, size: Int, sortField: String = "createdAt", sortOrder: String = "desc"): Mono<PageResult<Project>> {
        log.info("查询用户ID={}作为成员的项目列表，排序字段={}, 排序顺序={}", userId, sortField, sortOrder)
        val pageRequest = PageRequest(pageNumber, size)
        
        // 先查询用户所属的项目成员记录，过滤掉已删除的成员
        return projectMemberRepository.list {
            fieldOf(ProjectMember::userId, ComparisonOperator.EQUALS, userId)
            fieldOf(ProjectMember::deleted, ComparisonOperator.EQUALS, 0) // 只查询未删除的成员
        }
            .map { it.projectId }
            .collectList()
            .flatMap { projectIds ->
                if (projectIds.isEmpty()) {
                    return@flatMap Mono.just(PageResult(
                        items = emptyList(),
                        total = 0,
                        page = pageNumber,
                        size = size
                    ))
                }
                
                log.info("用户ID={}是{}个项目的成员", userId, projectIds.size)
                
                // 查询这些项目的详细信息
                projectRepository.page(pageRequest) {
                    // 添加项目ID条件
                    fieldOf(Project::id, ComparisonOperator.IN, projectIds)
                    
                    // 如果提供了项目名称，添加模糊搜索条件
                    if (!name.isNullOrBlank()) {
                        fieldOf(Project::name, ComparisonOperator.LIKE, "%$name%")
                    }
                    
                    // 添加排序
                    if (sortOrder.equals("asc", ignoreCase = true)) {
                        orderBy(asc(sortField))
                    } else {
                        orderBy(desc(sortField))
                    }
                }
            }
    }

    /**
     * 计算项目成员数量
     *
     * @param projectId 项目ID
     * @return 成员数量
     */
    fun countProjectMembers(projectId: Long): Mono<Long> {
        log.trace("计算项目ID={}的成员数量", projectId)
        return projectMemberRepository.list {
            fieldOf(ProjectMember::projectId, ComparisonOperator.EQUALS, projectId)
            fieldOf(ProjectMember::deleted, ComparisonOperator.EQUALS, 0) // 只统计未删除的成员
        }
        .count()
        .doOnError { error ->
            log.error("查询项目成员数量失败，项目ID={}: {}", projectId, error.message, error)
        }
    }
    
    /**
     * 获取项目成员列表
     *
     * @param projectId 项目ID
     * @return 项目成员列表
     */
    fun getProjectMembers(projectId: Long): Flux<ProjectMember> {
        log.debug("获取项目ID={}的成员列表", projectId)
        return projectMemberRepository.list {
            fieldOf(ProjectMember::projectId, ComparisonOperator.EQUALS, projectId)
        }
        .doOnError { error ->
            log.error("获取项目成员列表失败，项目ID={}: {}", projectId, error.message, error)
        }
    }
    
    /**
     * 更新项目
     *
     * @param command 更新项目命令
     * @return 更新后的项目
     */
    fun updateProject(command: UpdateProjectCommand): Mono<Project> {
        log.info("开始更新项目: ID={}", command.id)

        // 先查询项目是否存在
        return projectRepository.findById(command.id)
            .switchIfEmpty(Mono.error(IllegalArgumentException("项目不存在：${command.id}")))
            .flatMap { existingProject ->
                // 创建更新后的项目对象，只更新非空字段
                val updatedProject = existingProject.copy(
                    name = command.name ?: existingProject.name,
                    description = command.description ?: existingProject.description,
                    // 更新时间为当前时间
                    updatedAt = OffsetDateTime.now()
                )

                // 保存更新后的项目
                projectRepository.update(updatedProject)
                    .doOnSuccess { savedProject ->
                        log.info("项目更新成功: ID={}, 名称={}", savedProject.id, savedProject.name)
                    }
                    .doOnError { error ->
                        log.error("项目更新失败: {}", error.message, error)
                    }
            }
    }


    @ReactiveTransactionalOutbox
    fun deleteById(id: Long, operatorId: Long): Mono<Void> {
        log.info("开始删除项目: ID={}, 操作者ID={}", id, operatorId)

        return findById(id)
            .switchIfEmpty(Mono.error(IllegalArgumentException("项目不存在：$id")))
            .flatMap { project ->
                log.debug("找到项目: ID={}, 名称={}", id, project.name)

                // 查询项目成员
                projectMemberRepository.list {
                    fieldOf(ProjectMember::projectId, ComparisonOperator.EQUALS, id)
                }
                .map { it.userId }
                .collectList()
                .doOnNext { memberIds ->
                    log.debug("项目成员数量: {}, 项目ID={}", memberIds.size, id)
                }
                .flatMap { memberIds ->
                    // 执行项目删除的所有步骤
                    executeProjectDeletion(id, project.name, operatorId, memberIds)
                }
            }
            .doOnSuccess { log.info("项目删除操作完成: ID={}", id) }
            .doOnError { e -> log.error("项目删除失败: ID={}, 错误={}", id, e.message, e) }
    }

    /**
     * 执行项目删除的所有子操作
     */
    private fun executeProjectDeletion(
        projectId: Long, 
        projectName: String, 
        operatorId: Long, 
        memberIds: List<Long>
    ): Mono<Void> {
        // 1. 删除项目相关的任务
        return taskService.deleteTasksByProjectId(projectId)
            .doOnSuccess { log.debug("删除项目任务成功: 项目ID={}", projectId) }
            
            // 2. 删除项目成员关系
            .then(deleteProjectMembersInternal(projectId))
            .doOnSuccess { log.debug("删除项目成员关系成功: 项目ID={}", projectId) }
            
            // 3. 删除项目角色
            .then(deleteProjectRolesInternal(projectId))
            .doOnSuccess { log.debug("删除项目角色成功: 项目ID={}", projectId) }
            
            // 4. 删除项目状态配置
            .then(deleteProjectStatusConfigInternal(projectId))
            .doOnSuccess { log.debug("删除项目状态配置成功: 项目ID={}", projectId) }
            
            // 5. 删除项目优先级配置
            .then(deleteProjectPriorityConfigInternal(projectId))
            .doOnSuccess { log.debug("删除项目优先级配置成功: 项目ID={}", projectId) }
            
            // 6. 删除项目归档记录
            .then(deleteProjectArchiveRecordsInternal(projectId))
            .doOnSuccess { log.debug("删除项目归档记录成功: 项目ID={}", projectId) }
            
            // 7. 删除项目附件
            .then(attachmentService.deleteAttachmentsByEntityTypeAndId(EntityTypeEnum.PROJECT, projectId))
            .doOnSuccess { log.debug("删除项目附件成功: 项目ID={}", projectId) }
            
            // 8. 删除项目本身
            .then(projectRepository.delete(projectId))
            .doOnSuccess { log.debug("删除项目成功: ID={}, 名称={}", projectId, projectName) }
            
            // 9. 注册项目删除事件（通知由事件监听器处理）
            .then(
                registerEvent(
                    ProjectDeletedEvent(
                        projectId = projectId,
                        projectName = projectName,
                        operatorId = operatorId,
                        memberIds = memberIds
                    )
                )
                .doOnSuccess { log.debug("项目删除事件注册成功: ID={}, 名称={}", projectId, projectName) }
                .then()
            )
    }

    private fun deleteProjectMembersInternal(projectId: Long): Mono<Void> {
        log.info("开始删除项目成员关系: 项目ID={}", projectId)
        
        return projectMemberRepository.list {
            fieldOf(ProjectMember::projectId, ComparisonOperator.EQUALS, projectId)
        }
        .map { it.id }
        .collectList()
        .flatMap { memberIds ->
            if (memberIds.isEmpty()) {
                log.info("项目没有成员关系需要删除: 项目ID={}", projectId)
                return@flatMap Mono.empty<Void>()
            }
            
            log.info("找到{}个项目成员关系需要删除: 项目ID={}", memberIds.size, projectId)
            projectMemberRepository.deleteBatch(memberIds)
        }
    }

    /**
     * 内部方法：删除项目角色
     * 仅在项目服务内部使用，不对外暴露
     */
    private fun deleteProjectRolesInternal(projectId: Long): Mono<Void> {
        log.info("开始删除项目角色: 项目ID={}", projectId)
        
        return projectRoleRepository.list {
            fieldOf(ProjectRole::projectId, ComparisonOperator.EQUALS, projectId)
        }
        .map { it.id }
        .collectList()
        .flatMap { roleIds ->
            if (roleIds.isEmpty()) {
                log.info("项目没有角色需要删除: 项目ID={}", projectId)
                return@flatMap Mono.empty<Void>()
            }
            
            log.info("找到{}个项目角色需要删除: 项目ID={}", roleIds.size, projectId)
            projectRoleRepository.deleteBatch(roleIds)
        }
    }

    /**
     * 添加项目成员
     *
     * @param projectId 项目ID
     * @param userId 要添加的用户ID
     * @param operatorId 执行操作的用户ID（用于权限检查）
     * @return 完成信号
     */
    @ReactiveTransactionalOutbox
    fun addProjectMember(projectId: Long, userId: Long, operatorId: Long): Mono<Void> {
        log.info("开始添加项目成员: 项目ID={}, 用户ID={}, 操作者ID={}", projectId, userId, operatorId)

        // 检查项目是否存在
        return projectRepository.findById(projectId)
            .switchIfEmpty(Mono.error(IllegalArgumentException("项目不存在：$projectId")))
            .flatMap { project ->
                // 检查操作者权限
                accessControlService.hasProjectPermission(operatorId, projectId, ProjectPermissions.MEMBER_MANAGE)
                    .flatMap { hasPermission ->
                        if (!hasPermission) {
                            return@flatMap Mono.error(IllegalArgumentException("没有权限添加项目成员"))
                        }

                        // 检查用户是否存在
                        userRepository.exists {
                            fieldOf(User::id, ComparisonOperator.EQUALS, userId)
                        }
                            .flatMap { userExists ->
                                if (!userExists) {
                                    return@flatMap Mono.error(IllegalArgumentException("用户不存在：$userId"))
                                }

                                // 检查用户是否已经是项目成员（未删除的）
                                projectMemberRepository.exists {
                                    fieldOf(ProjectMember::projectId, ComparisonOperator.EQUALS, projectId)
                                    fieldOf(ProjectMember::userId, ComparisonOperator.EQUALS, userId)
                                    fieldOf(ProjectMember::deleted, ComparisonOperator.EQUALS, 0)
                                }
                                    .flatMap { exists ->
                                        if (exists) {
                                            log.info("用户ID={}已经是项目ID={}的成员，跳过添加", userId, projectId)
                                            return@flatMap Mono.empty<Void>()
                                        }

                                        // 查找普通成员角色
                                        projectRoleRepository.findOne {
                                            fieldOf(ProjectRole::name, ComparisonOperator.EQUALS, "成员")
                                            fieldOf(ProjectRole::projectId, ComparisonOperator.EQUALS, projectId)
                                        }
                                            .switchIfEmpty(
                                                // 如果没有找到成员角色，则创建一个新的角色
                                                Mono.defer {
                                                    log.info("为项目ID={}创建成员角色", projectId)

                                                    val memberRole = ProjectRole(
                                                        id = 0, // 新建记录，ID由数据库生成
                                                        name = "成员",
                                                        projectId = projectId,
                                                        description = "项目普通成员",
                                                        createdAt = OffsetDateTime.now(),
                                                        version = 1
                                                    )

                                                    projectRoleRepository.save(memberRole)
                                                        .flatMap { savedRole ->
                                                            // 为新创建的成员角色分配基础权限
                                                            assignMemberRolePermissions(projectId, savedRole.id)
                                                                .thenReturn(savedRole)
                                                        }
                                                }
                                            )
                                            .flatMap { role ->
                                                // 创建项目成员对象
                                                val projectMember = ProjectMember(
                                                    id = 0, // 新建记录，ID由数据库生成
                                                    projectId = projectId,
                                                    userId = userId,
                                                    roleId = role.id,
                                                    joinedAt = OffsetDateTime.now(),
                                                    version = 1
                                                )

                                                // 保存项目成员
                                                projectMemberRepository.save(projectMember)
                                                    .doOnSuccess { savedMember ->
                                                        log.info("成功将用户ID={}添加为项目ID={}的成员，成员ID={}",
                                                            userId, projectId, savedMember.id)

                                                        // 注册项目成员添加事件
                                                        registerEvent(
                                                            ProjectMemberAddedEvent(
                                                                projectId = projectId,
                                                                userId = userId,
                                                                operatorId = operatorId
                                                            )
                                                        )
                                                    }
                                                    .doOnError { error ->
                                                        log.error("添加项目成员失败：{}", error.message, error)
                                                    }
                                                    .then() // 转换为 Mono<Void>
                                            }
                                    }
                            }
                    }
            }
            .doOnError { error ->
                when (error) {
                    is IllegalArgumentException -> log.error("添加项目成员参数错误: {}", error.message, error)
                    else -> log.error("添加项目成员失败: {}", error.message, error)
                }
            }
    }

    /**
     * 移除项目成员
     *
     * @param projectId 项目ID
     * @param userId 要移除的用户ID
     * @param operatorId 执行操作的用户ID（用于权限检查）
     * @return 完成信号
     */
    @ReactiveTransactionalOutbox
    fun removeProjectMember(projectId: Long, userId: Long, operatorId: Long): Mono<Void> {
        log.info("开始移除项目成员: 项目ID={}, 用户ID={}, 操作者ID={}", projectId, userId, operatorId)

        // 检查项目是否存在
        return projectRepository.findById(projectId)
            .switchIfEmpty(Mono.error(IllegalArgumentException("项目不存在：$projectId")))
            .flatMap { project ->
                // 检查操作者权限
                accessControlService.hasProjectPermission(operatorId, projectId, ProjectPermissions.MEMBER_MANAGE)
                    .flatMap { hasPermission ->
                        if (!hasPermission) {
                            return@flatMap Mono.error(IllegalArgumentException("没有权限移除项目成员"))
                        }
                        
                        // 检查是否尝试移除自己
                        if (userId == operatorId) {
                            return@flatMap Mono.error(IllegalArgumentException("不能移除自己"))
                        }

                        // 检查用户是否有未完成的任务
                        checkUncompletedTasks(projectId, userId).then(
                                                    // 查找项目成员记录（未删除的）
                        projectMemberRepository.findOne {
                            fieldOf(ProjectMember::projectId, ComparisonOperator.EQUALS, projectId)
                            fieldOf(ProjectMember::userId, ComparisonOperator.EQUALS, userId)
                            fieldOf(ProjectMember::deleted, ComparisonOperator.EQUALS, 0)
                        }
                            .flatMap { member ->
                                // 查询用户角色，检查是否为项目所有者
                                projectRoleRepository.findById(member.roleId)
                                    .flatMap { role ->
                                        if (role.isSystem) {
                                            log.warn("尝试移除项目ID={}的所有者，用户ID={}", projectId, userId)
                                            return@flatMap Mono.error(IllegalArgumentException("不能移除项目所有者"))
                                        }
                                        
                                        // 删除项目成员
                                        projectMemberRepository.delete(member.id)
                                            .doOnSuccess {
                                                log.info("成功移除项目ID={}的成员，用户ID={}", projectId, userId)

                                                // 注册项目成员移除事件
                                                registerEvent(
                                                    ProjectMemberRemovedEvent(
                                                        projectId = projectId,
                                                        userId = userId,
                                                        operatorId = operatorId
                                                    )
                                                )
                                            }
                                            .doOnError { error ->
                                                log.error("移除项目成员失败：{}", error.message, error)
                                            }
                                    }
                            }
                            .switchIfEmpty(
                                Mono.defer {
                                    log.info("用户ID={}不是项目ID={}的成员，无需移除", userId, projectId)
                                    Mono.empty<Void>()
                                }
                            )
                        )
                    }
            }
            .doOnError { error ->
                when (error) {
                    is TasksNeedReassignmentException -> log.info("移除项目成员需要先处理任务: {}", error.message)
                    is IllegalArgumentException -> log.error("移除项目成员参数错误: {}", error.message, error)
                    else -> log.error("移除项目成员失败: {}", error.message, error)
                }
            }
            .doOnError { error ->
                when (error) {
                    is IllegalArgumentException -> log.error("移除项目成员参数错误: {}", error.message, error)
                    else -> log.error("移除项目成员失败: {}", error.message, error)
                }
            }
    }

    /**
     * 检查用户是否有未完成的任务
     * 如果有未完成的任务，则抛出 TasksNeedReassignmentException 异常
     * 
     * @param projectId 项目ID
     * @param userId 用户ID
     * @return 完成信号
     */
    private fun checkUncompletedTasks(projectId: Long, userId: Long): Mono<Void> {
        // 首先获取项目的状态映射关系
        return projectStatusMappingRepository.list {
            fieldOf(ProjectStatusMapping::projectId, ComparisonOperator.EQUALS, projectId)
        }
        .map { it.statusId }
        .collectList()
        .flatMap { statusIds ->
            if (statusIds.isEmpty()) {
                log.warn("项目ID={}未配置任何状态", projectId)
                return@flatMap Mono.empty<Void>()
            }
            
            // 查询这些状态的信息
            projectStatusRepository.list {
                fieldOf(ProjectStatus::id, ComparisonOperator.IN, statusIds)
            }
            .collectList()
            .flatMap { statuses ->
                // 筛选出非终止状态（这些状态的任务表示未完成）
                val nonTerminalStatusIds = statuses
                    .filter { !it.isTerminal }
                    .map { it.id }
                
                if (nonTerminalStatusIds.isEmpty()) {
                    log.debug("项目ID={}没有非终止状态", projectId)
                    return@flatMap Mono.empty<Void>()
                }
                
                // 查询该用户在该项目中处于非终止状态的任务
                taskRepository.list {
                    fieldOf(Task::projectId, ComparisonOperator.EQUALS, projectId)
                    fieldOf(Task::assigneeId, ComparisonOperator.EQUALS, userId)
                    fieldOf(Task::statusId, ComparisonOperator.IN, nonTerminalStatusIds)
                }
                .collectList()
                .flatMap { tasks ->
                    if (tasks.isNotEmpty()) {
                        log.info("用户ID={}在项目ID={}中有{}个未完成的任务", 
                               userId, projectId, tasks.size)
                        return@flatMap Mono.error(TasksNeedReassignmentException(
                            "该成员还有${tasks.size}个未完成的任务，请先处理这些任务",
                            tasks
                        ))
                    }
                    Mono.empty<Void>()
                }
            }
        }
    }

    /**
     * 获取项目仪表板基础信息
     *
     * @param projectId 项目ID
     * @return 项目领域对象，包含基础信息
     */
    fun getProjectDashboardBasic(projectId: Long): Mono<Project> {
        log.info("获取项目仪表板基础信息，项目ID={}", projectId)

        // 查询项目基本信息
        return projectRepository.findById(projectId)
            .switchIfEmpty(Mono.error(IllegalArgumentException("项目不存在，ID: $projectId")))
            .flatMap { project ->
                // 加载创建者信息
                val creatorMono = userRepository.findById(project.creatorId)
                    .switchIfEmpty(Mono.defer {
                        log.warn("项目创建者不存在，ID: {}", project.creatorId)
                        Mono.empty()
                    })

                // 加载团队信息
                val teamMono = teamRepository.findById(project.teamId)
                    .switchIfEmpty(Mono.defer {
                        log.warn("团队不存在，ID: {}", project.teamId)
                        Mono.empty()
                    })

                // 安全处理间接数据
                val safeCreatorMono = creatorMono.onErrorResume { Mono.empty() }
                val safeTeamMono = teamMono.onErrorResume { Mono.empty() }
                
                // 只在有关联数据返回时才进行数据组合
                // 否则直接返回原始项目对象
                Mono.zip(
                    safeCreatorMono, 
                    safeTeamMono
                )
                .flatMap { tuple ->
                    // 复制项目并添加间接数据
                    Mono.just(project.copy(
                        creator = tuple.t1,
                        team = tuple.t2
                    ))
                }
                .switchIfEmpty(Mono.just(project)) // 确保始终返回项目对象
            }
            .doOnSuccess { project ->
                if (project != null) {
                    log.debug("成功获取项目仪表板基础信息，项目ID={}, 名称={}", project.id, project.name)
                } else {
                    log.warn("获取项目仪表板基础信息成功，但项目对象为null，项目ID={}", projectId)
                }
            }
            .doOnError { error ->
                log.error("获取项目仪表板基础信息失败，项目ID={}: {}", projectId, error.message, error)
            }
    }
    
    /**
     * 获取项目状态机
     *
     * @param projectId 项目ID
     * @return 项目状态机
     */
    fun getProjectStateMachine(projectId: Long): Mono<DynamicStateMachine<Long, String, ProjectStateContext>> {
        log.info("获取项目状态机，项目ID={}", projectId)
        return projectStateMachineFactory.getProjectStateMachine(projectId)
            .doOnSuccess { log.debug("成功获取项目状态机，项目ID={}", projectId) }
            .doOnError { error -> log.error("获取项目状态机失败，项目ID={}: {}", projectId, error.message, error) }
    }

    /**
     * 更新项目状态
     *
     * @param projectId 项目ID
     * @param newStatusId 新状态ID
     * @param oldStatusId 旧状态ID
     * @param context 状态转换上下文
     * @return 操作结果
     */
    private fun updateProjectStatus(projectId: Long, newStatusId: Long, oldStatusId: Long, context: ProjectStateContext): Mono<Void> {
        log.info("更新项目状态，项目ID={}，旧状态ID={}，新状态ID={}", projectId, oldStatusId, newStatusId)
        
        // 先查询项目是否存在
        return projectRepository.findById(projectId)
            .switchIfEmpty(Mono.error(IllegalArgumentException("项目不存在，ID: $projectId")))
            .flatMap { project ->
                // 查询项目状态映射
                projectStatusMappingRepository.list<ProjectStatusMapping> {
                    fieldOf(ProjectStatusMapping::projectId, ComparisonOperator.EQUALS, projectId)
                }
                .next()
                    .flatMap { mapping ->
                        // 更新现有映射
                        val updatedMapping = mapping.copy(
                            statusId = newStatusId,
                            updatedAt = OffsetDateTime.now(),
                            version = mapping.version + 1
                        )
                        
                        projectStatusMappingRepository.update(updatedMapping)
                    }
                    .switchIfEmpty(
                        // 如果没有映射，创建新的映射
                        Mono.defer {
                            val newMapping = ProjectStatusMapping(
                                projectId = projectId,
                                statusId = newStatusId,
                                createdAt = OffsetDateTime.now(),
                                version = 1
                            )
                            
                            projectStatusMappingRepository.save(newMapping)
                        }
                    )
                    .flatMap {
                        // 注册项目状态变更事件
                        registerEvent(
                            ProjectStateChangedEvent(
                                projectId = projectId,
                                oldStatusId = oldStatusId,
                                newStatusId = newStatusId,
                                operatorId = context.operatorId,
                                reason = context.reason
                            )
                        )
                        
                        Mono.empty<Void>()
                    }
            }
            .doOnSuccess { log.debug("项目状态更新成功，项目ID={}，旧状态ID={}，新状态ID={}", projectId, oldStatusId, newStatusId) }
            .doOnError { error -> log.error("项目状态更新失败，项目ID={}，旧状态ID={}，新状态ID={}: {}", projectId, oldStatusId, newStatusId, error.message, error) }
    }

    /**
     * 初始化项目状态体系
     * 根据配置创建项目的状态体系，支持三种类型：标准(standard)、扩展(extended)、自定义(custom)
     *
     * @param projectId 项目ID
     * @param config 项目配置对象
     * @return 初始化结果
     */
    fun initProjectStateSystem(projectId: Long, config: ProjectConfig): Mono<Void> {
        log.info("初始化项目状态体系，项目ID={}，状态体系类型={}", projectId, config.statusSystem)
        
        // 根据状态体系类型初始化
        val stateMono = when (config.statusSystem) {
            "standard" -> {
                log.debug("使用标准状态体系，项目ID={}", projectId)
                initStandardStateSystem(projectId)
            }
            "extended" -> {
                log.debug("使用扩展状态体系，项目ID={}", projectId)
                initExtendedStateSystem(projectId)
            }
            "custom" -> {
                log.debug("使用自定义状态体系，项目ID={}，自定义项数量={}", projectId, config.customStatusItems.size)
                initCustomStateSystem(projectId, config.customStatusItems, config.customStatusTransitions)
            }
            else -> {
                log.warn("未知的状态体系类型: {}，项目ID={}，默认使用标准状态体系", config.statusSystem, projectId)
                initStandardStateSystem(projectId)
            }
        }
        
        // 初始化完成后，创建状态映射
        return stateMono.flatMap { statuses ->
            if (statuses.isEmpty()) {
                log.error("未能初始化任何状态，项目ID={}", projectId)
                return@flatMap Mono.empty<Void>()
            }
            
            // 查找默认状态
            val defaultStatus = statuses.find { it.isDefault } ?: statuses.first()
            log.info("项目初始化了{}\u4e2a状态，默认状态为{}，项目ID={}", 
                    statuses.size, defaultStatus.name, projectId)
            
            // 为所有状态创建映射
            val now = OffsetDateTime.now()
            
            // 为每个状态创建映射
            Flux.fromIterable(statuses)
                .flatMap { status ->
                    val mapping = ProjectStatusMapping(
                        projectId = projectId,
                        statusId = status.id,
                        createdAt = now,
                        version = 1
                    )
                    
                    projectStatusMappingRepository.save(mapping)
                        .doOnSuccess { log.info("项目状态映射创建成功，项目ID={}，状态ID={}，状态名称={}", 
                                projectId, status.id, status.name) }
                        .doOnError { error -> log.error("项目状态映射创建失败，项目ID={}，状态ID={}，状态名称={}，错误：{}", 
                                projectId, status.id, status.name, error.message, error) }
                }
                .collectList()
                .doOnSuccess { savedMappings -> 
                    log.info("所有项目状态映射创建完成，项目ID={}，成功创建映射数量={}", 
                            projectId, savedMappings.size) 
                }
                .doOnError { error -> 
                    log.error("项目状态映射创建过程出错，项目ID={}，错误：{}", 
                            projectId, error.message, error) 
                }
                .then(Mono.empty<Void>())
        }
    }

    /**
     * 初始化标准状态体系
     * 创建筹划中(#9C27B0)、进行中(#4CAF50)、已暂停(#FFC107)、已完成(#2196F3)、已取消(#FF9800)五个状态
     *
     * @param projectId 项目ID
     * @return 创建的状态列表
     */
    private fun initStandardStateSystem(projectId: Long): Mono<List<ProjectStatus>> {
        log.info("初始化标准状态体系，项目ID={}", projectId)

        val now = OffsetDateTime.now()
        val statuses = listOf(
            ProjectStatus(
                id = 0, // 会由数据库自动生成
                name = "筹划中",
                color = "#9C27B0",
                description = "项目正在筹划阶段",
                isDefault = true,
                isTerminal = false,
                displayOrder = 1,
                createdAt = now,
                updatedAt = now,
                version = 1
            ),
            ProjectStatus(
                id = 0, // 会由数据库自动生成
                name = "进行中",
                color = "#4CAF50",
                description = "项目正在进行中",
                isDefault = false,
                isTerminal = false,
                displayOrder = 2,
                createdAt = now,
                updatedAt = now,
                version = 1
            ),
            ProjectStatus(
                id = 0, // 会由数据库自动生成
                name = "已暂停",
                color = "#FFC107",
                description = "项目已暂停",
                isDefault = false,
                isTerminal = false,
                displayOrder = 3,
                createdAt = now,
                updatedAt = now,
                version = 1
            ),
            ProjectStatus(
                id = 0, // 会由数据库自动生成
                name = "已完成",
                color = "#2196F3",
                description = "项目已完成",
                isDefault = false,
                isTerminal = true,
                displayOrder = 4,
                createdAt = now,
                updatedAt = now,
                version = 1
            ),
            ProjectStatus(
                id = 0, // 会由数据库自动生成
                name = "已取消",
                color = "#FF9800",
                description = "项目已取消",
                isDefault = false,
                isTerminal = true,
                displayOrder = 5,
                createdAt = now,
                updatedAt = now,
                version = 1
            )
        )

        return saveStatuses(statuses)
            .flatMap { savedStatuses ->
                // 根据保存后的状态ID获取各状态
                val planningStatus = savedStatuses.find { it.name == "筹划中" }!!
                val inProgressStatus = savedStatuses.find { it.name == "进行中" }!!
                val pausedStatus = savedStatuses.find { it.name == "已暂停" }!!
                val completedStatus = savedStatuses.find { it.name == "已完成" }!!
                val cancelledStatus = savedStatuses.find { it.name == "已取消" }!!
                
                // 创建状态转换规则
                val transitions = mutableListOf<ProjectStatusTransition>()
                
                // 从筹划中 -> 进行中，已暂停，已取消
                transitions.add(createTransition(projectId, planningStatus.id, inProgressStatus.id, "筹划中", "进行中", 1, now))
                transitions.add(createTransition(projectId, planningStatus.id, pausedStatus.id, "筹划中", "已暂停", 2, now))
                transitions.add(createTransition(projectId, planningStatus.id, cancelledStatus.id, "筹划中", "已取消", 3, now))
                
                // 从进行中 -> 筹划中，已暂停，已完成，已取消
                transitions.add(createTransition(projectId, inProgressStatus.id, planningStatus.id, "进行中", "筹划中", 4, now))
                transitions.add(createTransition(projectId, inProgressStatus.id, pausedStatus.id, "进行中", "已暂停", 5, now))
                transitions.add(createTransition(projectId, inProgressStatus.id, completedStatus.id, "进行中", "已完成", 6, now))
                transitions.add(createTransition(projectId, inProgressStatus.id, cancelledStatus.id, "进行中", "已取消", 7, now))
                
                // 从已暂停 -> 筹划中，进行中，已取消
                transitions.add(createTransition(projectId, pausedStatus.id, planningStatus.id, "已暂停", "筹划中", 8, now))
                transitions.add(createTransition(projectId, pausedStatus.id, inProgressStatus.id, "已暂停", "进行中", 9, now))
                transitions.add(createTransition(projectId, pausedStatus.id, cancelledStatus.id, "已暂停", "已取消", 10, now))
                
                // 从已完成 -> 进行中
                transitions.add(createTransition(projectId, completedStatus.id, inProgressStatus.id, "已完成", "进行中", 11, now))
                
                // 从已取消 -> 筹划中
                transitions.add(createTransition(projectId, cancelledStatus.id, planningStatus.id, "已取消", "筹划中", 12, now))
                
                // 保存转换规则
                saveTransitions(transitions)
                    .doOnSuccess { log.info("标准状态转换规则初始化成功，项目ID={}，规则数量={}", projectId, transitions.size) }
                    .doOnError { e -> log.error("标准状态转换规则初始化失败，项目ID={}: {}", projectId, e.message, e) }
                    .thenReturn(savedStatuses)
            }
            .doOnSuccess { log.info("标准状态体系初始化成功，项目ID={}", projectId) }
            .doOnError { e -> log.error("标准状态体系初始化失败，项目ID={}: {}", projectId, e.message, e) }
    }

    /**
     * 初始化扩展状态体系
     * 创建筹划中(#9C27B0)、等待中(#3F51B5)、需求变更(#E91E63)、进行中(#4CAF50)、已暂停(#FFC107)、已完成(#2196F3)、已取消(#FF9800)七个状态
     *
     * @param projectId 项目ID
     * @return 创建的状态列表
     */
    private fun initExtendedStateSystem(projectId: Long): Mono<List<ProjectStatus>> {
        log.info("初始化扩展状态体系，项目ID={}", projectId)

        val now = OffsetDateTime.now()
        val statuses = listOf(
            ProjectStatus(
                id = 0, // 会由数据库自动生成
                name = "筹划中",
                color = "#9C27B0",
                description = "项目正在筹划阶段",
                isDefault = true,
                isTerminal = false,
                displayOrder = 1,
                createdAt = now,
                updatedAt = now,
                version = 1
            ),
            ProjectStatus(
                id = 0, // 会由数据库自动生成
                name = "等待中",
                color = "#3F51B5",
                description = "项目正在等待中",
                isDefault = false,
                isTerminal = false,
                displayOrder = 2,
                createdAt = now,
                updatedAt = now,
                version = 1
            ),
            ProjectStatus(
                id = 0, // 会由数据库自动生成
                name = "需求变更",
                color = "#E91E63",
                description = "项目需求正在变更",
                isDefault = false,
                isTerminal = false,
                displayOrder = 3,
                createdAt = now,
                updatedAt = now,
                version = 1
            ),
            ProjectStatus(
                id = 0, // 会由数据库自动生成
                name = "进行中",
                color = "#4CAF50",
                description = "项目正在进行中",
                isDefault = false,
                isTerminal = false,
                displayOrder = 4,
                createdAt = now,
                updatedAt = now,
                version = 1
            ),
            ProjectStatus(
                id = 0, // 会由数据库自动生成
                name = "已暂停",
                color = "#FFC107",
                description = "项目已暂停",
                isDefault = false,
                isTerminal = false,
                displayOrder = 5,
                createdAt = now,
                updatedAt = now,
                version = 1
            ),
            ProjectStatus(
                id = 0, // 会由数据库自动生成
                name = "已完成",
                color = "#2196F3",
                description = "项目已完成",
                isDefault = false,
                isTerminal = true,
                displayOrder = 6,
                createdAt = now,
                updatedAt = now,
                version = 1
            ),
            ProjectStatus(
                id = 0, // 会由数据库自动生成
                name = "已取消",
                color = "#FF9800",
                description = "项目已取消",
                isDefault = false,
                isTerminal = true,
                displayOrder = 7,
                createdAt = now,
                updatedAt = now,
                version = 1
            )
        )

        return saveStatuses(statuses)
            .flatMap { savedStatuses ->
                // 根据保存后的状态ID获取各状态
                val planningStatus = savedStatuses.find { it.name == "筹划中" }!!
                val waitingStatus = savedStatuses.find { it.name == "等待中" }!!
                val requirementChangeStatus = savedStatuses.find { it.name == "需求变更" }!!
                val inProgressStatus = savedStatuses.find { it.name == "进行中" }!!
                val pausedStatus = savedStatuses.find { it.name == "已暂停" }!!
                val completedStatus = savedStatuses.find { it.name == "已完成" }!!
                val cancelledStatus = savedStatuses.find { it.name == "已取消" }!!

                // 创建状态转换规则
                val transitions = mutableListOf<ProjectStatusTransition>()

                // 按照UI界面的转换矩阵创建转换规则
                var order = 1

                // 从筹划中可以转到：等待中、需求变更、进行中、已暂停、已取消
                transitions.add(createTransition(projectId, planningStatus.id, waitingStatus.id, "筹划中", "等待中", order++, now))
                transitions.add(createTransition(projectId, planningStatus.id, requirementChangeStatus.id, "筹划中", "需求变更", order++, now))
                transitions.add(createTransition(projectId, planningStatus.id, inProgressStatus.id, "筹划中", "进行中", order++, now))
                transitions.add(createTransition(projectId, planningStatus.id, pausedStatus.id, "筹划中", "已暂停", order++, now))
                transitions.add(createTransition(projectId, planningStatus.id, cancelledStatus.id, "筹划中", "已取消", order++, now))

                // 从等待中可以转到：筹划中、需求变更、进行中、已暂停、已取消
                transitions.add(createTransition(projectId, waitingStatus.id, planningStatus.id, "等待中", "筹划中", order++, now))
                transitions.add(createTransition(projectId, waitingStatus.id, requirementChangeStatus.id, "等待中", "需求变更", order++, now))
                transitions.add(createTransition(projectId, waitingStatus.id, inProgressStatus.id, "等待中", "进行中", order++, now))
                transitions.add(createTransition(projectId, waitingStatus.id, pausedStatus.id, "等待中", "已暂停", order++, now))
                transitions.add(createTransition(projectId, waitingStatus.id, cancelledStatus.id, "等待中", "已取消", order++, now))

                // 从需求变更可以转到：筹划中、等待中、进行中、已暂停、已取消
                transitions.add(createTransition(projectId, requirementChangeStatus.id, planningStatus.id, "需求变更", "筹划中", order++, now))
                transitions.add(createTransition(projectId, requirementChangeStatus.id, waitingStatus.id, "需求变更", "等待中", order++, now))
                transitions.add(createTransition(projectId, requirementChangeStatus.id, inProgressStatus.id, "需求变更", "进行中", order++, now))
                transitions.add(createTransition(projectId, requirementChangeStatus.id, pausedStatus.id, "需求变更", "已暂停", order++, now))
                transitions.add(createTransition(projectId, requirementChangeStatus.id, cancelledStatus.id, "需求变更", "已取消", order++, now))

                // 从进行中可以转到：筹划中、等待中、需求变更、已暂停、已完成、已取消
                transitions.add(createTransition(projectId, inProgressStatus.id, planningStatus.id, "进行中", "筹划中", order++, now))
                transitions.add(createTransition(projectId, inProgressStatus.id, waitingStatus.id, "进行中", "等待中", order++, now))
                transitions.add(createTransition(projectId, inProgressStatus.id, requirementChangeStatus.id, "进行中", "需求变更", order++, now))
                transitions.add(createTransition(projectId, inProgressStatus.id, pausedStatus.id, "进行中", "已暂停", order++, now))
                transitions.add(createTransition(projectId, inProgressStatus.id, completedStatus.id, "进行中", "已完成", order++, now))
                transitions.add(createTransition(projectId, inProgressStatus.id, cancelledStatus.id, "进行中", "已取消", order++, now))

                // 从已暂停可以转到：筹划中、等待中、需求变更、进行中、已取消
                transitions.add(createTransition(projectId, pausedStatus.id, planningStatus.id, "已暂停", "筹划中", order++, now))
                transitions.add(createTransition(projectId, pausedStatus.id, waitingStatus.id, "已暂停", "等待中", order++, now))
                transitions.add(createTransition(projectId, pausedStatus.id, requirementChangeStatus.id, "已暂停", "需求变更", order++, now))
                transitions.add(createTransition(projectId, pausedStatus.id, inProgressStatus.id, "已暂停", "进行中", order++, now))
                transitions.add(createTransition(projectId, pausedStatus.id, cancelledStatus.id, "已暂停", "已取消", order++, now))

                // 从已完成可以转到：需求变更、进行中
                transitions.add(createTransition(projectId, completedStatus.id, requirementChangeStatus.id, "已完成", "需求变更", order++, now))
                transitions.add(createTransition(projectId, completedStatus.id, inProgressStatus.id, "已完成", "进行中", order++, now))

                // 从已取消可以转到：筹划中
                transitions.add(createTransition(projectId, cancelledStatus.id, planningStatus.id, "已取消", "筹划中", order++, now))

                // 保存转换规则
                saveTransitions(transitions)
                    .doOnSuccess { log.info("扩展状态转换规则初始化成功，项目ID={}，规则数量={}", projectId, transitions.size) }
                    .doOnError { e -> log.error("扩展状态转换规则初始化失败，项目ID={}: {}", projectId, e.message, e) }
                    .thenReturn(savedStatuses)
            }
            .doOnSuccess { log.info("扩展状态体系初始化成功，项目ID={}", projectId) }
            .doOnError { e -> log.error("扩展状态体系初始化失败，项目ID={}: {}", projectId, e.message, e) }
    }

    /**
     * 初始化自定义状态体系
     * 根据用户自定义的状态项和转换规则创建状态体系
     *
     * @param projectId 项目ID
     * @param customItems 自定义状态项列表
     * @param transitionRules 自定义状态转换规则列表
     * @return 创建的状态列表
     */
    private fun initCustomStateSystem(projectId: Long, customItems: List<CustomStatusItem>, transitionRules: List<StatusTransitionRule>): Mono<List<ProjectStatus>> {
        log.info("初始化自定义状态体系，项目ID={}，自定义项数量={}，转换规则数量={}", projectId, customItems.size, transitionRules.size)
        
        // 如果没有自定义项，使用标准状态体系
        if (customItems.isEmpty()) {
            log.warn("自定义状态项为空，使用标准状态体系，项目ID={}", projectId)
            return initStandardStateSystem(projectId)
        }
        
        val now = OffsetDateTime.now()
        
        // 创建状态列表
        val statuses = customItems.mapIndexed { index, item ->
            ProjectStatus(
                id = 0, // 会由数据库自动生成
                name = item.name,
                color = item.color,
                description = "项目状态：${item.name}",
                isDefault = item.isDefault || (index == 0), // 如果没有指定默认状态，则第一个为默认
                isTerminal = item.isTerminal,
                displayOrder = item.order,
                createdAt = now,
                updatedAt = now,
                version = 1
            )
        }
        
        // 先保存状态
        return saveStatuses(statuses)
            .flatMap { savedStatuses ->
                // 如果没有转换规则或只有一个状态，就不创建转换规则
                if (transitionRules.isEmpty() || savedStatuses.size <= 1) {
                    return@flatMap Mono.just(savedStatuses)
                }
                
                // 创建ID映射（自定义ID -> 数据库ID）
                val idMapping = customItems.mapIndexed { index, item ->
                    item.id to savedStatuses[index].id
                }.toMap()
                
                // 创建转换规则
                val transitions = transitionRules.mapIndexed { index, rule ->
                    val fromStatusId = idMapping[rule.fromStatusId] ?: return@mapIndexed null
                    val toStatusId = idMapping[rule.toStatusId] ?: return@mapIndexed null
                    
                    // 获取状态名称
                    val fromStatus = customItems.find { it.id == rule.fromStatusId } 
                    val toStatus = customItems.find { it.id == rule.toStatusId }
                    
                    // 创建转换规则
                    createTransition(
                        projectId,
                        fromStatusId,
                        toStatusId,
                        fromStatus?.name ?: "未知状态",
                        toStatus?.name ?: "未知状态",
                        index + 1,
                        now
                    )
                }.filterNotNull()
                
                // 保存转换规则
                saveTransitions(transitions)
                    .doOnSuccess { log.info("自定义状态转换规则保存成功，项目ID={}，规则数量={}", projectId, transitions.size) }
                    .doOnError { e -> log.error("自定义状态转换规则保存失败，项目ID={}: {}", projectId, e.message, e) }
                    .thenReturn(savedStatuses)
            }
            .doOnSuccess { log.info("自定义状态体系初始化成功，项目ID={}", projectId) }
            .doOnError { e -> log.error("自定义状态体系初始化失败，项目ID={}: {}", projectId, e.message, e) }
    }
    
    /**
     * 批量保存状态配置
     *
     * @param statuses 要保存的状态列表
     * @return 保存成功的状态列表
     */
    private fun saveStatuses(statuses: List<ProjectStatus>): Mono<List<ProjectStatus>> {
        return Flux.fromIterable(statuses)
            .flatMap { status -> projectStatusRepository.save(status) }
            .collectList()
    }
    
    /**
     * 批量保存状态转换规则
     *
     * @param transitions 要保存的状态转换规则列表
     * @return 保存成功的状态转换规则列表
     */
    private fun saveTransitions(transitions: List<ProjectStatusTransition>): Mono<List<ProjectStatusTransition>> {
        return Flux.fromIterable(transitions)
            .flatMap { transition -> projectStatusTransitionRepository.save(transition) }
            .collectList()
    }
    
    /**
     * 获取任务状态到项目状态的映射关系
     * 此方法返回一个将任务状态ID映射到对应项目状态ID的关系
     * 
     * @param projectId 项目ID
     * @return 任务状态ID到项目状态ID的映射关系的Flux流
     */
    fun getTaskStatusToProjectStatusMapping(projectId: Long): Flux<TaskToProjectStatusMapping> {
        log.info("获取任务状态到项目状态的映射关系，项目ID={}", projectId)
        
        // 对于当前版本，我们简化实现，假设任务状态ID与项目状态ID有相同的映射关系
        // 实际业务场景中，可能需要从数据库中获取真实的映射关系
        return taskService.findAllStatuses(projectId)
            .flatMap { taskStatus ->
                // 使用任务状态ID作为项目状态ID
                // 在实际环境中，这里应该查询真实的映射关系
                Mono.just(TaskToProjectStatusMapping(taskStatus.id, taskStatus.id))
            }
    }
    
    /**
     * 切换项目归档状态
     * 如果项目当前未归档，则将其归档；如果已归档，则取消归档
     * 
     * @param projectId 项目ID
     * @param operatorId 操作者ID
     * @param targetStatus 目标归档状态，true表示归档，false表示取消归档
     * @param reason 操作原因（可选）
     * @return 更新后的项目
     */
    fun toggleProjectArchiveStatus(projectId: Long, operatorId: Long, targetStatus: Boolean, reason: String? = null): Mono<Project> {
        val actionName = if (targetStatus) "归档" else "取消归档"

        return projectRepository.findById(projectId)
            .switchIfEmpty(Mono.error(IllegalArgumentException("项目不存在，ID: $projectId")))
            .flatMap { project ->
                // 检查操作者权限
                accessControlService.hasProjectPermission(operatorId, projectId, ProjectPermissions.PROJECT_EDIT)
                    .flatMap { hasPermission ->
                        if (!hasPermission) {
                            return@flatMap Mono.error<Project>(IllegalArgumentException("没有权限设置项目归档状态"))
                        }
                        return@flatMap Mono.defer {
                        // 如果现有状态与目标状态相同，无需操作
                        if (project.archived == targetStatus) {
                            log.info("项目已经处于{}状态，无需操作，项目ID={}", 
                                if (targetStatus) "归档" else "非归档", projectId)
                            return@defer Mono.just(project)
                        }
                        
                        // 创建归档记录
                        val now = OffsetDateTime.now()
                        
                        val projectArchive = ProjectArchive(
                            id = null,
                            projectId = projectId,
                            archived = targetStatus,
                            archivedAt = if (targetStatus) now else null,
                            archivedBy = if (targetStatus) operatorId else null,
                            archiveReason = if (targetStatus) reason else null,
                            unarchivedAt = if (!targetStatus) now else null,
                            unarchivedBy = if (!targetStatus) operatorId else null,
                            unarchiveReason = if (!targetStatus) reason else null,
                            createdAt = now,
                            updatedAt = now,
                            version = 1
                        )
                        
                        // 保存归档记录
                        projectArchiveRecordRepository.save(projectArchive)
                            .flatMap {
                                // 更新项目归档状态
                                val updatedProject = project.copy(archived = targetStatus, updatedAt = now)
                                projectRepository.update(updatedProject)
                                    .doOnSuccess { log.info("项目{}成功，项目ID={}", actionName, projectId) }
                                    .doOnError { e -> log.error("项目{}失败，项目ID={}：{}", actionName, projectId, e.message, e) }
                            }
                        }
                    }
            }
    }

    /**
     * 内部方法：删除项目状态配置
     * 包括状态映射、状态转换规则和状态定义
     * 采用先查询后删除的模式
     */
    private fun deleteProjectStatusConfigInternal(projectId: Long): Mono<Void> {
        log.info("开始删除项目状态配置: 项目ID={}", projectId)
        
        // 1. 查询项目状态映射
        return projectStatusMappingRepository.list {
            fieldOf(ProjectStatusMapping::projectId, ComparisonOperator.EQUALS, projectId)
        }
        .collectList()
        .flatMap { mappings ->
            if (mappings.isEmpty()) {
                log.debug("未找到项目状态映射: 项目ID={}", projectId)
                return@flatMap Mono.empty<Void>()
            }
            
            // 提取映射ID和状态ID
            val mappingIds = mappings.map { it.id!! }.distinct() // 确保非空
            val statusIds = mappings.map { it.statusId }.distinct()
            
            log.debug("找到{}个状态映射和{}个不同的状态: 项目ID={}", mappingIds.size, statusIds.size, projectId)
            
            // 2. 批量删除状态映射
            projectStatusMappingRepository.deleteBatch(mappingIds.toList())
                .doOnSuccess { log.debug("成功删除{}个状态映射: 项目ID={}", mappingIds.size, projectId) }
                
                // 3. 查询并删除状态转换规则
                .then(Mono.defer {
                    if (statusIds.isEmpty()) {
                        return@defer Mono.empty<Void>()
                    }
                    
                    // 查询与这些状态相关的转换规则
                    projectStatusTransitionRepository.list {
                        fieldOf(ProjectStatusTransition::fromStatusId, ComparisonOperator.IN, statusIds)
                        or {
                            fieldOf(ProjectStatusTransition::toStatusId, ComparisonOperator.IN, statusIds)
                        }
                    }
                    .map { it.id!! } // 确保非空
                    .collectList()
                    .flatMap { transitionIds ->
                        if (transitionIds.isEmpty()) {
                            log.debug("未找到需要删除的状态转换规则: 项目ID={}", projectId)
                            return@flatMap Mono.empty<Void>()
                        }
                        
                        log.debug("找到{}个状态转换规则需要删除: 项目ID={}", transitionIds.size, projectId)
                        
                        // 批量删除转换规则
                        projectStatusTransitionRepository.deleteBatch(transitionIds.toList())
                            .doOnSuccess { log.debug("成功删除{}个状态转换规则: 项目ID={}", transitionIds.size, projectId) }
                    }
                })
                
                // 4. 删除状态定义
                .then(Mono.defer {
                    if (statusIds.isEmpty()) {
                        return@defer Mono.empty<Void>()
                    }
                    
                    // 批量删除状态定义
                    projectStatusRepository.deleteBatch(statusIds.toList())
                        .doOnSuccess { log.debug("成功删除{}个状态定义: 项目ID={}", statusIds.size, projectId) }
                })
        }
        .doOnError { e -> log.error("项目状态配置删除失败: 项目ID={}, 错误={}", projectId, e.message, e) }
    }

    /**
     * 内部方法：删除项目优先级配置
     */
    private fun deleteProjectPriorityConfigInternal(projectId: Long): Mono<Void> {
        log.info("开始删除项目优先级配置: 项目ID={}", projectId)
        
        // 这里应该实现优先级配置删除逻辑
        // 如果系统中有Project_Priority_Mapping表，则需要删除该表中的记录
        // 如果优先级是系统级别的，则不需要删除Priority记录本身
        
        // 暂时返回空结果，表示操作成功
        return Mono.empty<Void>()
            .doOnSuccess { log.debug("项目优先级配置删除成功: 项目ID={}", projectId) }
            .doOnError { e -> log.error("项目优先级配置删除失败: 项目ID={}, 错误={}", projectId, e.message, e) }
    }

    /**
     * 内部方法：删除项目归档记录
     * 先查询项目的归档记录，然后通过ID批量删除
     */
    private fun deleteProjectArchiveRecordsInternal(projectId: Long): Mono<Void> {
        log.info("开始删除项目归档记录: 项目ID={}", projectId)
        
        // 查询项目的所有归档记录
        return projectArchiveRecordRepository.list {
            fieldOf(ProjectArchive::projectId, ComparisonOperator.EQUALS, projectId)
        }
        .map { it.id!! } // 确保非空
        .collectList()
        .flatMap { archiveIds ->
            if (archiveIds.isEmpty()) {
                log.debug("未找到需要删除的归档记录: 项目ID={}", projectId)
                return@flatMap Mono.empty<Void>()
            }
            
            log.debug("找到{}条归档记录需要删除: 项目ID={}", archiveIds.size, projectId)
            
            // 批量删除归档记录
            projectArchiveRecordRepository.deleteBatch(archiveIds.toList())
                .doOnSuccess { log.debug("成功删除{}条归档记录: 项目ID={}", archiveIds.size, projectId) }
                .doOnError { e -> log.error("归档记录删除失败: 项目ID={}, 错误={}", projectId, e.message, e) }
        }
    }

    /**
     * 任务状态到项目状态的映射关系数据类
     */
    data class TaskToProjectStatusMapping(
        val taskStatusId: Long,
        val projectStatusId: Long
    )

    /**
     * 创建状态转换规则
     * 
     * @param projectId 项目ID
     * @param fromStatusId 源状态ID
     * @param toStatusId 目标状态ID
     * @param fromName 源状态名称
     * @param toName 目标状态名称
     * @param order 显示顺序
     * @param now 创建时间
     * @return 状态转换规则
     */
    private fun createTransition(
        projectId: Long,
        fromStatusId: Long,
        toStatusId: Long,
        fromName: String,
        toName: String,
        order: Int,
        now: OffsetDateTime
    ): ProjectStatusTransition {
        return ProjectStatusTransition(
            id = 0, // 会由数据库自动生成
            projectId = projectId, // 设置项目ID
            fromStatusId = fromStatusId,
            toStatusId = toStatusId,
            eventCode = "${fromName}_to_${toName}".replace(" ", "_").lowercase(),
            isEnabled = true,
            createdAt = now,
            updatedAt = now,
            version = 1
        )
    }
    
    /**
     * 获取项目的状态转换规则列表
     * 返回项目关联的所有状态转换规则
     * 
     * @param projectId 项目ID
     * @return 状态转换规则列表的Flux流
     */
    fun getProjectStatusTransitions(projectId: Long): Flux<ProjectStatusTransition> {
        log.info("获取项目状态转换规则，项目ID={}", projectId)
        
        // 直接使用projectId查询该项目的所有状态转换规则
        return projectStatusTransitionRepository.list {
            fieldOf(ProjectStatusTransition::projectId, ComparisonOperator.EQUALS, projectId)
        }
        .doOnNext { transition -> 
            log.debug("找到转换规则：项目ID={}，从状态ID={}到状态ID={}, 是否启用={}", 
                projectId, transition.fromStatusId, transition.toStatusId, transition.isEnabled)
        }
        .doOnComplete { log.debug("完成项目状态转换规则查询，项目ID={}", projectId) }
        .doOnError { e -> log.error("查询项目状态转换规则出错，项目ID={}，错误={}", projectId, e.message, e) }
    }
}
