package com.task.application.service

import com.task.application.request.*
import com.task.application.utils.SecurityUtils
import com.task.application.vo.*
import com.task.domain.constants.ProjectPermissions
import com.task.domain.model.common.ComparisonOperator
import com.task.domain.model.common.fieldOf
import com.task.domain.model.project.Project
import com.task.domain.model.project.ProjectMember
import com.task.domain.model.project.ProjectRole
import com.task.domain.model.project.ProjectStatus
import com.task.domain.model.project.command.CreateProjectCommand
import com.task.domain.model.project.command.UpdateProjectCommand
import com.task.domain.model.project.config.CustomStatusItem
import com.task.domain.model.project.config.StatusTransitionRule
import com.task.domain.model.task.Priority
import com.task.domain.repository.ProjectMemberRepository
import com.task.domain.repository.ProjectRoleRepository
import com.task.domain.repository.UserRepository
import com.task.domain.service.ProjectService
import com.task.domain.service.TaskService
import com.task.domain.service.UserService
import com.task.shared.annotation.RequireProjectPermission
import com.task.shared.api.response.PageData
import com.task.shared.constants.ResponseCode
import com.task.shared.exceptions.BusinessException
import org.slf4j.LoggerFactory
import org.springframework.stereotype.Service
import reactor.core.publisher.Flux
import reactor.core.publisher.Mono
import reactor.kotlin.core.publisher.collectMap
import java.time.OffsetDateTime
import com.task.domain.model.project.config.CustomPriorityItem as DomainCustomPriorityItem
import com.task.domain.model.project.config.ProjectConfig as DomainProjectConfig

/**
 * 项目应用服务
 * 负责处理与项目相关的应用层逻辑，协调领域服务
 */
