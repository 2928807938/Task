package com.task.application.service

import com.task.application.request.CreateTeamRequest
import com.task.application.utils.SecurityUtils
import com.task.application.vo.*
import com.task.domain.model.activity.ActivityTypeEnum
import com.task.domain.model.common.ComparisonOperator
import com.task.domain.model.common.fieldOf
import com.task.domain.model.project.Project
import com.task.domain.model.project.ProjectStatus
import com.task.domain.model.task.Task
import com.task.domain.model.team.Team
import com.task.domain.model.team.TeamMember
import com.task.domain.model.team.TeamRole
import com.task.domain.repository.ProjectRepository
import com.task.domain.repository.ProjectStatusRepository
import com.task.domain.repository.TaskRepository
import com.task.domain.repository.TeamRepository
import com.task.domain.repository.TeamMemberRepository
import com.task.domain.repository.TeamRoleRepository
import com.task.domain.service.ActivityLogService
import com.task.domain.service.TeamService
import com.task.domain.service.UserService
import org.slf4j.LoggerFactory
import org.springframework.stereotype.Service
import reactor.core.publisher.Flux
import reactor.core.publisher.Mono
import java.time.OffsetDateTime
import java.time.temporal.TemporalAdjusters
import java.util.*

/**
 * 团队首页应用服务
 * 负责聚合团队相关的数据，为团队首页提供综合信息
 */
@Service
class TeamApplicationService(
    private val teamService: TeamService,
    private val userService: UserService,
    private val activityLogService: ActivityLogService,
    private val securityUtils: SecurityUtils,
    private val taskRepository: TaskRepository,
    private val projectRepository: ProjectRepository,
    private val teamRepository: TeamRepository,
    private val teamMemberRepository: TeamMemberRepository,
    private val teamRoleRepository: TeamRoleRepository,
    private val projectStatusRepository: ProjectStatusRepository
) {
    private val log = LoggerFactory.getLogger(this::class.java)

    /**
     * 获取团队首页综合数据
     *
     * @param teamId 团队ID
     * @return 团队首页综合数据
     */
    fun getTeamHomePage(teamId: Long): Mono<TeamHomePageVO> {
        log.info("获取团队首页综合数据，teamId={}", teamId)

        val overviewMono = getTeamOverview(teamId)
        val heatmapMono = getTeamActivityHeatmap(teamId, null, null)
        val departmentMono = getTeamDepartmentStructure(teamId)
        val communicationsMono = getRecentCommunicationRecords(teamId, 10)

        return Mono.zip(overviewMono, heatmapMono, departmentMono, communicationsMono)
            .map { tuple ->
                TeamHomePageVO(
                    overview = tuple.t1,
                    activityHeatmap = tuple.t2,
                    departmentStructure = tuple.t3,
                    recentCommunications = tuple.t4
                )
            }
    }

    /**
     * 获取团队概览信息
     *
     * @param teamId 团队ID
     * @return 团队概览数据
     */
    fun getTeamOverview(teamId: Long): Mono<TeamOverviewVO> {
        log.info("获取团队概览信息，teamId={}", teamId)

        return securityUtils.withCurrentUserId { userId ->
            // 获取团队成员数量
            val totalMembersMono = teamService.countTeamMembers(teamId)

            // 获取团队成员增长率
            val memberGrowthRateMono = calculateTeamMemberGrowthRate(teamId)

            // 获取本月活跃度
            val monthlyActivityRateMono = calculateTeamMonthlyActivityRate(teamId)

            // 获取活跃度增长率
            val activityGrowthRateMono = calculateTeamActivityGrowthRate(teamId)

            // 获取任务完成率
            val taskCompletionRateMono = calculateTeamTaskCompletionRate(teamId)

            // 获取任务完成率变化
            val taskCompletionRateChangeMono = calculateTeamTaskCompletionRateChange(teamId)

            Mono.zip(
                totalMembersMono,
                memberGrowthRateMono,
                monthlyActivityRateMono,
                activityGrowthRateMono,
                taskCompletionRateMono,
                taskCompletionRateChangeMono
            )
                .map { tuple ->
                    TeamOverviewVO(
                        totalMembers = tuple.t1,
                        memberGrowthRate = tuple.t2,
                        monthlyActivityRate = tuple.t3,
                        activityGrowthRate = tuple.t4,
                        taskCompletionRate = tuple.t5,
                        taskCompletionRateChange = tuple.t6
                    )
                }
        }
    }

    /**
     * 计算团队成员增长率
     *
     * @param teamId 团队ID
     * @return 团队成员增长率（百分比）
     */
    private fun calculateTeamMemberGrowthRate(teamId: Long): Mono<Double> {
        // 获取当前团队成员数
        val currentMemberCountMono = teamService.countTeamMembers(teamId)

        // 获取上个月的团队成员数
        val lastMonthStart = OffsetDateTime.now().minusMonths(1).with(TemporalAdjusters.firstDayOfMonth())
        val lastMonthMemberCountMono = teamService.countTeamMembersAsOf(teamId, lastMonthStart)

        return Mono.zip(currentMemberCountMono, lastMonthMemberCountMono)
            .map { tuple ->
                val currentCount = tuple.t1
                val lastMonthCount = tuple.t2

                if (lastMonthCount > 0) {
                    ((currentCount - lastMonthCount).toDouble() / lastMonthCount) * 100
                } else {
                    // 如果上个月没有成员，则增长率为100%
                    100.0
                }
            }
    }

    /**
     * 计算团队月活跃度
     *
     * @param teamId 团队ID
     * @return 团队月活跃度（百分比）
     */
    private fun calculateTeamMonthlyActivityRate(teamId: Long): Mono<Double> {
        // 获取当前月份的开始时间
        val monthStart = OffsetDateTime.now().with(TemporalAdjusters.firstDayOfMonth())

        // 获取团队成员ID列表
        val teamMemberIdsMono = teamService.getTeamMemberIds(teamId)

        // 获取活跃成员数量（本月有活动记录的成员）
        val activeMemberCountMono = teamMemberIdsMono.flatMap { memberIds ->
            activityLogService.countActiveUsers(memberIds, monthStart, OffsetDateTime.now())
        }

        // 计算活跃度
        return Mono.zip(activeMemberCountMono, teamMemberIdsMono)
            .map { tuple ->
                val activeCount = tuple.t1
                val totalCount = tuple.t2.size

                if (totalCount > 0) {
                    (activeCount.toDouble() / totalCount) * 100
                } else {
                    0.0
                }
            }
    }

    /**
     * 计算团队活跃度增长率
     *
     * @param teamId 团队ID
     * @return 团队活跃度增长率（百分比）
     */
    private fun calculateTeamActivityGrowthRate(teamId: Long): Mono<Double> {
        // 获取当前月份的活跃度
        val currentActivityRateMono = calculateTeamMonthlyActivityRate(teamId)

        // 获取上个月的活跃度
        val lastMonthStart = OffsetDateTime.now().minusMonths(1).with(TemporalAdjusters.firstDayOfMonth())
        val lastMonthEnd = OffsetDateTime.now().with(TemporalAdjusters.firstDayOfMonth()).minusNanos(1)

        // 获取团队成员ID列表
        val teamMemberIdsMono = teamService.getTeamMemberIds(teamId)

        // 获取上个月活跃成员数量
        val lastMonthActiveMemberCountMono = teamMemberIdsMono.flatMap { memberIds ->
            activityLogService.countActiveUsers(memberIds, lastMonthStart, lastMonthEnd)
        }

        // 计算上个月活跃度
        val lastMonthActivityRateMono = Mono.zip(lastMonthActiveMemberCountMono, teamMemberIdsMono)
            .map { tuple ->
                val activeCount = tuple.t1
                val totalCount = tuple.t2.size

                if (totalCount > 0) {
                    (activeCount.toDouble() / totalCount) * 100
                } else {
                    0.0
                }
            }

        // 计算活跃度增长率
        return Mono.zip(currentActivityRateMono, lastMonthActivityRateMono)
            .map { tuple ->
                val currentRate = tuple.t1
                val lastMonthRate = tuple.t2

                if (lastMonthRate > 0) {
                    ((currentRate - lastMonthRate) / lastMonthRate) * 100
                } else if (currentRate > 0) {
                    // 如果上个月活跃度为0，当前月有活跃度，则增长率为100%
                    100.0
                } else {
                    // 如果两个月都为0，则增长率为0
                    0.0
                }
            }
    }

    /**
     * 计算团队任务完成率
     *
     * @param teamId 团队ID
     * @return 任务完成率（百分比）
     */
    fun calculateTeamTaskCompletionRate(teamId: Long): Mono<Double> {
        log.info("计算团队任务完成率: teamId={}", teamId)

        // 首先查询所有终止状态的ID
        return projectStatusRepository.list {
            fieldOf(ProjectStatus::isTerminal, ComparisonOperator.EQUALS, true)
        }.map { it.id }
            .collectList()
            .flatMap { terminalStatusIds ->
                // 查询团队下的所有项目
                projectRepository.list {
                    fieldOf(Project::teamId, ComparisonOperator.EQUALS, teamId)
                }.map { it.id }
                    .collectList()
                    .flatMap { projectIds ->
                        if (projectIds.isEmpty()) {
                            return@flatMap Mono.just(0.0)
                        }

                        // 查询这些项目下的所有任务
                        taskRepository.list {
                            fieldOf(Task::projectId, ComparisonOperator.IN, projectIds)
                        }.collectList()
                            .map { tasks ->
                                if (tasks.isEmpty()) {
                                    return@map 0.0
                                }

                                // 计算已完成任务数量
                                val completedTasks = tasks.count { task ->
                                    task.statusId in terminalStatusIds
                                }

                                // 计算完成率
                                (completedTasks.toDouble() / tasks.size) * 100
                            }
                    }
            }
            .doOnSuccess { rate ->
                log.info("团队任务完成率: teamId={}, rate={}", teamId, rate)
            }
            .onErrorResume { e ->
                log.error("计算团队任务完成率失败: teamId={}, 错误: {}", teamId, e.message, e)
                Mono.just(0.0)
            }
    }

    /**
     * 计算团队任务完成率变化
     *
     * @param teamId 团队ID
     * @return 团队任务完成率变化（百分比）
     */
    private fun calculateTeamTaskCompletionRateChange(teamId: Long): Mono<Double> {
        // 获取当前任务完成率
        val currentCompletionRateMono = calculateTeamTaskCompletionRate(teamId)

        // 获取上个月的任务完成率
        val lastMonthStart = OffsetDateTime.now().minusMonths(1).with(TemporalAdjusters.firstDayOfMonth())
        val lastMonthEnd = OffsetDateTime.now().with(TemporalAdjusters.firstDayOfMonth()).minusNanos(1)

        val lastMonthCompletionRateMono = calculateTeamTaskCompletionRateInPeriod(
            teamId, lastMonthStart, lastMonthEnd
        )

        // 计算完成率变化
        return Mono.zip(currentCompletionRateMono, lastMonthCompletionRateMono)
            .map { tuple ->
                val currentRate = tuple.t1
                val lastMonthRate = tuple.t2

                if (lastMonthRate > 0) {
                    currentRate - lastMonthRate
                } else {
                    // 如果上个月没有数据，则返回0（无变化）
                    0.0
                }
            }
    }

    /**
     * 计算指定时间段内的团队任务完成率
     *
     * @param teamId 团队ID
     * @param startDate 开始日期
     * @param endDate 结束日期
     * @return 任务完成率（百分比）
     */
    fun calculateTeamTaskCompletionRateInPeriod(
        teamId: Long,
        startDate: OffsetDateTime,
        endDate: OffsetDateTime
    ): Mono<Double> {
        log.info("计算指定时间段内的团队任务完成率: teamId={}, startDate={}, endDate={}", teamId, startDate, endDate)

        // 首先查询所有终止状态的ID
        return projectStatusRepository.list {
            fieldOf(ProjectStatus::isTerminal, ComparisonOperator.EQUALS, true)
        }.map { it.id }
            .collectList()
            .flatMap { terminalStatusIds ->
                // 查询团队下的所有项目
                projectRepository.list {
                    fieldOf(Project::teamId, ComparisonOperator.EQUALS, teamId)
                }.map { it.id }
                    .collectList()
                    .flatMap { projectIds ->
                        if (projectIds.isEmpty()) {
                            return@flatMap Mono.just(0.0)
                        }

                        // 查询这些项目下在指定时间段内创建的所有任务
                        taskRepository.list {
                            fieldOf(Task::projectId, ComparisonOperator.IN, projectIds)
                            fieldOf(Task::createdAt, ComparisonOperator.GREATER_OR_EQUAL, startDate)
                            fieldOf(Task::createdAt, ComparisonOperator.LESS_OR_EQUAL, endDate)
                        }.collectList()
                            .map { tasks ->
                                if (tasks.isEmpty()) {
                                    return@map 0.0
                                }

                                // 计算已完成任务数量
                                val completedTasks = tasks.count { task ->
                                    task.statusId in terminalStatusIds
                                }

                                // 计算完成率
                                (completedTasks.toDouble() / tasks.size) * 100
                            }
                    }
            }
            .doOnSuccess { rate ->
                log.info("指定时间段内的团队任务完成率: teamId={}, startDate={}, endDate={}, rate={}",
                    teamId, startDate, endDate, rate)
            }
            .onErrorResume { e ->
                log.error("计算指定时间段内的团队任务完成率失败: teamId={}, startDate={}, endDate={}, 错误: {}",
                    teamId, startDate, endDate, e.message, e)
                Mono.just(0.0)
            }
    }

    /**
     * 获取团队活跃度热力图数据
     *
     * @param teamId 团队ID
     * @param startDate 开始日期（可选，默认为过去30天）
     * @param endDate 结束日期（可选，默认为当前日期）
     * @return 热力图数据点列表
     */
    fun getTeamActivityHeatmap(
        teamId: Long,
        startDate: OffsetDateTime?,
        endDate: OffsetDateTime?
    ): Mono<List<ActivityHeatmapPointVO>> {
        log.info("获取团队活跃度热力图数据，teamId={}，startDate={}，endDate={}", teamId, startDate, endDate)

        // 设置默认时间范围
        val actualStartDate = startDate ?: OffsetDateTime.now().minusDays(30)
        val actualEndDate = endDate ?: OffsetDateTime.now()

        return securityUtils.withCurrentUserId { userId ->
            // 获取团队成员ID列表
            teamService.getTeamMemberIds(teamId)
                .flatMap { memberIds ->
                    // 获取指定时间范围内的活动日志
                    activityLogService.getActivitiesByActors(memberIds, actualStartDate, actualEndDate)
                }
                .map { activities ->
                    // 按星期和小时分组，计算每个时间点的活动数量
                    val heatmapData = mutableMapOf<Pair<Int, Int>, Int>()

                    // 初始化热力图数据（所有时间点都设为0）
                    for (day in 1..7) {
                        for (hour in 0..23) {
                            heatmapData[Pair(day, hour)] = 0
                        }
                    }

                    // 统计活动数量
                    activities.forEach { activity ->
                        val createdAt = activity.createdAt ?: return@forEach
                        val dayOfWeek = createdAt.dayOfWeek.value
                        val hour = createdAt.hour

                        val key = Pair(dayOfWeek, hour)
                        heatmapData[key] = (heatmapData[key] ?: 0) + 1
                    }

                    // 转换为VO对象
                    heatmapData.map { (key, value) ->
                        ActivityHeatmapPointVO(
                            dayOfWeek = key.first,
                            hour = key.second,
                            value = value
                        )
                    }
                }
        }
    }

    /**
     * 获取团队部门结构
     *
     * @param teamId 团队ID
     * @return 部门结构树
     */
    fun getTeamDepartmentStructure(teamId: Long): Mono<List<DepartmentVO>> {
        log.info("获取团队部门结构，teamId={}", teamId)

        return securityUtils.withCurrentUserId { userId ->
            // 模拟部门数据（实际应用中应从数据库获取）
            // 这里我们根据界面上显示的部门结构创建模拟数据
            Mono.just(
                listOf(
                    DepartmentVO(
                        id = 1,
                        name = "研发部",
                        memberCount = 45,
                        subDepartments = listOf(
                            DepartmentVO(id = 11, name = "前端组", memberCount = 15),
                            DepartmentVO(id = 12, name = "后端组", memberCount = 20),
                            DepartmentVO(id = 13, name = "测试组", memberCount = 10)
                        )
                    ),
                    DepartmentVO(
                        id = 2,
                        name = "产品部",
                        memberCount = 28
                    ),
                    DepartmentVO(
                        id = 3,
                        name = "设计部",
                        memberCount = 18
                    )
                )
            )
        }
    }

    /**
     * 获取最近沟通记录
     *
     * @param teamId 团队ID
     * @param limit 记录数量限制（默认10条）
     * @return 沟通记录列表
     */
    fun getRecentCommunicationRecords(
        teamId: Long,
        limit: Int = 10
    ): Mono<List<CommunicationRecordVO>> {
        log.info("获取最近沟通记录，teamId={}，limit={}", teamId, limit)

        return securityUtils.withCurrentUserId { userId ->
            // 获取团队成员ID列表
            teamService.getTeamMemberIds(teamId)
                .flatMap { memberIds ->
                    // 获取最近的沟通相关活动
                    activityLogService.getRecentActivitiesByType(
                        actorIds = memberIds,
                        activityTypes = listOf(
                            ActivityTypeEnum.TASK_COMMENTED,
                            ActivityTypeEnum.TEAM_MEMBER_ADDED
                        ),
                        limit = limit
                    )
                }
                .flatMap { activities ->
                    // 收集所有活动的执行者ID
                    val actorIds = activities.map { it.actorId }.distinct()

                    // 查询用户信息
                    userService.batchGetUserInfo(actorIds)
                        .map { userMap ->
                            // 转换为VO对象
                            activities.map { activity ->
                                val user = userMap[activity.actorId]

                                CommunicationRecordVO(
                                    id = activity.id,
                                    senderId = activity.actorId,
                                    senderName = user?.profile?.fullName ?: user?.username ?: "未知用户",
                                    content = activity.formatDescription(emptyMap()), // 使用活动描述作为消息内容
                                    sentAt = activity.createdAt ?: OffsetDateTime.now(),
                                    unreadCount = if (activity.actorId != userId) 1 else null // 如果不是当前用户发送的，则标记为未读
                                )
                            }
                        }
                }
        }
    }
    
    /**
     * 获取当前用户的团队列表
     *
     * @param keyword 搜索关键词，用于筛选团队名称或描述，为空时返回所有团队
     * @return 团队简要信息列表
     */
    fun getCurrentUserTeams(keyword: String?): Mono<List<TeamSimpleVO>> {
        log.info("获取当前用户的团队列表，keyword={}", keyword)

        return securityUtils.withCurrentUserId { userId ->
            // 查询用户所在的所有团队
            teamService.getUserTeamIds(userId)
                .flatMapMany { teamIds ->
                    if (teamIds.isEmpty()) {
                        log.info("用户不属于任何团队: userId={}", userId)
                        return@flatMapMany Flux.empty<TeamSimpleVO>()
                    }
                    
                    // 查询团队详细信息
                    teamRepository.list {
                        fieldOf(Team::id, ComparisonOperator.IN, teamIds)
                        // 如果有关键词，则添加模糊搜索条件
                        if (!keyword.isNullOrBlank()) {
                            val lowerKeyword = keyword.lowercase(Locale.getDefault())
                            fieldOf(Team::name, ComparisonOperator.LIKE, "%$lowerKeyword%")
                        }
                    }
                        .map { TeamSimpleVO.fromDomain(it) }
                }
                .collectList()
                .doOnSuccess { teams ->
                    log.info("成功获取当前用户的团队列表: userId={}, count={}", userId, teams.size) 
                }
                .onErrorResume { e ->
                    log.error("获取当前用户的团队列表失败: userId={}, 错误: {}", userId, e.message, e)
                    Mono.just(emptyList())
                }
        }
    }
    
    /**
     * 创建新团队
     *
     * @param request 创建团队请求
     * @return 创建的团队信息
     */
    fun createTeam(request: CreateTeamRequest): Mono<TeamSimpleVO> {
        log.info("应用服务 - 创建新团队: name={}", request.name)
        
        return securityUtils.withCurrentUserId { userId ->
            // 调用领域服务创建团队
            teamService.createTeam(request.name, request.description, userId)
                .map { team -> 
                    // 将领域模型转换为视图对象
                    TeamSimpleVO.fromDomain(team) 
                }
        }
        .doOnSuccess { teamVO ->
            log.info("成功创建团队: id={}, name={}", teamVO.id, teamVO.name)
        }
        .onErrorResume { e ->
            log.error("创建团队失败: name={}, 错误: {}", request.name, e.message, e)
            Mono.error(e)
        }
    }
    
    /**
     * 获取团队成员列表
     *
     * @param teamId 团队ID
     * @param memberName 成员名称（可选，用于模糊查询）
     * @return 团队成员列表
     */
    fun getTeamMembers(teamId: Long, memberName: String? = null): Mono<List<TeamMemberVO>> {
        log.info("获取团队成员列表: teamId={}, memberName={}", teamId, memberName)
        
        return securityUtils.withCurrentUserId { userId ->
            // 首先验证用户是否有权限访问该团队
            teamService.getUserTeamIds(userId)
                .flatMap { userTeamIds ->
                    if (!userTeamIds.contains(teamId)) {
                        log.warn("用户无权限访问团队: userId={}, teamId={}", userId, teamId)
                        return@flatMap Mono.just(emptyList<TeamMemberVO>())
                    }
                    
                    // 获取团队成员列表
                    teamMemberRepository.list {
                        fieldOf(TeamMember::teamId, ComparisonOperator.EQUALS, teamId)
                    }
                        .collectList()
                        .flatMap { teamMembers ->
                            if (teamMembers.isEmpty()) {
                                return@flatMap Mono.just(emptyList<TeamMemberVO>())
                            }
                            
                            // 收集所有用户ID和角色ID
                            val userIds = teamMembers.map { it.userId }.distinct()
                            val roleIds = teamMembers.map { it.roleId }.distinct()
                            
                            // 并行查询用户信息和角色信息
                            val userInfoMono = userService.batchGetUserInfo(userIds)
                            val roleInfoMono = teamRoleRepository.list {
                                fieldOf(TeamRole::id, ComparisonOperator.IN, roleIds)
                            }.collectList()
                            
                            Mono.zip(userInfoMono, roleInfoMono)
                                .map { tuple ->
                                    val userMap = tuple.t1
                                    val roleMap = tuple.t2.associateBy { it.id }
                                    
                                    // 转换为VO对象
                                    teamMembers.mapNotNull { teamMember ->
                                        val user = userMap[teamMember.userId]
                                        val role = roleMap[teamMember.roleId]
                                        
                                        // 如果指定了成员名称进行过滤
                                        if (!memberName.isNullOrBlank()) {
                                            val username = user?.username ?: ""
                                            val fullName = user?.profile?.fullName ?: ""
                                            val searchKeyword = memberName.lowercase()
                                            
                                            if (!username.lowercase().contains(searchKeyword) && 
                                                !fullName.lowercase().contains(searchKeyword)) {
                                                return@mapNotNull null
                                            }
                                        }
                                        
                                        TeamMemberVO.fromDomain(
                                            teamMember = teamMember,
                                            username = user?.username ?: "未知用户",
                                            fullName = user?.profile?.fullName,
                                            email = user?.email,
                                            roleName = role?.name
                                        )
                                    }
                                }
                        }
                }
                .doOnSuccess { members ->
                    log.info("成功获取团队成员列表: teamId={}, count={}", teamId, members.size)
                }
                .onErrorResume { e ->
                    log.error("获取团队成员列表失败: teamId={}, 错误: {}", teamId, e.message, e)
                    Mono.just(emptyList())
                }
        }
    }
}