@Service
class ProjectApplicationService(
    private val projectService: ProjectService,
    private val taskService: TaskService,
    private val securityUtils: SecurityUtils,
    private val userService: UserService,
    private val projectMemberRepository: ProjectMemberRepository,
    private val userRepository: UserRepository,
    private val projectRoleRepository: ProjectRoleRepository,
) {

    private val log = LoggerFactory.getLogger(this::class.java)

    /**
     * 获取项目任务分布数据
     * 包括任务优先级分布和任务状态分布
     *
     * @param projectId 项目ID
     * @return 任务分布数据
     */
    @RequireProjectPermission(
        permission = ProjectPermissions.PROJECT_TASK_STATS_VIEW,
        projectIdParam = "projectId"
    )
    fun getTaskDistribution(projectId: Long): Mono<TaskDistributionVO> {
        log.info("获取项目任务分布数据，项目ID={}", projectId)

        return Mono.zip(
            taskService.getTaskStatistics(projectId),
            projectService.getAllProjectStatuses(projectId).collectList()
        ).flatMap { tuple ->
            val stats = tuple.t1
            val projectStatuses = tuple.t2
            
            // 计算总任务数
            val totalTasks = stats.currentTaskStats.total
            
            // 获取任务状态到项目状态的映射关系
            projectService.getTaskStatusToProjectStatusMapping(projectId)
                .collectMap({ it.taskStatusId }, { it.projectStatusId })
                .map { statusMapping ->
                    // 构建状态分布项，使用项目状态而不是任务状态
                    val statusItems = buildProjectStatusItems(projectStatuses, stats.currentTaskStats.statusCounts, statusMapping, totalTasks)
                    
                    // 构建优先级分布项
                    val priorityItems = buildPriorityItems(stats.taskPriorityStats.priorities, stats.taskPriorityStats.priorityCounts, totalTasks)
                    
                    // 计算总任务完成率
                    val completedCount = stats.currentTaskStats.completed
                    val completionPercent = if (totalTasks > 0) (completedCount * 100) / totalTasks else 0
                    
                    // 构建返回结果
                    TaskDistributionVO(
                        priorityDistribution = PriorityDistributionVO(
                            items = priorityItems,
                            totalCount = totalTasks
                        ),
                        statusDistribution = StatusDistributionVO(
                            items = statusItems,
                            totalCount = totalTasks
                        ),
                        taskCompletion = TaskCompletionVO(
                            completionPercent = completionPercent,
                            completed = completedCount,
                            total = totalTasks
                        )
                    )
                }
        }
    }
    
    /**
     * 构建优先级项目列表
     * 
     * @param priorities 优先级列表
     * @param priorityCounts 各优先级对应的任务数量
     * @param totalTasks 总任务数
     * @return 优先级项目视图对象列表
     */
    private fun buildPriorityItems(
        priorities: List<Priority>,
        priorityCounts: Map<Long, Int>,
        totalTasks: Int
    ): List<PriorityItemVO> {
        // 按优先级分数从高到低排序
        return priorities.map { priority ->
            val count = priorityCounts[priority.id] ?: 0
            val percent = if (totalTasks > 0) (count * 100) / totalTasks else 0
            
            PriorityItemVO(
                id = priority.id,
                name = priority.name,
                color = priority.color,
                level = priority.level,
                score = priority.score,
                count = count,
                percent = percent
            )
        }.sortedByDescending { it.score }
    }

    /**
     * 使用项目状态构建状态分布项
     * 
     * @param projectStatuses 项目状态列表
     * @param statusCounts 任务数量按状态ID分组的映射
     * @param statusMapping 任务状态到项目状态的映射关系
     * @param totalTasks 总任务数
     * @return 状态项目视图对象列表
     */
    private fun buildProjectStatusItems(
        projectStatuses: List<ProjectStatus>,
        statusCounts: Map<Long, Int>,
        statusMapping: Map<Long, Long>,
        totalTasks: Int
    ): List<StatusItemVO> {
        log.debug("开始构建项目状态分布项，项目状态数量={}，总任务={}", projectStatuses.size, totalTasks)
        
        // 任务状态ID到项目状态ID的映射
        val taskToProjectStatusMap = statusMapping
        
        // 各项目状态包含的任务数量
        val projectStatusCounts = mutableMapOf<Long, Int>()
        
        // 使用映射关系将任务状态数量汇总到对应的项目状态
        statusCounts.forEach { (taskStatusId, count) ->
            val projectStatusId = taskToProjectStatusMap[taskStatusId]
            if (projectStatusId != null) {
                projectStatusCounts[projectStatusId] = (projectStatusCounts[projectStatusId] ?: 0) + count
            }
        }
        
        log.debug("项目状态分布数据: {}", projectStatusCounts)
        
        // 对项目状态列表进行遍历，构建状态分布项
        // 直接遍历并构建状态视图对象，保持原来的排序顺序
        // 因为projectStatuses已经在SQL中按displayOrder排序，所以这里不需要再次排序
        return projectStatuses.map { status ->
            // 获取项目状态对应的任务数量，如果没有则为0
            val count = projectStatusCounts[status.id] ?: 0
            
            // 计算百分比
            val percent = if (totalTasks > 0) (count * 100) / totalTasks else 0
            
            log.debug("项目状态[{}]{}: 任务数量={}, 百分比={}%, 排序={}", 
                     status.id, status.name, count, percent, status.displayOrder)
            
            // 构建状态视图对象
            StatusItemVO(
                id = status.id,
                name = status.name,
                color = status.color,
                isTerminal = status.isTerminal,
                count = count,
                percent = percent
            )
        }
    }

    /**
     * 获取当前用户加入的项目列表
     *
     * @param request 获取项目列表请求
     * @return 项目列表分页数据
     */
    fun currentUserPage(request: GetProjectsRequest): Mono<PageData<ProjectVO>> {
        return securityUtils.withCurrentUserId { userId ->
            projectService.findProjectsByMemberId(
                userId = userId, 
                name = request.name, 
                pageNumber = request.pageNumber, 
                size = request.pageSize,
                sortField = request.sortField,
                sortOrder = request.sortOrder
            )
                .flatMap { pageResult ->
                    // 提取所有项目ID
                    val projectIds = pageResult.items.mapNotNull { it.id }
                    
                    // 如果没有项目，直接返回空结果
                    if (projectIds.isEmpty()) {
                        return@flatMap Mono.just(
                            PageData.of(
                                content = emptyList(),
                                current = request.pageNumber + 1,
                                size = request.pageSize,
                                total = 0
                            )
                        )
                    }
                    
                    // 提取所有项目的创建者ID
                    val ownerIds = pageResult.items.map { it.creatorId }.distinct()
                    
                    // 批量查询项目成员数量
                    val memberCountsMono = batchQueryMemberCounts(projectIds)
                    
                    // 批量查询项目进度
                    val progressMono = batchQueryProjectProgress(projectIds)
                    
                    // 批量查询项目创建者名称
                    val ownerNamesMono = userService.batchGetUserNames(ownerIds)
                    
                    // 组合多个批量查询结果
                    Mono.zip(memberCountsMono, progressMono, ownerNamesMono)
                        .map { tuple ->
                            val memberCounts = tuple.t1
                            val progressMap = tuple.t2
                            val ownerNames = tuple.t3
                            
                            // 转换为VO对象并填充批量查询的数据
                            val projectVOS = pageResult.items.map { project ->
                                val memberCount = (memberCounts[project.id] ?: 0).toInt()
                                val progress = progressMap[project.id] ?: 0
                                val ownerName = project.creatorId.let { ownerNames[it] }

                                ProjectVO(
                                    id = project.id!!,
                                    name = project.name,
                                    description = project.description,
                                    ownerId = project.creatorId,
                                    ownerName = ownerName!!,
                                    memberCount = memberCount,
                                    progress = progress,
                                    archived = project.archived,
                                    startDate = project.startDate,
                                    createdAt = project.createdAt,
                                    updatedAt = project.updatedAt
                                )
                            }
                            
                            // 组装分页数据
                            PageData.of(
                                content = projectVOS,
                                current = request.pageNumber + 1,
                                size = request.pageSize,
                                total = pageResult.total
                            )
                        }
                }
        }
    }
    
    /**
     * 批量查询项目成员数量
     * 
     * @param projectIds 项目ID列表
     * @return 项目ID到成员数量的映射
     */
    private fun batchQueryMemberCounts(projectIds: List<Long>): Mono<Map<Long, Int>> {
        // 如果项目ID列表为空，直接返回空映射
        if (projectIds.isEmpty()) {
            return Mono.just(emptyMap())
        }
        
        log.info("批量查询{}个项目的成员数量", projectIds.size)
        
        // 创建一个Flux来处理每个项目的成员数量查询
        return Flux.fromIterable(projectIds)
            .flatMap { projectId ->
                // 查询项目成员数量
                projectService.countProjectMembers(projectId)
                    .map { count ->
                        // 返回项目ID和成员数量的键值对，将Long转换为Int
                        projectId to count.toInt()
                    }
                    .defaultIfEmpty(projectId to 0) // 如果没有成员，返回0
            }
            .collectMap() // 将键值对收集到Map中
            .doOnSuccess { result ->
                log.debug("成功查询{}个项目的成员数量", result.size)
            }
            .doOnError { error ->
                log.error("批量查询项目成员数量失败: {}", error.message, error)
            }
    }
    
    /**
     * 批量查询项目进度
     * 使用更精确的进度计算方式，考虑每个任务的实际进度
     *
     * @param projectIds 项目ID列表
     * @return 项目ID到进度的映射
     */
    private fun batchQueryProjectProgress(projectIds: List<Long>): Mono<Map<Long, Int>> {
        // 如果项目ID列表为空，直接返回空映射
        if (projectIds.isEmpty()) {
            return Mono.just(emptyMap())
        }
        
        log.info("批量计算{}个项目的加权进度", projectIds.size)
        
        // 创建一个Flux来处理每个项目的进度计算
        return Flux.fromIterable(projectIds)
            .flatMap { projectId ->
                // 使用更精确的项目进度计算方法
                taskService.calculateProjectProgress(projectId)
                    .map { (totalWeight, completedWeight) ->
                        // 计算进度百分比
                        val progress = if (totalWeight > 0) {
                            (completedWeight * 100 / totalWeight).toInt()
                        } else {
                            0 // 如果没有任务或总权重为0，进度为0%
                        }
                        
                        log.debug("项目ID={} 的加权进度计算结果: 总权重={}, 已完成权重={}, 进度={}%", 
                                projectId, totalWeight, completedWeight, progress)
                        
                        // 返回项目ID和进度的键值对
                        projectId to progress
                    }
                    .defaultIfEmpty(projectId to 0) // 如果计算失败，默认为0%
            }
            .collectMap() // 将键值对收集到Map中
            .doOnSuccess { result ->
                log.debug("成功计算{}个项目的进度", result.size)
            }
            .doOnError { error ->
                log.error("批量计算项目进度失败: {}", error.message, error)
            }
    }

    /**
     * 创建项目
     * 支持标准、高级和自定义优先级体系，以及标准、扩展和自定义状态流程
     *
     * @param request 创建项目请求
     * @return 创建的项目
     */
    fun createProject(request: CreateProjectRequest): Mono<ProjectVO> {
        log.info("开始创建项目，项目名称={}，优先级体系={}，状态流程={}", 
                request.name, request.prioritySystem, request.statusSystem)

        // 使用安全服务获取当前用户ID，显式指定返回类型为ProjectVo
        return securityUtils.withCurrentUserId<ProjectVO> { userId ->
            // 构建项目配置
            val config = buildProjectConfig(request)
            
            // 创建命令对象
            Mono.just(CreateProjectCommand(
                name = request.name,
                description = request.description,
                ownerId = userId, // 使用当前登录用户ID
                teamId = request.teamId,
                config = config
            ))
            .flatMap { command ->
                // 调用领域服务创建项目
                projectService.createProject(command)
                    .map { project ->
                        convertToProjectVo(project)
                    }
            }
        }
        .doOnSuccess { projectVo ->
            log.info("项目创建成功，项目ID={}, 名称={}", projectVo.id, projectVo.name)
        }
        .onErrorResume { e ->
            // 异常处理
            log.error("创建项目失败，项目名称={}: {}", request.name, e.message, e)
            Mono.error(e)
        }
    }
    
    /**
     * 根据请求构建项目配置
     * 处理不同的优先级体系和状态流程
     *
     * @param request 创建项目请求
     * @return 领域层的项目配置对象
     */
    private fun buildProjectConfig(request: CreateProjectRequest): DomainProjectConfig {
        // 处理优先级体系
        val customPriorityItems = when (request.prioritySystem) {
            "standard" -> {
                // 标准优先级体系：低、中、高三级优先级
                log.debug("使用标准优先级体系")
                listOf(
                    DomainCustomPriorityItem(
                        id = "priority-standard-high",
                        name = "高",
                        color = "#F44336", // 红色
                        order = 1 // 数值越小优先级越高
                    ),
                    DomainCustomPriorityItem(
                        id = "priority-standard-medium",
                        name = "中",
                        color = "#FFC107", // 黄色
                        order = 2
                    ),
                    DomainCustomPriorityItem(
                        id = "priority-standard-low",
                        name = "低",
                        color = "#8BC34A", // 绿色
                        order = 3
                    )
                )
            }
            "advanced" -> {
                // 高级优先级体系：五级优先级，更细致的分级
                log.debug("使用高级优先级体系")
                listOf(
                    DomainCustomPriorityItem(
                        id = "priority-advanced-highest",
                        name = "最高",
                        color = "#F44336", // 红色
                        order = 1 // 数值越小优先级越高
                    ),
                    DomainCustomPriorityItem(
                        id = "priority-advanced-high",
                        name = "高",
                        color = "#FF9800", // 橙色
                        order = 2
                    ),
                    DomainCustomPriorityItem(
                        id = "priority-advanced-medium",
                        name = "中",
                        color = "#FFC107", // 黄色
                        order = 3
                    ),
                    DomainCustomPriorityItem(
                        id = "priority-advanced-low",
                        name = "低",
                        color = "#8BC34A", // 淡绿色
                        order = 4
                    ),
                    DomainCustomPriorityItem(
                        id = "priority-advanced-lowest",
                        name = "最低",
                        color = "#4CAF50", // 绿色
                        order = 5
                    )
                )
            }
            "custom" -> {
                // 自定义优先级体系：使用请求中的自定义项
                log.debug("使用自定义优先级体系，共{}项", request.customPriorityItems.size)
                
                // 检查自定义优先级项是否为空
                if (request.customPriorityItems.isEmpty()) {
                    log.error("创建项目失败：自定义优先级体系需要至少一个优先级项")
                    throw IllegalArgumentException("自定义优先级体系需要至少一个优先级项")
                }
                
                // 直接将请求中的自定义优先级项转换为领域模型中的CustomPriorityItem
                val result = request.customPriorityItems.map { item ->
                    log.debug("处理自定义优先级项: id={}, name={}, color={}, order={}", 
                              item.id, item.name, item.color, item.order)
                    
                    DomainCustomPriorityItem(
                        id = item.id,
                        name = item.name,
                        color = item.color,
                        order = item.order
                    )
                }
                
                log.info("成功处理自定义优先级体系，共{}项", result.size)
                result
            }
            else -> {
                log.warn("未知的优先级体系类型: {}, 使用标准优先级体系", request.prioritySystem)
                // 使用标准优先级体系作为默认值
                listOf(
                    DomainCustomPriorityItem(
                        id = "priority-default-high",
                        name = "高",
                        color = "#F44336",
                        order = 1
                    ),
                    DomainCustomPriorityItem(
                        id = "priority-default-medium",
                        name = "中",
                        color = "#FFC107",
                        order = 2
                    ),
                    DomainCustomPriorityItem(
                        id = "priority-default-low",
                        name = "低",
                        color = "#8BC34A",
                        order = 3
                    )
                )
            }
        }
        
        // 处理自定义状态项
        val customStatusItems = request.customStatusItems.map { item ->
            log.debug("处理自定义状态项: id={}, name={}, color={}", 
                      item.id, item.name, item.color)
            
            CustomStatusItem(
                id = item.id,
                name = item.name,
                color = item.color,
                // 默认值，应用层没有这些字段
                order = 1,
                isDefault = false,
                isTerminal = false
            )
        }
        
        // 处理自定义状态转换规则
        val customStatusTransitions = request.customStatusTransitions.map { rule ->
            log.debug("处理自定义状态转换规则: 从{}到{}", 
                      rule.fromStatusId, rule.toStatusId)
            
            StatusTransitionRule(
                fromStatusId = rule.fromStatusId,
                toStatusId = rule.toStatusId
            )
        }
        
        log.info("项目配置构建完成: 优先级体系={}, 状态体系={}, 优先级项数量={}, 状态项数量={}, 状态转换规则数量={}",
                request.prioritySystem, request.statusSystem, 
                customPriorityItems.size, customStatusItems.size, customStatusTransitions.size)
        
        return DomainProjectConfig(
            prioritySystem = request.prioritySystem,
            customPriorityItems = customPriorityItems,
            statusSystem = request.statusSystem,
            customStatusItems = customStatusItems,
            customStatusTransitions = customStatusTransitions
        )
    }

    /**
     * 删除项目
     * 
     * 使用事务性发件箱模式实现项目删除功能，确保数据一致性和领域隔离
     * 
     * @param id 项目ID
     * @return 操作结果
     */
    @RequireProjectPermission(
        permission = ProjectPermissions.PROJECT_DELETE,
        projectIdParam = "id"
    )
    fun deleteProject(id: Long): Mono<Void> {
        return securityUtils.withCurrentUserId<Void> { userId ->
            // 先检查项目是否存在
            projectService.findById(id)
                .switchIfEmpty(Mono.error(IllegalArgumentException("项目不存在：$id")))
                .flatMap {
                    log.info("开始删除项目: ID={}, 操作用户ID={}", id, userId)
                    // 调用领域服务删除项目，传递操作用户ID
                    // 项目删除事件将在事务提交后自动发布
                    projectService.deleteById(id, userId)
                }
        }
        .doOnError { e ->
            log.error("删除项目失败，项目ID：$id", e)
        }
    }

    /**
     * 添加项目成员
     *
     * @param id 项目ID
     * @param userId 用户ID
     * @return 更新后的项目
     */
    fun addProjectMember(id: Long, userId: Long): Mono<Void> {
        return securityUtils.withCurrentUserId { operatorId ->
            projectService.addProjectMember(id, userId, operatorId)
        }
    }

    /**
     * 移除项目成员
     *
     * @param id 项目ID
     * @param userId 用户ID
     * @return 更新后的项目
     */
    fun removeProjectMember(id: Long, userId: Long): Mono<Void> {
        return securityUtils.withCurrentUserId { operatorId ->
            // 调用领域服务移除项目成员，传入操作者ID
            projectService.removeProjectMember(id, userId, operatorId)
        }
    }

    /**
     * 将Project转换为ProjectVo
     *
     * @param project Project对象
     * @return ProjectVo对象
     */
    private fun convertToProjectVo(project: Project): ProjectVO {
        return ProjectVO(
            id = project.id!!,
            name = project.name,
            description = project.description ?: "",
            ownerId = project.creatorId,
            ownerName = project.creator?.username ?: "",
            memberCount = project.members.size,
            progress = 0, // 需要单独计算，这里默认为0
            archived = project.archived,
            startDate = project.startDate,
            createdAt = project.createdAt!!,
            updatedAt = project.updatedAt
        )
    }

    /**
     * 获取项目优先级体系
     *
     * @param projectId 项目ID
     * @return 项目优先级体系
     */
    @RequireProjectPermission(
        permission = ProjectPermissions.PROJECT_VIEW,
        projectIdParam = "projectId"
    )
    fun getProjectPrioritySystem(projectId: Long): Mono<List<PrioritySystemVO>> {
        log.info("获取项目优先级体系，项目ID={}", projectId)

        return taskService.findAllPriorities(projectId)
            .map { priority ->
                PrioritySystemVO(
                    id = priority.id,
                    name = priority.name,
                    color = priority.color,
                    level = priority.level,
                    score = priority.score
                )
            }
            .collectList()
    }

    /**
     * 获取项目详情
     * 返回项目的完整详细信息，包括项目基本信息、团队信息、任务列表、成员列表和任务统计等
     *
     * @param projectId 项目ID，项目的唯一标识符
     * @return 项目详情视图对象，包含项目基本信息、成员列表、任务列表和统计数据
     * @throws IllegalArgumentException 当项目不存在时抛出
     * @throws SecurityException 当用户没有权限访问该项目时抛出
     */
    @RequireProjectPermission(
        permission = ProjectPermissions.PROJECT_VIEW,
        projectIdParam = "projectId"
    )
    fun getProjectDetail(projectId: Long): Mono<ProjectDetailVO> {
        log.info("获取项目详情，项目ID={}", projectId)

        return securityUtils.withCurrentUserId { userId ->
            log.debug("当前用户ID={}请求获取项目ID={}的详情", userId, projectId)
            
            // 获取项目基本信息
            projectService.getProjectDashboardBasic(projectId)
                .doOnSuccess { project ->
                    log.debug("成功获取项目基本信息，项目ID={}, 名称={}", project.id, project.name)
                }
                .flatMap { project ->
                    log.debug("开始并行获取项目相关数据，项目ID={}", projectId)

                    // 获取项目成员数量
                    val memberCountMono = projectService.countProjectMembers(projectId)
                        .doOnSuccess { count -> log.debug("项目ID={}的成员数量={}", projectId, count) }

                    // 获取实际的任务数量统计（总任务数和已完成任务数）
                    val taskCountsMono = taskService.countProjectTasks(projectId)
                        .doOnSuccess { (totalTasks, completedTasks) ->
                            log.debug("获取项目ID={}的任务统计: 总任务数={}, 已完成任务数={}",
                                projectId, totalTasks, completedTasks)
                        }

                    // 使用calculateProjectProgress方法获取项目加权进度
                    // 返回值为Pair<总权重, 已完成权重>
                    val progressStatsMono = taskService.calculateProjectProgress(projectId)
                        .doOnSuccess { (totalWeight, completedWeight) ->
                            log.debug("获取项目ID={}的进度统计: 总权重={}, 已完成权重={}",
                                projectId, totalWeight, completedWeight)
                        }
                        
                    // 从加权统计计算项目进度百分比
                    val progressMono = progressStatsMono
                        .map { (totalWeight, completedWeight) ->
                            val progress = if (totalWeight > 0) (completedWeight * 100 / totalWeight).toInt() else 0
                            log.info("项目ID={}的进度计算: 总权重={}, 已完成权重={}, 进度={}%", 
                                     projectId, totalWeight, completedWeight, progress)
                            progress
                        }
                        .doOnSuccess { progress -> log.debug("项目ID={}的最终进度={}%", projectId, progress) }

                    // 获取任务状态趋势数据
                    val taskStatusTrendMono = taskService.getTaskStatusTrend(projectId)
                        .doOnSuccess { trend -> log.debug("获取到项目ID={}的任务状态趋势数据，包含{}个状态", 
                                                       projectId, trend.statusList.size) }
                        .map { trendData -> 
                            // 将领域模型转换为视图对象
                            val statusInfoVOs = trendData.statusList.map { statusInfo ->
                                StatusInfoVO(
                                    id = statusInfo.id,
                                    name = statusInfo.name,
                                    color = statusInfo.color
                                )
                            }
                            
                            TaskStatusTrendVO(
                                timeLabels = trendData.timeLabels,
                                statusList = statusInfoVOs,
                                statusTrends = trendData.statusTrends
                            )
                        }

                    // 获取项目任务列表（取前5条）
                    val projectTasksMono = taskService.findTasksByProjectId(projectId, limit = 5)
                        .flatMap { task ->
                            Mono.zip(
                                taskService.findStatusById(task.statusId),
                                taskService.findPriorityById(task.priorityId),
                                task.assigneeId?.let { assigneeId -> userRepository.findById(assigneeId) } ?: Mono.empty()
                            ).map { tuple ->
                                val status = tuple.t1
                                val priority = tuple.t2
                                val assignee = tuple.t3
                                
                                TaskVO(
                                    id = task.id,
                                    title = task.title,
                                    description = task.description,
                                    statusId = status.id,
                                    status = status.name,
                                    statusColor = status.color,
                                    priority = priority.name,
                                    priorityColor = priority.color,
                                    assignee = assignee.username,
                                    startTime = task.startTime?.toString(),
                                    dueDate = task.dueDate?.toString(),
                                    createdAt = task.createdAt.toString(),
                                    hasAttachments = false, // 这里简化处理，不查询附件信息
                                    parentTaskId = task.parentTaskId
                                )
                            }
                        }
                        .collectList()
                        .doOnSuccess { tasks -> log.debug("获取到项目ID={}的任务列表，共{}条任务", projectId, tasks.size) }

                    // 获取项目成员列表（取前5名成员）
                    val membersMono = projectMemberRepository.list {
                        fieldOf(ProjectMember::projectId, ComparisonOperator.EQUALS, projectId)
                    }
                    .take(5)
                    .flatMap { member ->
                        userRepository.findById(member.userId)
                            .map { user ->
                                ProjectMemberSimpleVO(
                                    id = user.id!!,
                                    name = user.username
                                )
                            }
                    }
                    .collectList()
                    .doOnSuccess { members -> log.debug("获取到项目ID={}的成员列表，共{}位成员", projectId, members.size) }

                    // 并行执行所有查询，然后组合结果
                    Mono.zip(
                        memberCountMono,
                        taskCountsMono,
                        progressMono,
                        taskStatusTrendMono,
                        projectTasksMono,
                        membersMono
                    )
                        .doOnSuccess { _ -> log.debug("所有数据查询完成，开始组装项目详情视图对象") }
                        .map { tuple ->
                            val memberCount = tuple.t1.toInt()
                            val taskCounts = tuple.t2  // 实际的任务数量统计
                            val progress = tuple.t3    // 基于加权平均计算的进度
                            val taskStatusTrend = tuple.t4
                            val projectTasks = tuple.t5
                            val members = tuple.t6

                            ProjectDetailVO(
                                id = project.id!!,
                                name = project.name,
                                description = project.description,
                                teamId = project.teamId,
                                teamName = project.team?.name,
                                ownerId = project.creatorId,
                                ownerName = project.creator?.username ?: "未知用户",
                                memberCount = memberCount,
                                taskCount = taskCounts.first.toInt(),
                                completedTaskCount = taskCounts.second.toInt(),
                                progress = progress,
                                archived = project.archived,
                                createdAt = project.createdAt,
                                updatedAt = project.updatedAt,
                                taskStatusTrend = taskStatusTrend,
                                tasks = projectTasks,
                                members = members
                            )
                        }
                }
                .doOnSuccess { detail ->
                    log.info("成功获取项目详情，项目ID={}, 名称={}, 成员数={}, 任务数={}",
                        detail.id, detail.name, detail.memberCount, detail.taskCount)
                }
                .doOnError { error ->
                    when (error) {
                        is IllegalArgumentException ->
                            log.error("获取项目详情失败，项目不存在，项目ID={}", projectId)
                        is SecurityException ->
                            log.error("获取项目详情失败，用户无权限访问，用户ID={}, 项目ID={}", userId, projectId)
                        else ->
                            log.error("获取项目详情失败，项目ID={}, 错误: {}", projectId, error.message, error)
                    }
                }
        }
    }

    /**
     * 获取项目状态列表
     * 项目状态是系统级别的，但需要项目ID进行权限检查
     * 
     * @param projectId 项目ID
     * @return 项目状态列表
     */
    @RequireProjectPermission(
        permission = ProjectPermissions.PROJECT_VIEW,
        projectIdParam = "projectId"
    )
    fun getProjectStatusList(projectId: Long): Mono<List<ProjectStatusVO>> {
        log.info("获取项目状态列表，项目ID={}", projectId)
        
        return projectService.getAllProjectStatuses(projectId)
            .map { status ->
                ProjectStatusVO(
                    id = status.id,
                    name = status.name,
                    color = status.color,
                    order = status.displayOrder
                )
            }
            .collectList()
            .doOnSuccess { list -> log.debug("成功获取{}个项目状态，项目ID={}", list.size, projectId) }
            .doOnError { error -> log.error("获取项目状态列表失败，项目ID={}: {}", projectId, error.message, error) }
    }
    
    /**
     * 设置项目归档状态
     * 可用于归档项目或取消归档，根据传入的targetStatus参数决定
     * 
     * @param projectId 项目ID
     * @param targetStatus 目标归档状态，true表示归档，false表示取消归档
     * @param reason 操作原因（可选）
     * @return 操作结果，不返回具体内容
     */
    fun setProjectArchiveStatus(projectId: Long, targetStatus: Boolean, reason: String? = null): Mono<Void> {
        val actionName = if (targetStatus) "归档" else "取消归档"

        return securityUtils.withCurrentUserId { userId ->
            projectService.toggleProjectArchiveStatus(projectId, userId, targetStatus, reason)
                .then()
                .doOnSuccess { log.info("项目{}成功，项目ID={}", actionName, projectId) }
                .doOnError { e -> log.error("项目{}失败，项目ID={}: {}", actionName, projectId, e.message, e) }
        }
    }
    
    /**
     * 更新项目基本信息
     * 支持更新项目名称和描述
     *
     * @param projectId 项目ID
     * @param request 更新项目基本信息请求
     * @return 操作结果
     */
    @RequireProjectPermission(
        permission = ProjectPermissions.PROJECT_EDIT,
        projectIdParam = "projectId"
    )
    fun updateProject(projectId: Long, request: UpdateProjectBasicInfoRequest): Mono<Void> {
        log.info("更新项目基本信息，项目ID={}，名称={}，描述长度={}", projectId, request.name, request.description?.length ?: 0)
        
        val command = UpdateProjectCommand(
            id = projectId,
            name = request.name,
            description = request.description
        )
        return projectService.updateProject(command)
            .then()
            .doOnSuccess { log.info("项目基本信息更新成功，项目ID={}", projectId) }
            .doOnError { e -> log.error("项目基本信息更新失败，项目ID={}: {}", projectId, e.message) }
    }
    
    /**
     * 获取项目角色列表
     * 返回项目中所有可用的角色，包括ID、名称、描述等信息
     *
     * @param projectId 项目ID
     * @return 项目角色列表
     */
    @RequireProjectPermission(
        permission = ProjectPermissions.PROJECT_VIEW,
        projectIdParam = "projectId"
    )
    fun getProjectRoles(projectId: Long): Mono<List<ProjectRoleVO>> {
        log.info("获取项目角色列表，项目ID={}", projectId)
        
        // 使用仓库查询该项目的所有角色
        return projectRoleRepository.list {
            fieldOf(ProjectRole::projectId, ComparisonOperator.EQUALS, projectId)
        }
            .map { role ->
                // 将领域模型转换为视图对象
                ProjectRoleVO(
                    id = role.id,
                    name = role.name,
                    description = role.description,
                    isSystem = role.isSystem
                )
            }
            .collectList()
            .doOnSuccess { roles -> 
                log.debug("成功获取项目角色列表，项目ID={}，角色数量={}", projectId, roles.size)
            }
            .doOnError { error ->
                log.error("获取项目角色列表失败，项目ID={}: {}", projectId, error.message, error)
            }
    }
    
    /**
     * 创建项目角色
     * 
     * @param projectId 项目ID
     * @param request 创建项目角色请求
     * @return 创建的角色信息
     */
    @RequireProjectPermission(
        permission = ProjectPermissions.MEMBER_MANAGE,
        projectIdParam = "projectId"
    )
    fun createProjectRole(projectId: Long, request: CreateProjectRoleRequest): Mono<ProjectRoleVO> {
        log.info("创建项目角色，项目ID={}，角色名称={}", projectId, request.name)
        
        return projectRoleRepository.exists {
            fieldOf(ProjectRole::name, ComparisonOperator.EQUALS, request.name)
            fieldOf(ProjectRole::projectId, ComparisonOperator.EQUALS, projectId)
        }
        .flatMap { exists ->
            if (exists) {
                // 角色已存在，返回错误
                log.warn("创建角色失败，项目ID={}中已存在同名角色：{}", projectId, request.name)
                return@flatMap Mono.error<ProjectRoleVO>(
                    BusinessException(
                        ResponseCode.PROJECT_ROLE_NAME_EXISTED,
                        "项目下已存在同名角色：${request.name}"
                    )
                )
            }
            
            // 创建领域对象
            val role = ProjectRole(
                id = 0, // ID将由仓库生成
                projectId = projectId,
                name = request.name,
                description = request.description,
                code = null, // 默认为空
                sortOrder = 0, // 默认排序值
                isSystem = false, // 非系统预设角色
                permissions = emptyList(), // 默认无权限
                createdAt = OffsetDateTime.now(),
                updatedAt = OffsetDateTime.now(),
                version = 1
            )
            
            // 保存角色
            projectRoleRepository.save(role)
                .map { savedRole ->
                    // 转换为VO对象并返回
                    ProjectRoleVO(
                        id = savedRole.id,
                        name = savedRole.name,
                        description = savedRole.description,
                        isSystem = savedRole.isSystem
                    )
                }
        }
        .doOnSuccess {
            log.info("项目角色创建成功，角色ID={}，项目ID={}", it.id, projectId)
        }
        .doOnError { error ->
            log.error("项目角色创建失败，项目ID={}: {}", projectId, error.message, error)
        }
    }
    
    /**
     * 根据请求查询项目成员列表
     * 如果成员名称为空，则返回所有成员
     * 如果成员名称不为空，则返回名称包含该字符串的成员
     *
     * @param request 获取项目成员请求对象
     * @return 项目成员简化列表，只包含ID和名称
     */
    @RequireProjectPermission(
        permission = ProjectPermissions.PROJECT_VIEW,
        projectIdParam = "request.projectId"
    )
    fun getProjectMembers(request: GetProjectMembersRequest): Mono<List<ProjectMemberSimpleVO>> {
        log.info("根据名称查询项目成员列表，项目ID={}，成员名称={}", request.projectId, request.memberName)
        
        // 使用projectMemberRepository查询项目成员，过滤掉已删除的成员
        return projectMemberRepository.list {
            fieldOf(ProjectMember::projectId, ComparisonOperator.EQUALS, request.projectId)
            fieldOf(ProjectMember::deleted, ComparisonOperator.EQUALS, 0) // 只查询未删除的成员
        }
        .flatMap { member ->
            userRepository.findById(member.userId)
                .map { user ->
                    // 只返回ID和名称
                    ProjectMemberSimpleVO(
                        id = user.id!!,
                        name = user.username
                    )
                }
                .onErrorResume { error ->
                    log.warn("查询用户ID={}失败: {}", member.userId, error.message)
                    // 如果用户不存在，跳过该成员
                    Mono.empty()
                }
        }
        .filter { memberVO ->
            // 如果memberName为空，返回所有成员；否则只返回名称包含memberName的成员
            request.memberName.isNullOrBlank() || memberVO.name.contains(request.memberName, ignoreCase = true)
        }
        .collectList()
        .doOnSuccess { members ->
            log.debug("成功获取项目成员列表，项目ID={}，成员名称={}，符合条件的成员数量={}", 
                    request.projectId, request.memberName, members.size)
        }
        .onErrorResume { error ->
            log.error("获取项目成员列表失败，项目ID={}，成员名称={}: {}", 
                    request.projectId, request.memberName, error.message, error)
            Mono.just(emptyList())
        }
    }
    
    /**
     * 获取任务状态趋势数据
     * 根据时间范围统计项目中不同状态的任务数量随时间的变化
     *
     * @param request 任务趋势请求对象，包含项目ID和时间范围
     * @return 任务状态趋势视图对象
     */
    @RequireProjectPermission(
        permission = ProjectPermissions.PROJECT_TASK_STATS_VIEW,
        projectIdParam = "request.projectId"
    )
    fun getTaskStatusTrend(request: TaskTrendRequest): Mono<TaskStatusTrendVO> {
        log.info("获取任务状态趋势数据，项目ID={}, 时间范围={}", 
                request.projectId, request.timeRange)
        
        return taskService.getTaskStatusTrend(request.projectId, request.timeRange.name)
            .map { trendData -> 
                // 将领域模型转换为视图对象
                val statusInfoVOs = trendData.statusList.map { statusInfo ->
                    StatusInfoVO(
                        id = statusInfo.id,
                        name = statusInfo.name,
                        color = statusInfo.color
                    )
                }
                
                TaskStatusTrendVO(
                    timeLabels = trendData.timeLabels,
                    statusList = statusInfoVOs,
                    statusTrends = trendData.statusTrends
                )
            }
            .doOnSuccess { trend -> 
                log.debug("成功获取项目ID={}的任务状态趋势数据", request.projectId)
            }
            .doOnError { error ->
                log.error("获取项目ID={}的任务状态趋势数据失败: {}", 
                          request.projectId, error.message, error)
            }
    }
}