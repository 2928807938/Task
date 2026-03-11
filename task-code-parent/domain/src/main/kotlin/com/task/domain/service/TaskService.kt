package com.task.domain.service

import com.task.domain.command.ChangeStatusCommand
import com.task.domain.command.EditTaskCommand
import com.task.domain.event.task.TaskEventPublisher
import com.task.domain.event.task.TaskType
import com.task.domain.model.common.*
import com.task.domain.model.project.ProjectStatus
import com.task.domain.model.project.ProjectStatusMapping
import com.task.domain.model.project.config.CustomPriorityItem
import com.task.domain.model.project.config.ProjectConfig
import com.task.domain.model.task.*
import com.task.domain.repository.*
import com.task.domain.service.strategy.TaskEditStrategy
import org.slf4j.LoggerFactory
import org.springframework.stereotype.Service
import reactor.core.publisher.Flux
import reactor.core.publisher.Mono
import java.time.*
import java.time.format.DateTimeFormatter
import java.time.temporal.WeekFields

/**
 * 任务服务
 * 负责处理与任务、任务标签、任务评论、时间记录相关的领域逻辑
 */
@Service
class TaskService(
    private val taskRepository: TaskRepository,
    private val projectStatusRepository: ProjectStatusRepository,
    private val priorityRepository: PriorityRepository,
    private val taskDependencyService: TaskDependencyService,
    private val projectStatusMappingRepository: ProjectStatusMappingRepository,
    private val taskHistoryRepository: TaskHistoryRepository,
    private val taskHistoryService: TaskHistoryService,
    private val taskEventPublisher: TaskEventPublisher,
    private val taskEditStrategies: List<TaskEditStrategy>
) {

    private val log = LoggerFactory.getLogger(this::class.java)

    /**
     * 初始化项目优先级体系
     * 根据配置创建项目的优先级体系，支持三种类型：标准(standard)、高级(advanced)、自定义(custom)
     *
     * @param projectId 项目 ID
     * @param config 项目配置对象
     * @return 初始化结果
     */
    fun initProjectPrioritySystem(projectId: Long, config: ProjectConfig): Mono<Void> {
        log.info("初始化项目优先级体系，项目 ID={}, 优先级体系类型={}", projectId, config.prioritySystem)
        
        // 先检查项目是否已有优先级设置，避免重复初始化
        return priorityRepository.list {
            fieldOf(Priority::projectId, ComparisonOperator.EQUALS, projectId)
        }
        .collectList()
        .flatMap { existingPriorities ->
            if (existingPriorities.isNotEmpty()) {
                log.info("项目ID={}已经有{}个优先级项，跳过初始化", projectId, existingPriorities.size)
                return@flatMap Mono.empty<Void>()
            }
            
            // 根据优先级体系类型初始化
            when (config.prioritySystem) {
                "standard" -> {
                    log.debug("使用标准优先级体系，项目 ID={}", projectId)
                    initStandardPrioritySystem(projectId)
                }
                "advanced" -> {
                    log.debug("使用高级优先级体系，项目 ID={}", projectId)
                    initAdvancedPrioritySystem(projectId)
                }
                "custom" -> {
                    log.debug("使用自定义优先级体系，项目 ID={}, 自定义项数量={}", projectId, config.customPriorityItems.size)
                    initCustomPrioritySystem(projectId, config.customPriorityItems)
                }
                else -> {
                    log.warn("未知的优先级体系类型: {}，项目 ID={}，默认使用标准优先级体系", config.prioritySystem, projectId)
                    initStandardPrioritySystem(projectId)
                }
            }
        }
    }

    /**
     * 初始化标准优先级体系
     * 创建高(#EF4444)、中(#F59E0B)、低(#10B981)三个优先级级别
     *
     * @param projectId 项目 ID
     * @return 初始化结果
     */
    private fun initStandardPrioritySystem(projectId: Long): Mono<Void> {
        log.info("初始化标准优先级体系，项目 ID={}", projectId)
        
        val now = OffsetDateTime.now()
        val priorities = listOf(
            Priority(
                id = 0, // 会由数据库自动生成
                projectId = projectId,
                name = "高优先级",
                level = 1,
                score = 90,
                color = "#F44336",
                createdAt = now,
                updatedAt = now,
                version = 1
            ),
            Priority(
                id = 0, // 会由数据库自动生成
                projectId = projectId,
                name = "中优先级",
                level = 2,
                score = 50,
                color = "#FF9800",
                createdAt = now,
                updatedAt = now,
                version = 1
            ),
            Priority(
                id = 0, // 会由数据库自动生成
                projectId = projectId,
                name = "低优先级",
                level = 3,
                score = 20,
                color = "#2196F3",
                createdAt = now,
                updatedAt = now,
                version = 1
            )
        )
        
        return savePriorities(priorities)
            .doOnSuccess { log.info("标准优先级体系初始化成功，项目 ID={}", projectId) }
            .doOnError { e -> log.error("标准优先级体系初始化失败，项目 ID={}: {}", projectId, e.message, e) }
            .then()
    }
    
    /**
     * 初始化高级优先级体系
     * 创建紧急(#DC2626)、重要(#F97316)、中等(#F59E0B)、一般(#3B82F6)、低优先级(#10B981)五个优先级级别
     *
     * @param projectId 项目 ID
     * @return 初始化结果
     */
    private fun initAdvancedPrioritySystem(projectId: Long): Mono<Void> {
        log.info("初始化高级优先级体系，项目 ID={}", projectId)
        
        val now = OffsetDateTime.now()
        val priorities = listOf(
            Priority(
                id = 0, // 会由数据库自动生成
                projectId = projectId,
                name = "紧急",
                level = 1,
                score = 95,
                color = "#F44336",
                createdAt = now,
                updatedAt = now,
                version = 1
            ),
            Priority(
                id = 0, // 会由数据库自动生成
                projectId = projectId,
                name = "重要",
                level = 2,
                score = 80,
                color = "#E91E63",
                createdAt = now,
                updatedAt = now,
                version = 1
            ),
            Priority(
                id = 0, // 会由数据库自动生成
                projectId = projectId,
                name = "普通",
                level = 3,
                score = 60,
                color = "#FF9800",
                createdAt = now,
                updatedAt = now,
                version = 1
            ),
            Priority(
                id = 0, // 会由数据库自动生成
                projectId = projectId,
                name = "次要",
                level = 4,
                score = 40,
                color = "#2196F3",
                createdAt = now,
                updatedAt = now,
                version = 1
            ),
            Priority(
                id = 0, // 会由数据库自动生成
                projectId = projectId,
                name = "低优先级",
                level = 5,
                score = 20,
                color = "#4CAF50",
                createdAt = now,
                updatedAt = now,
                version = 1
            )
        )
        
        return savePriorities(priorities)
            .doOnSuccess { log.info("高级优先级体系初始化成功，项目 ID={}", projectId) }
            .doOnError { e -> log.error("高级优先级体系初始化失败，项目 ID={}: {}", projectId, e.message, e) }
            .then()
    }
    
    /**
     * 初始化自定义优先级体系
     * 根据用户自定义的优先级项创建优先级体系
     *
     * @param projectId 项目 ID
     * @param customItems 自定义优先级项列表
     * @return 初始化结果
     */
    private fun initCustomPrioritySystem(projectId: Long, customItems: List<CustomPriorityItem>): Mono<Void> {
        log.info("初始化自定义优先级体系，项目 ID={}, 自定义项数量={}", projectId, customItems.size)
        
        // 如果没有自定义项，使用标准优先级体系
        if (customItems.isEmpty()) {
            log.info("自定义优先级项为空，使用标准优先级体系，项目 ID={}", projectId)
            return initStandardPrioritySystem(projectId)
        }
        
        val now = OffsetDateTime.now()
        val priorities = customItems.mapIndexed { index, item ->
            val name = item.name
            val color = item.color
            val level = customItems.size - index // 级别从高到低
            val score = calculateScore(level, 1, customItems.size) // 计算归一化分数
            
            Priority(
                id = 0, // 会由数据库自动生成
                projectId = projectId,
                name = name,
                level = level,
                score = score,
                color = color,
                createdAt = now,
                updatedAt = now,
                version = 1
            )
        }
        
        return savePriorities(priorities)
            .doOnSuccess { log.info("自定义优先级体系初始化成功，项目ID={}, 创建了{}个优先级项", projectId, priorities.size) }
            .doOnError { e -> log.error("自定义优先级体系初始化失败，项目ID={}: {}", projectId, e.message, e) }
            .then()
    }
    
    /**
     * 计算优先级分数
     * 将优先级级别转换为0-100的分数
     *
     * @param level 当前级别
     * @param minLevel 最小级别
     * @param maxLevel 最大级别
     * @return 0-100之间的分数
     */
    private fun calculateScore(level: Int, minLevel: Int, maxLevel: Int): Int {
        // 如果只有一个级别，返回默认分数
        if (maxLevel == minLevel) return 50
        
        // 归一化计算，分数 = ((level - minLevel) * 100) / (maxLevel - minLevel)
        return ((level - minLevel) * 100) / (maxLevel - minLevel)
    }
    
    /**
     * 批量保存优先级配置
     *
     * @param priorities 要保存的优先级列表
     * @return 保存成功的优先级列表
     */
    private fun savePriorities(priorities: List<Priority>): Mono<List<Priority>> {
        return Flux.fromIterable(priorities)
            .flatMap { priority -> priorityRepository.save(priority) }
            .collectList()
    }

    /**
     * 统计项目中的任务总数和已完成任务数
     * 仅统计子任务和没有子任务的主任务，避免重复计算
     * 
     * @param projectId 项目ID
     * @return 包含总任务数和已完成任务数的Pair对象
     */
    fun countProjectTasks(projectId: Long): Mono<Pair<Long, Long>> {
        log.info("开始统计项目任务数量，项目ID={}", projectId)
        
        // 查询项目下的所有任务
        return taskRepository.list {
            fieldOf(Task::projectId, ComparisonOperator.EQUALS, projectId)
        }.collectList()
        .flatMap { tasks ->
            log.info("项目ID={} 共查询到 {} 个任务", projectId, tasks.size)
            
            // 如果没有任务，直接返回0
            if (tasks.isEmpty()) {
                log.debug("项目ID={} 没有任务", projectId)
                return@flatMap Mono.just(Pair(0L, 0L))
            }
            
            // 创建任务ID到子任务的映射
            val taskIdToSubTasks = tasks.filter { it.parentTaskId != null }
                .groupBy { it.parentTaskId }
            
            // 预先查询所有状态，获取终止状态ID列表
            projectStatusRepository.list {
                fieldOf(ProjectStatus::isTerminal, ComparisonOperator.EQUALS, true)
            }.map { it.id }
            .collectList()
            .flatMap { terminalStatusIds ->
                log.debug("获取到终止状态ID列表: {}", terminalStatusIds)
                
                // 获取符合统计条件的任务：子任务或者没有子任务的主任务
                val tasksToCount = tasks.filter { task ->
                    // 如果是子任务，计入统计
                    task.parentTaskId != null || 
                    // 如果是主任务但没有子任务，也计入统计
                    (task.parentTaskId == null && !taskIdToSubTasks.containsKey(task.id))
                }
                
                log.debug("符合统计条件的任务数量: {}", tasksToCount.size)
                
                // 统计已完成的任务数量
                val completedTaskCount = tasksToCount.count { task -> 
                    task.status?.isTerminal == true || 
                        (task.statusId != null && terminalStatusIds.contains(task.statusId))
                }
                
                log.info("项目ID={} 的任务统计结果: 总任务数={}, 已完成任务数={}", 
                        projectId, tasksToCount.size, completedTaskCount)
                
                // 返回总任务数和已完成任务数
                Mono.just(Pair(tasksToCount.size.toLong(), completedTaskCount.toLong()))
            }
        }
    }
    
    /**
     * 计算项目的加权进度
     * 采用更精确的进度计算方式，考虑每个任务的实际进度
     * 
     * @param projectId 项目ID
     * @return 包含总权重(总任务数*100)和已完成权重(各任务进度之和)的Pair对象
     */
    fun calculateProjectProgress(projectId: Long): Mono<Pair<Long, Long>> {
        log.info("开始计算项目加权进度，项目ID={}", projectId)
        
        // 查询项目下的所有任务
        return taskRepository.list {
            fieldOf(Task::projectId, ComparisonOperator.EQUALS, projectId)
        }.collectList()
        .flatMap { tasks ->
            log.info("项目ID={} 共查询到 {} 个任务", projectId, tasks.size)
            
            // 如果没有任务，直接返回0
            if (tasks.isEmpty()) {
                log.debug("项目ID={} 没有任务", projectId)
                return@flatMap Mono.just(Pair(0L, 0L))
            }
            
            // 将任务按父任务ID分组
            val tasksByParentId = tasks.groupBy { it.parentTaskId }
            
            // 获取所有主任务（没有父任务的任务）
            val mainTasks = tasks.filter { it.parentTaskId == null }
            
            log.debug("项目ID={} 共有 {} 个主任务", projectId, mainTasks.size)
            
            // 如果没有主任务，直接返回0
            if (mainTasks.isEmpty()) {
                return@flatMap Mono.just(Pair(0L, 0L))
            }
            
            // 计算所有主任务的进度
            val mainTaskProgressFlux = Flux.fromIterable(mainTasks)
                .flatMap { mainTask ->
                    calculateTaskProgress(mainTask)
                        .doOnSuccess { progress ->
                            log.debug("主任务ID={}, 标题='{}': 计算进度={}%", 
                                    mainTask.id, mainTask.title, progress)
                        }
                        .map { progress -> Pair(mainTask, progress) }
                }
                .collectList()
            
            mainTaskProgressFlux.map { mainTasksWithProgress ->
                // 每个主任务的权重为1，总权重为主任务数 * 100
                val totalWeight = mainTasksWithProgress.size * 100L
                
                // 计算已完成的权重：各主任务进度之和
                val completedWeight = mainTasksWithProgress.sumOf { (_, progress) -> progress.toLong() }
                
                // 计算项目总体进度百分比
                val progressPercent = if (totalWeight > 0) (completedWeight * 100 / totalWeight) else 0
                
                log.info("项目ID={} 的进度计算结果: 总主任务数={}, 总权重={}, 已完成权重={}, 进度={}%", 
                        projectId, mainTasksWithProgress.size, totalWeight, completedWeight, progressPercent)
                
                // 返回总权重和已完成权重，上层应用可以基于这些值计算百分比
                Pair(totalWeight, completedWeight)
            }
        }
    }

    /**
     * 获取任务统计数据
     */
    fun getTaskStatistics(projectId: Long): Mono<TaskStatisticsData> {
        log.info("获取项目任务统计数据，项目ID={}", projectId)

        return Mono.zip(
            getCurrentTaskStats(projectId),
            getTaskPriorityStats(projectId),
            getTaskCompletionTrend(projectId),
            getTaskEfficiencyMetrics(projectId)
        ).map { tuple ->
            val currentTaskStats = tuple.t1
            val taskPriorityStats = tuple.t2
            val taskCompletionTrend = tuple.t3
            val taskEfficiencyMetrics = tuple.t4

            TaskStatisticsData(
                currentTaskStats,
                taskPriorityStats,
                taskCompletionTrend,
                taskEfficiencyMetrics
            )
        }
    }

    /**
     * 获取当前任务状态分布
     * 仅统计子任务和没有子任务的主任务，避免重复计算
     */
    private fun getCurrentTaskStats(projectId: Long): Mono<TaskStatusStats> {
        // 1. 查询项目中的所有任务
        val tasksMono = taskRepository.list {
            fieldOf(Task::projectId, ComparisonOperator.EQUALS, projectId)
        }.collectList()

        // 2. 首先查询项目关联的状态ID（通过ProjectStatusMapping中间表）
        val statusIdsMono = projectStatusMappingRepository.list {
            fieldOf(ProjectStatusMapping::projectId, ComparisonOperator.EQUALS, projectId)
        }.map { it.statusId }.collectList()

        // 3. 然后根据状态ID查询状态详细信息
        val statusesMono = statusIdsMono.flatMap { statusIds ->
            if (statusIds.isEmpty()) {
                log.warn("项目没有关联任何状态，项目ID={}", projectId)
                return@flatMap Mono.just(emptyList<ProjectStatus>())
            }
            
            projectStatusRepository.list {
                fieldOf(ProjectStatus::id, ComparisonOperator.IN, statusIds)
                orderBy(asc(ProjectStatus::displayOrder))
            }.collectList()
        }

        // 4. 组合查询结果
        return Mono.zip(tasksMono, statusesMono)
            .map { tuple ->
                val tasks = tuple.t1
                val statuses = tuple.t2
                
                // 创建任务ID到子任务的映射
                val taskIdToSubTasks = tasks.filter { it.parentTaskId != null }
                    .groupBy { it.parentTaskId }
                
                // 获取符合统计条件的任务：子任务或者没有子任务的主任务
                val tasksToCount = tasks.filter { task ->
                    // 如果是子任务，计入统计
                    task.parentTaskId != null || 
                    // 如果是主任务但没有子任务，也计入统计
                    (task.parentTaskId == null && !taskIdToSubTasks.containsKey(task.id))
                }

                val total = tasksToCount.size
                
                log.debug("符合统计条件的任务数量: {}", total)

                // 已完成任务：statusId对应的状态是终止状态
                val completedStatusIds = statuses.filter { it.isTerminal }.map { it.id }
                val completed = tasksToCount.count { it.statusId in completedStatusIds }

                // 待处理任务：statusId对应的是默认状态（通常是第一个状态）
                val pendingStatusIds = statuses.filter { it.isDefault }.map { it.id }
                val pending = tasksToCount.count { it.statusId in pendingStatusIds }

                // 进行中任务：其他任务
                val inProgress = total - completed - pending

                // 计算每个状态ID下的任务数量
                val statusCounts = tasksToCount.groupBy { it.statusId }.mapValues { it.value.size }
                
                log.debug("任务状态分布统计详情：项目ID={}, 总任务={}, 已完成={}, 进行中={}, 待处理={}", 
                         projectId, total, completed, inProgress, pending)

                TaskStatusStats(total, completed, inProgress, pending, statusCounts)
            }
    }

    /**
     * 获取任务完成趋势（最近30天）
     */
    private fun getTaskCompletionTrend(projectId: Long): Mono<List<DailyTaskStats>> {
        val endDate = OffsetDateTime.now()
        val startDate = endDate.minusDays(29) // 获取最近30天的数据

        // 查询指定时间范围内的任务
        return taskRepository.list {
            fieldOf(Task::projectId, ComparisonOperator.EQUALS, projectId)
            fieldOf(Task::createdAt, ComparisonOperator.GREATER_OR_EQUAL, startDate)
            fieldOf(Task::createdAt, ComparisonOperator.LESS_OR_EQUAL, endDate)
        }
            .collectList()
            .flatMap { tasks ->
                // 查询所有任务状态
                projectStatusRepository.list<ProjectStatus> {}.collectList()
                    .map { statuses ->
                        val statusMap = statuses.associateBy { it.id }
                        val dateFormat = DateTimeFormatter.ofPattern("yyyy-MM-dd")

                        // 生成日期范围
                        val dateRange = (0..29).map {
                            startDate.plusDays(it.toLong()).format(dateFormat)
                        }

                        // 计算每天的任务统计
                        dateRange.map { date ->
                            val dateStart = LocalDate.parse(date).atStartOfDay().atOffset(ZoneOffset.UTC)
                            val dateEnd = dateStart.plusDays(1).minusNanos(1)

                            val createdTasks = tasks.count { task ->
                                task.createdAt >= dateStart && task.createdAt <= dateEnd
                            }

                            val completedTasks = tasks.count { task ->
                                val status = statusMap[task.statusId]
                                status?.isTerminal == true &&
                                        task.updatedAt != null &&
                                        task.updatedAt!! >= dateStart &&
                                        task.updatedAt!! <= dateEnd
                            }

                            DailyTaskStats(date, completedTasks, createdTasks)
                        }
                    }
            }
    }

    /**
     * 获取任务效率指标
     */
    private fun getTaskEfficiencyMetrics(projectId: Long): Mono<TaskEfficiencyMetrics> {
        return taskRepository.list {
            fieldOf(Task::projectId, ComparisonOperator.EQUALS, projectId)
        }
            .collectList()
            .flatMap { tasks ->
                // 查询所有任务状态
                projectStatusRepository.list<ProjectStatus> {}.collectList()
                    .map { statuses ->
                        val statusMap = statuses.associateBy { it.id }
                        val totalTasks = tasks.size

                        // 已完成任务
                        val completedTasks = tasks.filter { task ->
                            val status = statusMap[task.statusId]
                            status?.isTerminal == true
                        }

                        val completedTasksCount = completedTasks.size

                        // 计算项目完成度
                        val projectCompletionRate = if (totalTasks > 0) {
                            (completedTasksCount.toDouble() / totalTasks) * 100
                        } else {
                            0.0
                        }

                        // 计算任务平均完成时间
                        val averageCompletionTime = if (completedTasksCount > 0) {
                            completedTasks.mapNotNull { task ->
                                if (task.updatedAt != null) {
                                    Duration.between(task.createdAt, task.updatedAt).toHours().toDouble()
                                } else {
                                    null
                                }
                            }.average()
                        } else {
                            0.0
                        }

                        // 计算任务完成速率
                        val projectStartDate = tasks.minOfOrNull { it.createdAt } ?: OffsetDateTime.now()
                        val daysSinceStart = Duration.between(projectStartDate, OffsetDateTime.now()).toDays()
                        val taskCompletionRate = if (daysSinceStart > 0) {
                            completedTasksCount.toDouble() / daysSinceStart
                        } else {
                            0.0
                        }

                        TaskEfficiencyMetrics(
                            averageCompletionTime,
                            projectCompletionRate,
                            taskCompletionRate
                        )
                    }
            }
    }

    /**
     * 获取任务优先级分布
     * 仅统计子任务和没有子任务的主任务，避免重复计算
     * 
     * @param projectId 项目ID
     * @return 任务优先级统计信息
     */
    fun getTaskPriorityStats(projectId: Long): Mono<TaskPriorityStats> {
        log.info("获取项目任务优先级分布，项目ID={}", projectId)

        // 单独查询任务列表
        return taskRepository.list {
            fieldOf(Task::projectId, ComparisonOperator.EQUALS, projectId)
        }
        .collectList()
        // 然后查询优先级列表
        .flatMap { tasks -> 
            // 创建任务ID到子任务的映射
            val taskIdToSubTasks = tasks.filter { it.parentTaskId != null }
                .groupBy { it.parentTaskId }
            
            // 获取符合统计条件的任务：子任务或者没有子任务的主任务
            val tasksToCount = tasks.filter { task ->
                // 如果是子任务，计入统计
                task.parentTaskId != null || 
                // 如果是主任务但没有子任务，也计入统计
                (task.parentTaskId == null && !taskIdToSubTasks.containsKey(task.id))
            }
            
            log.debug("符合优先级统计条件的任务数量: {}", tasksToCount.size)
            
            priorityRepository.list<Priority> { 
                fieldOf(Priority::projectId, ComparisonOperator.EQUALS, projectId)
            }.collectList()
                .map { priorities -> 
                    // 计算每个优先级下的任务数量
                    val priorityCounts = mutableMapOf<Long, Int>()
                    
                    // 初始化计数器
                    for (priority in priorities) {
                        priorityCounts[priority.id] = 0
                    }
                    
                    // 统计每个优先级的任务数量
                    for (task in tasksToCount) {
                        val priorityId = task.priorityId
                        if (priorityCounts.containsKey(priorityId)) {
                            priorityCounts[priorityId] = priorityCounts[priorityId]!! + 1
                        }
                    }
                    
                    // 如果没有任务，返回空结果
                    if (tasksToCount.isEmpty()) {
                        return@map TaskPriorityStats(0, 0, 0, priorityCounts, priorities)
                    }
                    
                    // 计算优先级分布
                    // 根据任务总数确定高优先级任务比例
                    val highPriorityPercentage = when {
                        tasksToCount.size < 5 -> 0.20    // 任务少于5个：前20%为高优先级
                        tasksToCount.size < 20 -> 0.25   // 任务5-20个：前25%为高优先级
                        tasksToCount.size < 50 -> 0.20   // 任务20-50个：前20%为高优先级
                        else -> 0.15              // 任务50个以上：前15%为高优先级
                    }
                    
                    // 中优先级任务占比固定为40%
                    val mediumPriorityPercentage = 0.40
                    
                    // 计算需要的高优先级和中优先级任务数量
                    val highPriorityTasksNeeded = (tasksToCount.size * highPriorityPercentage).toInt().coerceAtLeast(1)
                    val mediumPriorityTasksNeeded = (tasksToCount.size * mediumPriorityPercentage).toInt()
                    
                    // 为每个任务计算优先级分数
                    val priorityMap = priorities.associateBy { it.id }
                    val tasksWithScores = tasksToCount.map { task ->
                        val priority = priorityMap[task.priorityId]
                        val score = priority?.score ?: 0
                        task to score
                    }.sortedByDescending { it.second }
                    
                    // 将任务分为高、中、低三类
                    val highPriorityTasks = tasksWithScores.take(highPriorityTasksNeeded)
                    val mediumPriorityTasks = tasksWithScores.drop(highPriorityTasksNeeded).take(mediumPriorityTasksNeeded)
                    
                    // 创建并返回统计结果
                    TaskPriorityStats(
                        urgent = highPriorityTasks.size,
                        important = mediumPriorityTasks.size,
                        normal = tasksToCount.size - highPriorityTasks.size - mediumPriorityTasks.size,
                        priorityCounts = priorityCounts,
                        priorities = priorities
                    )
                }
        }
        .doOnSuccess { stats ->
            log.info("项目任务优先级分布统计完成，项目ID={}, 紧急={}, 重要={}, 普通={}",
                projectId, stats.urgent, stats.important, stats.normal)
        }
        .onErrorResume { e ->
            log.error("获取项目任务优先级分布失败，项目ID={}, 错误: {}", projectId, e.message, e)
            Mono.just(TaskPriorityStats(0, 0, 0))
        }
    }

    /**
     * 根据项目ID和优先级查询任务列表
     * 
     * @param projectId 项目ID
     * @param priorityName 优先级名称（可选）
     * @param limit 返回数量限制（可选）
     * @return 任务列表
     */
    fun findTasksByProjectId(projectId: Long, priorityName: String? = null, limit: Int? = null): Flux<Task> {
        log.info("查询项目任务列表，项目ID={}，优先级={}，限制数量={}", projectId, priorityName, limit)

        // 1. 构建基本查询条件
        val taskFlux = taskRepository.list {
            fieldOf(Task::projectId, ComparisonOperator.EQUALS, projectId)
        }

        // 2. 如果指定了优先级，则添加优先级过滤条件
        val filteredFlux = if (priorityName != null) {
            // 先查询指定名称的优先级
            priorityRepository.list {
                fieldOf(Priority::name, ComparisonOperator.LIKE, "%$priorityName%")
            }.map { it.id }
                .collectList()
                .flatMapMany { priorityIds ->
                    if (priorityIds.isEmpty()) {
                        return@flatMapMany Flux.empty<Task>()
                    }

                    // 过滤出符合优先级条件的任务
                    taskFlux.filter { task ->
                        task.priorityId in priorityIds
                    }
                }
        } else {
            taskFlux
        }

        // 3. 如果指定了数量限制，则应用限制
        val limitedFlux = if (limit != null && limit > 0) {
            filteredFlux.take(limit.toLong())
        } else {
            filteredFlux
        }

        return limitedFlux
    }

    /**
     * 分页查询项目任务列表
     *
     * @param projectId 项目ID
     * @param page 页码（从1开始）
     * @param size 每页大小
     * @param priorityName 优先级名称（可选）
     * @param onlyMainTasks 是否只查询主任务（默认为false）
     * @return 分页任务列表
     */
    fun findTasksByProjectIdPaged(projectId: Long, page: Int, size: Int, priorityName: String? = null, taskType: String = "main"): Mono<PageResult<Task>> {
        log.info("分页查询项目任务列表，项目ID={}，页码={}，每页大小={}，优先级={}，任务类型={}", projectId, page, size, priorityName, taskType)

        // 计算分页参数
        val pageNumber = page - 1 // 转换为从0开始的页码
        val pageRequest = com.task.domain.model.common.PageRequest(pageNumber, size)

        // 如果指定了优先级名称，先查询对应的优先级ID
        if (priorityName != null) {
            return priorityRepository.list {
                fieldOf(Priority::name, ComparisonOperator.EQUALS, priorityName)
            }
                .map { it.id }
                .collectList()
                .flatMap { priorityIds ->
                    if (priorityIds.isEmpty()) {
                        return@flatMap Mono.just(PageResult(emptyList(), 0, pageNumber, size))
                    }

                    // 使用Repository的page方法进行分页查询
                    taskRepository.page(pageRequest) {
                        fieldOf(Task::projectId, ComparisonOperator.EQUALS, projectId)
                        fieldOf(Task::priorityId, ComparisonOperator.IN, priorityIds)
                        // 根据任务类型过滤
                        when (taskType.lowercase()) {
                            "main" -> fieldOf(Task::parentTaskId, ComparisonOperator.IS_NULL)  // 只查询主任务
                            "sub" -> fieldOf(Task::parentTaskId, ComparisonOperator.IS_NOT_NULL)  // 只查询子任务
                            else -> { /* 不添加过滤条件，查询所有任务 */ }
                        }
                    }
                }
        } else {
            // 不需要过滤优先级，直接分页查询
            return taskRepository.page(pageRequest) {
                fieldOf(Task::projectId, ComparisonOperator.EQUALS, projectId)
                // 根据任务类型过滤
                when (taskType.lowercase()) {
                    "main" -> fieldOf(Task::parentTaskId, ComparisonOperator.IS_NULL)  // 只查询主任务
                    "sub" -> fieldOf(Task::parentTaskId, ComparisonOperator.IS_NOT_NULL)  // 只查询子任务
                    else -> { /* 不添加过滤条件，查询所有任务 */ }
                }
            }
        }
    }

    /**
     * 根据项目ID查询任务列表
     *
     * @param projectId 项目ID
     * @return 任务列表
     */
    fun getByProjectId(projectId: Long): Flux<Task> {
        log.info("查询项目所有任务，项目ID={}", projectId)
        return findTasksByProjectId(projectId)
    }

    /**
     * 根据ID查询项目状态
     *
     * @param statusId 状态ID
     * @return 项目状态
     */
    fun findStatusById(statusId: Long): Mono<ProjectStatus> {
        return projectStatusRepository.findById(statusId)
    }

    /**
     * 根据ID查询任务优先级
     *
     * @param priorityId 优先级ID
     * @return 任务优先级
     */
    fun findPriorityById(priorityId: Long): Mono<Priority> {
        return priorityRepository.findById(priorityId)
    }

    /**
     * 获取指定项目的所有优先级定义
     *
     * @param projectId 项目ID
     * @return 项目的所有优先级的Flux
     */
    fun findAllPriorities(projectId: Long): Flux<Priority> {
        log.info("获取项目所有优先级定义: 项目ID={}", projectId)
        
        return priorityRepository.list {
            fieldOf(Priority::projectId, ComparisonOperator.EQUALS, projectId)
            orderBy(asc(Priority::level))
        }
        .doOnComplete { log.debug("项目优先级定义获取完成: 项目ID={}", projectId) }
    }
    
    /**
     * 获取指定项目的所有状态定义
     * 通过项目状态映射表查询项目关联的状态
     *
     * @param projectId 项目ID
     * @return 项目关联的所有状态的Flux
     */
    fun findAllStatuses(projectId: Long): Flux<ProjectStatus> {
        log.info("获取项目关联的所有状态定义: 项目ID={}", projectId)
        
        // 首先查询项目关联的状态ID（通过ProjectStatusMapping中间表）
        return projectStatusMappingRepository.list {
                fieldOf(ProjectStatusMapping::projectId, ComparisonOperator.EQUALS, projectId)
            }
            .map { it.statusId }
            .collectList()
            .flatMapMany { statusIds ->
                if (statusIds.isEmpty()) {
                    log.warn("项目没有关联任何状态，项目ID={}", projectId)
                    return@flatMapMany Flux.empty<ProjectStatus>()
                }
                
                // 根据状态ID查询状态详细信息
                projectStatusRepository.list {
                    fieldOf(ProjectStatus::id, ComparisonOperator.IN, statusIds)
                    orderBy(asc(ProjectStatus::displayOrder))
                }
            }
            .doOnComplete { log.debug("项目关联的状态定义获取完成: 项目ID={}", projectId) }
    }

    /**
     * 删除项目的所有任务
     *
     * @param projectId 项目ID
     * @return 操作结果
     */
    fun deleteTasksByProjectId(projectId: Long): Mono<Void> {
        log.info("开始删除项目任务: 项目ID={}", projectId)

        // 先查询项目的所有任务ID
        return taskRepository.list {
            fieldOf(Task::projectId, ComparisonOperator.EQUALS, projectId)
        }
            .map { it.id }
            .collectList()
            .flatMap { taskIds ->
                if (taskIds.isEmpty()) {
                    log.info("项目没有任务需要删除: 项目ID={}", projectId)
                    return@flatMap Mono.empty<Void>()
                }

                log.info("找到{}个项目任务需要删除: 项目ID={}", taskIds.size, projectId)
                // 批量删除项目任务
                taskRepository.deleteBatch(taskIds)
                    .doOnSuccess { log.debug("项目任务删除成功: 项目ID={}, 删除数量={}", projectId, taskIds.size) }
                    .doOnError { e -> log.error("项目任务删除失败: 项目ID={}, 错误: {}", projectId, e.message, e) }
            }
    }

    /**
     * 创建任务
     *
     * @param projectId 项目ID
     * @param title 任务标题
     * @param description 任务描述
     * @param assigneeId 负责人ID
     * @param creatorId 创建者ID
     * @param parentTaskId 父任务ID
     * @param priorityScore 优先级分数(0-100)
     * @param predecessorTaskIds 前置任务ID列表（当前任务依赖的任务）
     * @param startTime 任务开始时间
     * @param dueDate 任务截止时间
     * @return 创建的任务ID
     */
    fun createTask(
        projectId: Long,
        title: String,
        description: String? = null,
        assigneeId: Long? = null,
        creatorId: Long,
        parentTaskId: Long? = null,
        priorityScore: Int? = null,
        predecessorTaskIds: List<Long> = emptyList(),
        startTime: OffsetDateTime? = null,
        dueDate: OffsetDateTime? = null
    ): Mono<Long> {
        log.info("创建任务: 项目ID={}, 标题={}, 负责人ID={}, 创建者ID={}, 父任务ID={}, 优先级分数={}, 前置任务数={}, 截止时间={}",
            projectId, title, assigneeId, creatorId, parentTaskId, priorityScore, predecessorTaskIds.size, dueDate)

        // 1. 获取默认项目状态
        return getDefaultProjectStatus(projectId)
            .flatMap { defaultStatus ->
                // 2. 获取或创建与优先级分数匹配的优先级
                getOrCreatePriorityByScore(projectId, priorityScore)
                    .flatMap { priorityId ->
                        // 3. 创建任务
                        val task = Task(
                            id = 0, // 由数据库生成
                            title = title,
                            description = description,
                            projectId = projectId,
                            parentTaskId = parentTaskId,
                            statusId = defaultStatus.id,
                            priorityId = priorityId,
                            creatorId = creatorId,
                            assigneeId = assigneeId,
                            startTime = startTime,
                            dueDate = dueDate,  // 直接设置截止日期
                            createdAt = OffsetDateTime.now(),
                            version = 1
                        )

                        // 4. 保存任务
                        taskRepository.save(task)
                            .doOnNext { savedTask ->
                                log.info("任务创建成功: ID={}, 项目ID={}, 标题={}",
                                    savedTask.id, projectId, title)
                            }
                            .flatMap { savedTask ->
                                // 5. 处理任务依赖关系
                                if (predecessorTaskIds.isEmpty()) {
                                    return@flatMap Mono.just(savedTask.id)
                                }

                                // 添加任务依赖关系，当前任务是后续任务(依赖方)，predecessorTaskIds列表中的任务是前置任务(被依赖方)
                                Flux.fromIterable(predecessorTaskIds)
                                    .flatMap { predecessorTaskId ->
                                        addTaskDependency(savedTask.id, predecessorTaskId)
                                    }
                                    .collectList()
                                    .thenReturn(savedTask.id)
                            }
                    }
            }
            .doOnError { e ->
                log.error("任务创建失败: 项目ID={}, 标题={}, 错误: {}", projectId, title, e.message, e)
            }
    }

    /**
     * 获取项目的默认状态
     * 如果不存在，则使用系统默认状态
     *
     * @param projectId 项目ID
     * @return 默认项目状态
     */
    private fun getDefaultProjectStatus(projectId: Long): Mono<ProjectStatus> {
        return projectStatusRepository.list {
            fieldOf(ProjectStatus::isDefault, ComparisonOperator.EQUALS, true)
        }
        .next()
    }

    /**
     * 根据优先级分数获取对应的优先级ID
     *
     * @param projectId 项目ID
     * @param priorityScore 优先级分数(0-100)，可以为null
     * @return 优先级ID
     */
    private fun getOrCreatePriorityByScore(projectId: Long, priorityScore: Int?): Mono<Long> {
        // 如果没有指定优先级分数，返回错误
        if (priorityScore == null) {
            return Mono.error(IllegalArgumentException("优先级分数不能为空"))
        }

        // 查找项目中的所有优先级
        return priorityRepository.list {
            fieldOf(Priority::projectId, ComparisonOperator.EQUALS, projectId)
        }
        .collectList()
        .flatMap { priorities ->
            if (priorities.isEmpty()) {
                // 如果项目没有优先级，返回错误
                return@flatMap Mono.error<Long>(IllegalStateException("项目没有定义优先级"))
            }

            // 按score从低到高排序所有优先级
            val sortedPriorities = priorities.sortedBy { it.score }

            // 找到适合的优先级
            // 例如：如果有优先级分数 [33, 66, 100]，对应范围是 0-33, 34-66, 67-100
            // 传入50，应该归属于第二个优先级（34-66范围）

            // 遍历排序后的优先级，找到分数范围包含priorityScore的优先级
            var selectedPriority: Priority? = null

            for (i in sortedPriorities.indices) {
                val priority = sortedPriorities[i]

                // 计算当前优先级的分数范围
                val minScore = if (i == 0) 0 else sortedPriorities[i-1].score + 1
                val maxScore = priority.score

                // 检查priorityScore是否在当前范围内
                if (priorityScore in minScore..maxScore) {
                    selectedPriority = priority
                    break
                }
            }

            // 如果没有找到匹配的优先级（可能是因为priorityScore超出了最高优先级的分数），使用最高优先级
            if (selectedPriority == null && sortedPriorities.isNotEmpty()) {
                val highestPriority = sortedPriorities.last()
                if (priorityScore > highestPriority.score) {
                    selectedPriority = highestPriority
                }
            }

            if (selectedPriority != null) {
                // 返回选中的优先级ID
                log.info("找到与分数{}匹配的优先级: ID={}, 名称={}, 分数={}",
                    priorityScore, selectedPriority.id, selectedPriority.name, selectedPriority.score)
                Mono.just(selectedPriority.id)
            } else {
                // 这种情况理论上不会发生，因为我们已经处理了所有可能的情况
                Mono.error(IllegalStateException("无法找到匹配的优先级"))
            }
        }
    }

    /**
     * 添加任务依赖关系
     *
     * @param successorTaskId 后续任务ID（依赖于前置任务的任务）
     * @param predecessorTaskId 前置任务ID（被依赖的任务，必须先完成的任务）
     * @return 操作结果的Mono
     */
    private fun addTaskDependency(successorTaskId: Long, predecessorTaskId: Long): Mono<Void> {
        log.info("添加任务依赖关系: 后续任务ID={}, 前置任务ID={}", successorTaskId, predecessorTaskId)

        // 使用TaskDependencyService添加依赖关系
        return taskDependencyService.addDependency(
                successorTaskId, 
                predecessorTaskId, 
                "任务 $successorTaskId 依赖于任务 $predecessorTaskId"
            )
            .then()
            .onErrorResume { e -> 
                when (e) {
                    is CircularDependencyException -> {
                        log.error("添加任务依赖关系失败 - 检测到循环依赖: 后续任务ID={}, 前置任务ID={}", 
                            successorTaskId, predecessorTaskId)
                        Mono.error(e)
                    }
                    is IllegalStateException -> {
                        // 依赖关系已存在等错误
                        log.warn("添加任务依赖关系失败 - {}: 后续任务ID={}, 前置任务ID={}", 
                            e.message, successorTaskId, predecessorTaskId)
                        Mono.error(e)
                    }
                    is IllegalArgumentException -> {
                        // 任务不存在等错误
                        log.error("添加任务依赖关系失败 - 参数错误: {}, 后续任务ID={}, 前置任务ID={}", 
                            e.message, successorTaskId, predecessorTaskId)
                        Mono.error(e)
                    }
                    else -> {
                        log.error("添加任务依赖关系异常: 后续任务ID={}, 前置任务ID={}, 错误: {}", 
                            successorTaskId, predecessorTaskId, e.message, e)
                        Mono.error(e)
                    }
                }
            }
    }

    /**
     * 查询任务详情
     * 包括子任务、状态、优先级等信息
     *
     * @param taskId 任务ID
     * @return 任务详情
     */
    /**
     * 根据父任务ID查询所有子任务
     *
     * @param parentTaskId 父任务ID
     * @return 子任务列表的Flux
     */
    fun findSubTasksByParentId(parentTaskId: Long): Flux<Task> {
        log.info("查询子任务列表: 父任务ID={}", parentTaskId)

        return taskRepository.list {
            fieldOf(Task::parentTaskId, ComparisonOperator.EQUALS, parentTaskId)
            orderBy(asc(Task::createdAt))
        }
        .doOnComplete { log.info("子任务列表查询完成: 父任务ID={}", parentTaskId) }
        .doOnError { e -> log.error("子任务列表查询失败: 父任务ID={}, 错误: {}", parentTaskId, e.message, e) }
    }

    fun findTaskById(taskId: Long): Mono<Task> {
        log.info("查询任务详情: 任务ID={}", taskId)

        return taskRepository.findById(taskId)
            .flatMap { task ->
                // 查询子任务
                val subTasksMono = taskRepository.list {
                    fieldOf(Task::parentTaskId, ComparisonOperator.EQUALS, taskId)
                }.collectList()

                // 查询项目状态
                val statusMono = projectStatusRepository.findById(task.statusId)

                // 合并结果
                Mono.zip(subTasksMono, statusMono)
                    .map { tuple ->
                        val subTasks = tuple.t1
                        val status = tuple.t2

                        // 创建包含完整信息的任务对象
                        task.copy(
                            subTasks = subTasks,
                            status = status
                        )
                    }
            }
            .doOnSuccess { task -> log.info("任务详情查询成功: 任务ID={}, 标题={}", taskId, task.title) }
            .doOnError { e -> log.error("任务详情查询失败: 任务ID={}, 错误: {}", taskId, e.message, e) }
    }

    /**
     * 更新任务信息
     * 区分主任务和子任务，并记录变更历史
     * 注意：这是旧版方法，建议使用基于策略模式的新版updateTaskWithStrategy方法
     *
     * @param taskId 任务ID
     * @param title 任务标题
     * @param description 任务描述
     * @param statusId 任务状态ID
     * @param priorityId 任务优先级ID
     * @param assigneeId 任务负责人ID
     * @param dueDate 任务截止日期
     * @param userId 当前操作用户ID，用于记录变更历史
     * @return 更新后的任务
     */
    fun updateTask(
        taskId: Long,
        title: String? = null,
        description: String? = null,
        statusId: Long? = null,
        priorityId: Long? = null,
        assigneeId: Long? = null,
        dueDate: OffsetDateTime? = null,
        userId: Long? = null
    ): Mono<Task> {
        log.info("更新任务信息，任务ID={}", taskId)
        
        return findTaskById(taskId)
            .flatMap { existingTask ->
                // 创建更新后的任务对象
                val updatedTask = existingTask.copy(
                    title = title ?: existingTask.title,
                    description = description ?: existingTask.description,
                    statusId = statusId ?: existingTask.statusId,
                    priorityId = priorityId ?: existingTask.priorityId,
                    assigneeId = assigneeId ?: existingTask.assigneeId,
                    dueDate = dueDate ?: existingTask.dueDate,
                    updatedAt = OffsetDateTime.now()
                )
                
                // 判断是否有变更
                val hasChanges = existingTask.title != updatedTask.title ||
                                existingTask.description != updatedTask.description ||
                                existingTask.statusId != updatedTask.statusId ||
                                existingTask.priorityId != updatedTask.priorityId ||
                                existingTask.assigneeId != updatedTask.assigneeId ||
                                existingTask.dueDate != updatedTask.dueDate
                
                if (!hasChanges) {
                    log.info("任务无变更，跳过更新，任务ID={}", taskId)
                    return@flatMap Mono.just(existingTask)
                }
                
                // 判断是否是主任务
                val isMainTask = existingTask.parentTaskId == null
                log.info("任务类型判断：任务ID={}，是否为主任务={}", taskId, isMainTask)
                
                // 更新任务
                taskRepository.update(updatedTask)
                    .flatMap { updatedTaskResult ->
                        // 如果有用户ID，记录任务历史
                        if (userId != null) {
                            log.info("记录任务历史，任务ID={}，用户ID={}", taskId, userId)
                            // 委托给任务历史服务记录变更
                            taskHistoryService.recordTaskChanges(existingTask, updatedTaskResult, userId)
                                .collectList()
                                .doOnSuccess { histories ->
                                    log.info("成功记录{}条任务历史，任务ID={}", histories.size, taskId)
                                }
                                .doOnError { e ->
                                    log.error("记录任务历史失败，任务ID={}，错误：{}", taskId, e.message, e)
                                }
                                .then(Mono.just(updatedTaskResult))
                        } else {
                            Mono.just(updatedTaskResult)
                        }
                    }
                    .doOnSuccess { task ->
                        log.info("任务更新成功，任务ID={}，标题={}，是否主任务={}", 
                                taskId, task.title, isMainTask)
                        
                        // 如果有用户ID，发布任务修改事件
                        if (userId != null) {
                            taskEventPublisher.publishTaskModifiedEvent(
                                originalTask = existingTask,
                                modifiedTask = task,
                                userId = userId
                            )
                        }
                    }
                    .doOnError { e ->
                        log.error("任务更新失败，任务ID={}，错误：{}", taskId, e.message, e)
                    }
            }
    }
    
    /**
     * 使用策略模式更新任务
     * 根据任务类型（主任务/子任务）选择合适的策略
     *
     * @param taskId 任务ID
     * @param title 任务标题
     * @param description 任务描述
     * @param statusId 任务状态ID
     * @param priorityId 任务优先级ID
     * @param assigneeId 任务负责人ID
     * @param startTime 任务开始时间
     * @param dueDate 任务截止日期
     * @param userId 当前操作用户ID
     * @param taskEditStrategy 指定的任务编辑策略，如果为null则自动选择
     * @return 更新后的任务
     */
    fun updateTaskWithStrategy(
        taskId: Long,
        title: String? = null,
        description: String? = null,
        statusId: Long? = null,
        priorityId: Long? = null,
        assigneeId: Long? = null,
        startTime: OffsetDateTime? = null,
        dueDate: OffsetDateTime? = null,
        userId: Long,
        taskEditStrategy: TaskEditStrategy? = null
    ): Mono<Task> {
        log.info("使用策略模式更新任务，任务ID={}", taskId)
        
        return findTaskById(taskId)
            .flatMap { task ->
                // 使用指定的策略或从全局策略列表中选择合适的策略
                val strategy = taskEditStrategy ?: findApplicableEditStrategy(task)
                if (strategy == null) {
                    log.error("找不到适用的任务编辑策略，任务ID={}", taskId)
                    return@flatMap Mono.error<Task>(
                        IllegalStateException("找不到适用的任务编辑策略")
                    )
                }
                
                log.info("选择任务编辑策略：{}，任务ID={}", 
                    strategy.javaClass.simpleName, taskId)
                
                // 验证任务编辑参数
                strategy.validateTaskEdit(
                    task = task,
                    title = title,
                    description = description,
                    statusId = statusId,
                    priorityId = priorityId,
                    assigneeId = assigneeId,
                    startTime = startTime,
                    dueDate = dueDate
                ).then(Mono.defer {
                    // 执行任务编辑
                    strategy.executeTaskEdit(
                        task = task,
                        title = title,
                        description = description,
                        statusId = statusId,
                        priorityId = priorityId,
                        assigneeId = assigneeId,
                        startTime = startTime,
                        dueDate = dueDate,
                        userId = userId
                    )
                }).flatMap { updatedTask ->
                    // 处理编辑后的操作
                    strategy.postTaskEdit(
                        originalTask = task,
                        updatedTask = updatedTask,
                        userId = userId
                    )
                }
            }
            .doOnSuccess { updatedTask ->
                log.info("任务策略更新成功，任务ID={}，标题={}", 
                    updatedTask.id, updatedTask.title)
            }
            .doOnError { e ->
                log.error("任务策略更新失败，任务ID={}，错误：{}", 
                    taskId, e.message, e)
            }
    }
    
    /**
     * 处理任务编辑命令
     * 使用命令模式处理任务修改
     *
     * @param command 任务编辑命令
     * @return 修改后的任务
     */
    fun handleEditTaskCommand(command: EditTaskCommand): Mono<Task> {
        log.info("处理任务编辑命令，任务ID={}", command.taskId)
        
        // 验证命令
        val validationError = command.validate()
        if (validationError != null) {
            log.warn("任务编辑命令验证失败，任务ID={}，错误：{}", 
                command.taskId, validationError)
            return Mono.error(IllegalArgumentException(validationError))
        }
        
        // 使用策略模式更新任务
        return updateTaskWithStrategy(
            taskId = command.taskId,
            title = command.title,
            description = command.description,
            statusId = command.statusId,
            priorityId = command.priorityId,
            assigneeId = command.assigneeId,
            startTime = command.startTime,
            dueDate = command.dueDate,
            userId = command.userId
        )
    }
    
    /**
     * 查找适用于指定任务的编辑策略
     * 
     * @param task 任务
     * @return 适用的策略，如果找不到则返回null
     */
    private fun findApplicableEditStrategy(task: Task): TaskEditStrategy? {
        return taskEditStrategies.find { it.isApplicable(task) }
    }

    /**
     * 判断任务状态是否为终态（如已完成）
     * 
     * @param statusId 状态ID
     * @return 是否为终态
     */
    fun isTaskStatusTerminal(statusId: Long): Mono<Boolean> {
        log.info("检查任务状态是否为终态，状态ID={}", statusId)
        
        return projectStatusRepository.findById(statusId)
            .map { status -> status.isTerminal }
            .defaultIfEmpty(false)
    }
    
    /**
     * 计算任务进度(0-100)
     * 采用状态位置归一化 + 子任务递归累加的方案：
     * 1. 如果任务状态是终止状态，进度为100%
     * 2. 如果任务有子任务，根据子任务的进度计算平均值
     * 3. 如果任务没有子任务，根据状态在工作流中的位置计算归一化进度
     * 
     * @param task 任务对象
     * @return 任务进度百分比
     */
    fun calculateTaskProgress(task: Task): Mono<Int> {
        log.info("计算任务进度，任务ID={}", task.id)
        
        // 如果状态是终止状态，进度为100%
        if (task.status?.isTerminal == true) {
            return Mono.just(100)
        }
        
        // 如果没有带状态对象，从数据库查询
        val statusMono = if (task.status == null) {
            projectStatusRepository.findById(task.statusId)
        } else {
            Mono.just(task.status)
        }
        
        // 获取项目所有状态，用于计算状态位置
        val allStatusesMono = projectStatusMappingRepository.list {
            fieldOf(ProjectStatusMapping::projectId, ComparisonOperator.EQUALS, task.projectId)
        }.map { it.statusId }.collectList()
        .flatMap { statusIds ->
            projectStatusRepository.list {
                fieldOf(ProjectStatus::id, ComparisonOperator.IN, statusIds)
                orderBy(asc(ProjectStatus::displayOrder))
            }.collectList()
        }
        
        return Mono.zip(statusMono, allStatusesMono)
            .flatMap { tuple ->
                val status = tuple.t1
                val allStatuses = tuple.t2
                
                // 如果状态是终止状态，进度为100%
                if (status.isTerminal) {
                    return@flatMap Mono.just(100)
                }
                
                // 检查子任务情况
                return@flatMap checkSubTasks(task, allStatuses)
            }
    }
    
    /**
     * 检查任务的子任务并计算进度
     * 如果有子任务，计算子任务的平均进度
     * 如果没有子任务，计算状态位置的归一化进度
     * 
     * @param task 任务对象
     * @param allStatuses 项目的所有状态列表
     * @return 计算得到的进度值
     */
    private fun checkSubTasks(task: Task, allStatuses: List<ProjectStatus>): Mono<Int> {
        // 如果内存中已有子任务列表
        if (task.subTasks.isNotEmpty()) {
            return calculateSubTasksProgress(task.subTasks)
        }
        
        // 从数据库查询子任务
        return taskRepository.list {
            fieldOf(Task::parentTaskId, ComparisonOperator.EQUALS, task.id)
        }.collectList().flatMap { subTasks ->
            if (subTasks.isEmpty()) {
                // 如果没有子任务，根据状态位置计算进度
                calculateProgressByStatusPosition(task.statusId, allStatuses)
            } else {
                // 计算子任务的平均进度
                calculateSubTasksProgress(subTasks)
            }
        }
    }
    
    /**
     * 根据状态在工作流中的位置计算进度
     * 公式：(当前状态位置 - 1) * 100 / (总状态数 - 1)
     * 
     * @param statusId 当前状态ID
     * @param allStatuses 所有状态列表
     * @return 计算得到的进度值
     */
    private fun calculateProgressByStatusPosition(statusId: Long, allStatuses: List<ProjectStatus>): Mono<Int> {
        // 安全检查：如果只有一个状态，返回50%
        if (allStatuses.size <= 1) {
            return Mono.just(50)
        }
        
        // 查找当前状态在列表中的位置
        val statusIndex = allStatuses.indexOfFirst { it.id == statusId }
        
        // 如果找不到状态，返回0%
        if (statusIndex == -1) {
            log.warn("计算进度时找不到状态ID={}", statusId)
            return Mono.just(0)
        }
        
        // 计算归一化的进度值
        val progress = (statusIndex * 100) / (allStatuses.size - 1)
        return Mono.just(progress)
    }
    
    /**
     * 计算子任务的平均进度
     * 递归计算每个子任务的进度，然后计算平均值
     * 
     * @param subTasks 子任务列表
     * @return 计算得到的平均进度值
     */
    private fun calculateSubTasksProgress(subTasks: List<Task>): Mono<Int> {
        // 如果没有子任务，返回0%
        if (subTasks.isEmpty()) {
            return Mono.just(0)
        }
        
        // 递归计算每个子任务的进度
        return Flux.fromIterable(subTasks)
            .flatMap { subTask -> calculateTaskProgress(subTask) }
            .collectList()
            .map { progressList ->
                // 计算平均进度
                if (progressList.isEmpty()) {
                    0
                } else {
                    progressList.sum() / progressList.size
                }
            }
    }
    
    /**
     * 根据终止状态统计用户的任务数量
     *
     * @param userId 用户ID
     * @param isTerminal 是否为终止状态
     * @param projectId 项目ID，可选，如果提供则只统计指定项目的任务
     * @return 对应状态的任务数量
     */
    fun countUserTasksByTerminalStatus(userId: Long, isTerminal: Boolean, projectId: Long? = null): Mono<Int> {
        log.info("根据终止状态统计用户任务数量: userId={}, isTerminal={}, projectId={}", userId, isTerminal, projectId)

        // 1. 查询指定终止状态的所有状态ID
        return projectStatusRepository.list {
            fieldOf(ProjectStatus::isTerminal, ComparisonOperator.EQUALS, isTerminal)
        }
            .map { it.id }
            .collectList()
            .flatMap { statusIds ->
                if (statusIds.isEmpty()) {
                    log.warn("未找到终止状态为 {} 的任务状态", isTerminal)
                    return@flatMap Mono.just(0)
                }

                // 2. 统计具有这些状态ID的用户任务数量
                taskRepository.count {
                    fieldOf(Task::statusId, ComparisonOperator.IN, statusIds)
                    fieldOf(Task::assigneeId, ComparisonOperator.EQUALS, userId)

                    if (projectId != null) {
                        fieldOf(Task::projectId, ComparisonOperator.EQUALS, projectId)
                    }
                }
                    .defaultIfEmpty(0L)
                    .map { it.toInt() }
            }
    }

    /**
     * 计算用户任务增长率
     *
     * @param userId 用户ID
     * @param isTerminal 是否为终止状态
     * @param projectId 项目ID，可选，如果提供则只统计指定项目的任务
     * @return 任务增长率（百分比）
     */
    fun calculateUserTaskGrowthRate(userId: Long, isTerminal: Boolean, projectId: Long? = null): Mono<Double> {
        log.info("计算用户任务增长率: userId={}, isTerminal={}, projectId={}", userId, isTerminal, projectId)

        val now = OffsetDateTime.now()
        val oneWeekAgo = now.minusWeeks(1)
        val twoWeeksAgo = now.minusWeeks(2)

        // 1. 查询指定终止状态的所有状态ID
        return projectStatusRepository.list {
            fieldOf(ProjectStatus::isTerminal, ComparisonOperator.EQUALS, isTerminal)
        }
            .map { it.id }
            .collectList()
            .flatMap { statusIds ->
                if (statusIds.isEmpty()) {
                    log.warn("未找到终止状态为 {} 的任务状态", isTerminal)
                    return@flatMap Mono.just(0.0)
                }

                // 2. 计算本周任务数量
                val currentWeekTasksMono = taskRepository.count {
                    fieldOf(Task::statusId, ComparisonOperator.IN, statusIds)
                    fieldOf(Task::assigneeId, ComparisonOperator.EQUALS, userId)
                    fieldOf(Task::createdAt, ComparisonOperator.GREATER_OR_EQUAL, oneWeekAgo)
                    fieldOf(Task::createdAt, ComparisonOperator.LESS_OR_EQUAL, now)

                    if (projectId != null) {
                        fieldOf(Task::projectId, ComparisonOperator.EQUALS, projectId)
                    }
                }.defaultIfEmpty(0L)

                // 3. 计算上周任务数量
                val lastWeekTasksMono = taskRepository.count {
                    fieldOf(Task::statusId, ComparisonOperator.IN, statusIds)
                    fieldOf(Task::assigneeId, ComparisonOperator.EQUALS, userId)
                    fieldOf(Task::createdAt, ComparisonOperator.GREATER_OR_EQUAL, twoWeeksAgo)
                    fieldOf(Task::createdAt, ComparisonOperator.LESS_OR_EQUAL, oneWeekAgo)

                    if (projectId != null) {
                        fieldOf(Task::projectId, ComparisonOperator.EQUALS, projectId)
                    }
                }.defaultIfEmpty(0L)

                // 4. 计算增长率
                Mono.zip(currentWeekTasksMono, lastWeekTasksMono)
                    .map { tuple ->
                        val currentWeekTasks = tuple.t1
                        val lastWeekTasks = tuple.t2

                        if (lastWeekTasks == 0L) {
                            // 如果上周没有任务，则增长率为100%（如果本周有任务）或0%（如果本周也没有任务）
                            if (currentWeekTasks > 0) 100.0 else 0.0
                        } else {
                            // 计算增长率：(本周 - 上周) / 上周 * 100
                            val growthRate = (currentWeekTasks - lastWeekTasks).toDouble() / lastWeekTasks * 100
                            growthRate
                        }
                    }
            }
            .doOnSuccess { growthRate ->
                log.info("用户任务增长率计算完成: userId={}, isTerminal={}, growthRate={}%", userId, isTerminal, growthRate)
            }
            .onErrorResume { e ->
                log.error("计算用户任务增长率失败: userId={}, isTerminal={}, 错误: {}", userId, isTerminal, e.message, e)
                Mono.just(0.0)
            }
    }

    /**
     * 查询用户在指定时间范围内已分配的任务
     * 用于任务调度时避免时间冲突
     *
     * @param userId 用户ID
     * @param startTime 开始时间
     * @param endTime 结束时间
     * @param excludeProjectId 需要排除的项目ID（可选），比如当前正在安排的项目
     * @return 用户在指定时间范围内的任务列表
     */
    fun findUserAssignedTasks(userId: Long, startTime: OffsetDateTime, endTime: OffsetDateTime, excludeProjectId: Long? = null): Flux<Task> {
        log.info("查询用户[{}]在{}到{}之间已分配的任务", userId, startTime, endTime)
        
        return taskRepository.list {
            // 查询条件：指定用户ID
            fieldOf(Task::assigneeId, ComparisonOperator.EQUALS, userId)
            
            // 时间筛选条件（任务的开始时间或结束时间在查询范围内）
            or {
                // 情况1：任务开始时间在查询范围内
                and {
                    fieldOf(Task::startTime, ComparisonOperator.GREATER_OR_EQUAL, startTime)
                    fieldOf(Task::startTime, ComparisonOperator.LESS_OR_EQUAL, endTime)
                }
                // 情况2：任务结束时间在查询范围内
                or {
                    fieldOf(Task::dueDate, ComparisonOperator.GREATER_OR_EQUAL, startTime)
                    fieldOf(Task::dueDate, ComparisonOperator.LESS_OR_EQUAL, endTime)
                }
                // 情况3：任务时间范围包含整个查询范围
                or {
                    fieldOf(Task::startTime, ComparisonOperator.LESS_OR_EQUAL, startTime)
                    fieldOf(Task::dueDate, ComparisonOperator.GREATER_OR_EQUAL, endTime)
                }
            }
            
            // 排除指定项目ID（如果提供）
            if (excludeProjectId != null) {
                fieldOf(Task::projectId, ComparisonOperator.NOT_EQUALS, excludeProjectId)
            }
            
            // 只查询已经有开始时间和结束时间的任务
            fieldOf(Task::startTime, ComparisonOperator.NOT_EQUALS, null)
            fieldOf(Task::dueDate, ComparisonOperator.NOT_EQUALS, null)
        }
    }
    
    /**
     * 计算用户任务完成率
     *
     * @param userId 用户ID
     * @param projectId 项目ID，可选，如果提供则只统计指定项目的任务
     * @return 任务完成率（百分比）
     */
    fun calculateUserTaskCompletionRate(userId: Long, projectId: Long? = null): Mono<Double> {
        log.info("计算用户任务完成率: userId={}, projectId={}", userId, projectId)

        // 查询用户的所有任务
        return taskRepository.list {
            fieldOf(Task::assigneeId, ComparisonOperator.EQUALS, userId)

            if (projectId != null) {
                fieldOf(Task::projectId, ComparisonOperator.EQUALS, projectId)
            }
        }
            .collectList()
            .flatMap { tasks ->
                if (tasks.isEmpty()) {
                    log.info("用户没有任务: userId={}", userId)
                    return@flatMap Mono.just(0.0)
                }

                // 查询所有任务状态
                projectStatusRepository.list<ProjectStatus> {}.collectList()
                    .map { statuses ->
                        val statusMap = statuses.associateBy { it.id }
                        val totalTasks = tasks.size

                        // 已完成任务
                        val completedTasks = tasks.filter { task ->
                            val status = statusMap[task.statusId]
                            status?.isTerminal == true
                        }

                        val completedTasksCount = completedTasks.size

                        // 计算任务完成率
                        val completionRate = if (totalTasks > 0) {
                            (completedTasksCount.toDouble() / totalTasks) * 100
                        } else {
                            0.0
                        }

                        log.info("用户任务完成率计算完成: userId={}, 总任务数={}, 已完成任务数={}, 完成率={}%",
                            userId, totalTasks, completedTasksCount, completionRate)

                        completionRate
                    }
            }
            .onErrorResume { e ->
                log.error("计算用户任务完成率失败: userId={}, 错误: {}", userId, e.message, e)
                Mono.just(0.0)
            }
    }
    
    /**
     * 获取用户任务完成统计数据
     * 根据时间范围返回用户任务完成的统计数据
     *
     * @param userId 用户ID
     * @param timeRange 时间范围：day-日, week-周, month-月
     * @return 包含日期和完成任务数量的统计数据列表
     */
    fun getUserTaskCompletionStats(userId: Long, timeRange: String): Mono<List<DailyTaskStats>> {
        log.info("获取用户任务完成统计数据: userId={}, timeRange={}", userId, timeRange)
        
        // 根据时间范围确定开始日期
        val endDate = OffsetDateTime.now()
        val startDate = when (timeRange.lowercase()) {
            "day" -> endDate.minusDays(6) // 最近7天
            "week" -> endDate.minusWeeks(3) // 最近4周
            "month" -> endDate.minusMonths(5) // 最近6个月
            else -> endDate.minusDays(29) // 默认最近30天
        }
        
        // 查询用户在指定时间范围内的任务
        return taskRepository.list {
            fieldOf(Task::assigneeId, ComparisonOperator.EQUALS, userId)
            fieldOf(Task::createdAt, ComparisonOperator.GREATER_OR_EQUAL, startDate)
            fieldOf(Task::createdAt, ComparisonOperator.LESS_OR_EQUAL, endDate)
        }
        .collectList()
        .flatMap { tasks ->
            if (tasks.isEmpty()) {
                log.info("用户在指定时间范围内没有任务: userId={}, timeRange={}", userId, timeRange)
                return@flatMap Mono.just(emptyList<DailyTaskStats>())
            }
            
            // 查询所有任务状态
            findAllStatuses(0) // 使用0作为通用查询，获取所有项目状态
                .collectList()
                .map { statuses ->
                    val statusMap = statuses.associateBy { it.id }
                    
                    // 根据时间范围确定日期格式和数据分组方式
                    val (formatter, groupingFunction) = when (timeRange.lowercase()) {
                        "day" -> {
                            DateTimeFormatter.ofPattern("yyyy-MM-dd") to
                                    { date: OffsetDateTime -> date.format(DateTimeFormatter.ofPattern("yyyy-MM-dd")) }
                        }
                        "week" -> {
                            DateTimeFormatter.ofPattern("yyyy-'W'w") to
                                    { date: OffsetDateTime -> 
                                        val week = date.get(WeekFields.ISO.weekOfWeekBasedYear())
                                        "${date.year}-W${week.toString().padStart(2, '0')}"
                                    }
                        }
                        "month" -> {
                            DateTimeFormatter.ofPattern("yyyy-MM") to
                                    { date: OffsetDateTime -> date.format(DateTimeFormatter.ofPattern("yyyy-MM")) }
                        }
                        else -> {
                            DateTimeFormatter.ofPattern("yyyy-MM-dd") to
                                    { date: OffsetDateTime -> date.format(DateTimeFormatter.ofPattern("yyyy-MM-dd")) }
                        }
                    }
                    
                    // 生成所有日期点
                    val datePoints = generateDatePoints(startDate, endDate, timeRange)
                    
                    // 按日期分组统计任务
                    val result = datePoints.map { date ->
                        val dateFormatter = when (timeRange.lowercase()) {
                            "day" -> DateTimeFormatter.ofPattern("yyyy-MM-dd")
                            "week" -> DateTimeFormatter.ofPattern("yyyy-'W'w")
                            "month" -> DateTimeFormatter.ofPattern("yyyy-MM")
                            else -> DateTimeFormatter.ofPattern("yyyy-MM-dd")
                        }
                        
                        val dateStart = when (timeRange.lowercase()) {
                            "day" -> LocalDate.parse(date, DateTimeFormatter.ofPattern("yyyy-MM-dd"))
                                .atStartOfDay().atOffset(ZoneOffset.UTC)
                            "week" -> {
                                val parts = date.split("-W")
                                val year = parts[0].toInt()
                                val week = parts[1].toInt()
                                LocalDate.now()
                                    .withYear(year)
                                    .with(WeekFields.ISO.weekOfWeekBasedYear(), week.toLong())
                                    .with(WeekFields.ISO.dayOfWeek(), 1) // 周一
                                    .atStartOfDay().atOffset(ZoneOffset.UTC)
                            }
                            "month" -> {
                                val parts = date.split("-")
                                val year = parts[0].toInt()
                                val month = parts[1].toInt()
                                LocalDate.of(year, month, 1)
                                    .atStartOfDay().atOffset(ZoneOffset.UTC)
                            }
                            else -> LocalDate.parse(date, DateTimeFormatter.ofPattern("yyyy-MM-dd"))
                                .atStartOfDay().atOffset(ZoneOffset.UTC)
                        }
                        
                        val dateEnd = when (timeRange.lowercase()) {
                            "day" -> dateStart.plusDays(1).minusNanos(1)
                            "week" -> dateStart.plusWeeks(1).minusNanos(1)
                            "month" -> dateStart.plusMonths(1).minusNanos(1)
                            else -> dateStart.plusDays(1).minusNanos(1)
                        }
                        
                        val createdTasks = tasks.count { task ->
                            task.createdAt >= dateStart && task.createdAt <= dateEnd
                        }
                        
                        val completedTasks = tasks.count { task ->
                            val status = statusMap[task.statusId]
                            status?.isTerminal == true &&
                                task.updatedAt != null &&
                                task.updatedAt!! >= dateStart &&
                                task.updatedAt!! <= dateEnd
                        }
                        
                        DailyTaskStats(date, completedTasks, createdTasks)
                    }
                    
                    log.debug("用户任务完成统计数据生成成功: userId={}, timeRange={}, 数据点数量={}", 
                             userId, timeRange, result.size)
                    
                    result
                }
        }
        .onErrorResume { e ->
            log.error("获取用户任务完成统计数据失败: userId={}, timeRange={}, 错误: {}", 
                     userId, timeRange, e.message, e)
            Mono.just(emptyList())
        }
    }
    
    /**
     * 获取用户当月任务状态统计数据
     * 返回一个元组，第一个元素是任务状态统计信息，第二个元素是逗期任务数
     *
     * @param userId 用户ID
     * @return 元组(任务状态统计, 逗期任务数)
     */
    fun getUserMonthlyTaskStatusStats(userId: Long): Mono<Pair<TaskStatusStats, Int>> {
        log.info("获取用户当月任务状态统计数据: userId={}", userId)
        
        // 获取当月时间范围
        val now = OffsetDateTime.now()
        val currentMonthStart = now.withDayOfMonth(1).withHour(0).withMinute(0).withSecond(0).withNano(0)
        val currentMonthEnd = now
        
        // 查询用户在当月的任务
        return taskRepository.list {
            fieldOf(Task::assigneeId, ComparisonOperator.EQUALS, userId)
            // 不需要限制时间范围，我们需要获取所有任务，包括已完成的任务
        }
        .collectList()
        .flatMap { tasks ->
            if (tasks.isEmpty()) {
                log.info("用户没有任务: userId={}", userId)
                return@flatMap Mono.just(Pair(TaskStatusStats(0, 0, 0, 0), 0))
            }
            
            // 查询所有任务状态
            findAllStatuses(0) // 使用0作为通用查询，获取所有项目状态
                .collectList()
                .map { statuses ->
                    val statusMap = statuses.associateBy { it.id }
                    
                    // 统计当月创建的任务数
                    val monthlyTasks = tasks.filter { task ->
                        task.createdAt >= currentMonthStart && task.createdAt <= currentMonthEnd
                    }
                    
                    val total = monthlyTasks.size
                    
                    // 统计已完成任务
                    val completedTasks = monthlyTasks.filter { task ->
                        val status = statusMap[task.statusId]
                        status?.isTerminal == true
                    }
                    val completed = completedTasks.size
                    
                    // 统计待处理任务
                    val pendingStatusIds = statuses.filter { it.isDefault }.map { it.id }
                    val pendingTasks = monthlyTasks.filter { it.statusId in pendingStatusIds }
                    val pending = pendingTasks.size
                    
                    // 进行中任务：其他任务
                    val inProgress = total - completed - pending
                    
                    // 计算逗期任务数（有到期日期且到期日期已经过去但任务未完成的任务）
                    val overdueCount = monthlyTasks.count { task ->
                        val status = statusMap[task.statusId]
                        status?.isTerminal == false && 
                        task.dueDate != null && 
                        task.dueDate!! < now
                    }
                    
                    // 计算每个状态ID下的任务数量
                    val statusCounts = monthlyTasks.groupBy { it.statusId }.mapValues { it.value.size }
                    
                    log.debug("用户当月任务状态统计详情：用户ID={}，总任务={}，已完成={}，进行中={}，待处理={}，逗期={}", 
                         userId, total, completed, inProgress, pending, overdueCount)
                    
                    // 返回任务状态统计和逗期任务数
                    Pair(
                        TaskStatusStats(total, completed, inProgress, pending, statusCounts),
                        overdueCount
                    )
                }
        }
        .onErrorResume { e ->
            log.error("获取用户当月任务状态统计数据失败: userId={}, 错误: {}", userId, e.message, e)
            Mono.just(Pair(TaskStatusStats(0, 0, 0, 0), 0))
        }
    }
    
    /**
     * 生成时间范围内的所有日期点
     * 
     * @param startDate 开始日期
     * @param endDate 结束日期
     * @param timeRange 时间范围类型
     * @return 日期点列表
     */
    private fun generateDatePoints(startDate: OffsetDateTime, endDate: OffsetDateTime, timeRange: String): List<String> {
        val result = mutableListOf<String>()
        var current = startDate
        
        val formatter = when (timeRange.lowercase()) {
            "day" -> DateTimeFormatter.ofPattern("yyyy-MM-dd")
            "week" -> DateTimeFormatter.ofPattern("yyyy-'W'w")
            "month" -> DateTimeFormatter.ofPattern("yyyy-MM")
            else -> DateTimeFormatter.ofPattern("yyyy-MM-dd")
        }
        
        while (current <= endDate) {
            val formatted = when (timeRange.lowercase()) {
                "day" -> current.format(formatter)
                "week" -> {
                    val week = current.get(WeekFields.ISO.weekOfWeekBasedYear())
                    "${current.year}-W${week.toString().padStart(2, '0')}"
                }
                "month" -> current.format(formatter)
                else -> current.format(formatter)
            }
            
            if (!result.contains(formatted)) {
                result.add(formatted)
            }
            
            current = when (timeRange.lowercase()) {
                "day" -> current.plusDays(1)
                "week" -> current.plusWeeks(1)
                "month" -> current.plusMonths(1)
                else -> current.plusDays(1)
            }
        }
        
        return result
    }

    /**
     * 获取用户最近的任务列表
     * 查询用户负责的任务，并按创建时间倒序排列
     *
     * @param userId 用户ID
     * @param page 页码，从1开始
     * @param size 每页大小
     * @return 分页任务列表
     */
    fun getUserRecentTasks(userId: Long, page: Int, size: Int): Mono<PageResult<Task>> {
        log.info("获取用户最近的任务列表: userId={}, page={}, size={}", userId, page, size)

        // 1. 查询用户分配的所有任务总数
        val countMono = taskRepository.count {
            fieldOf(Task::assigneeId, ComparisonOperator.EQUALS, userId)
        }
        
        // 2. 查询用户分配的任务，按创建时间倒序排列，并进行分页
        val tasksMono = taskRepository.list {
            fieldOf(Task::assigneeId, ComparisonOperator.EQUALS, userId)
            orderBy(desc(Task::createdAt)) // 按创建时间倒序排列，最近创建的任务优先
        }.collectList()
        
        // 3. 组合查询结果
        return Mono.zip(countMono, tasksMono)
            .map { tuple ->
                val total = tuple.t1
                val tasks = tuple.t2
                
                log.debug("用户最近的任务列表查询成功: userId={}, 总数={}, 返回数量={}", 
                         userId, total, tasks.size)
                
                // 返回分页结果
                PageResult(
                    total = total.toInt(),
                    page = page,
                    size = size,
                    items = tasks
                )
            }
            .onErrorResume { e ->
                log.error("获取用户最近的任务列表失败: userId={}, 错误: {}", userId, e.message, e)
                Mono.just(PageResult(
                    total = 0,
                    page = page,
                    size = size,
                    items = emptyList()
                ))
            }
    }
    
    /**
     * 获取任务状态趋势数据
     * 根据时间范围统计各个项目状态的任务数量
     *
     * @param projectId 项目ID
     * @param timeRange 时间范围：LAST_3_MONTHS(近3个月)、LAST_6_MONTHS(近6个月)、THIS_YEAR(今年)、LAST_YEAR(去年)
     * @return 包含时间标签和各状态任务数量的数据对象
     */
    fun getTaskStatusTrend(projectId: Long, timeRange: String = "LAST_6_MONTHS"): Mono<TaskStatusTrendData> {
        log.info("获取任务状态趋势，项目ID={}", projectId)
        
        // 1. 获取项目的所有任务状态
        val statusListMono = findAllStatuses(projectId).collectList()
        
        // 2. 获取项目的所有任务
        val tasksListMono = findTasksByProjectId(projectId).collectList()
            
        return Mono.zip(statusListMono, tasksListMono)
            .flatMap { tuple -> 
                val statuses = tuple.t1
                val tasks = tuple.t2
                
                log.debug("项目ID={}\u7684\u72b6\u6001\u5217\u8868\u6570\u91cf={}, \u4efb\u52a1\u6570\u91cf={}", 
                          projectId, statuses.size, tasks.size)
                
                // 计算时间范围
                val currentDate = LocalDate.now()
                val currentMonth = YearMonth.now()
                val (startPeriod, endPeriod) = when (timeRange) {
                    "LAST_3_MONTHS" -> {
                        log.debug("使用时间范围: 近3个月")
                        currentMonth.minusMonths(2) to currentMonth
                    }
                    "THIS_YEAR" -> {
                        log.debug("使用时间范围: 今年")
                        YearMonth.of(currentDate.year, 1) to YearMonth.of(currentDate.year, 12)
                    }
                    "LAST_YEAR" -> {
                        log.debug("使用时间范围: 去年")
                        YearMonth.of(currentDate.year - 1, 1) to YearMonth.of(currentDate.year - 1, 12)
                    }
                    else -> {
                        // 默认近6个月
                        log.debug("使用时间范围: 近6个月")
                        currentMonth.minusMonths(5) to currentMonth
                    }
                }
                
                // 准备月份标签
                val timeLabels = mutableListOf<String>()
                
                // 准备每个状态的数据列表
                val statusTrends = mutableMapOf<Long, MutableList<Int>>()
                statuses.forEach { status -> 
                    statusTrends[status.id!!] = mutableListOf()
                }
                
                // 按月遍历
                var month = startPeriod
                
                // 确定当前月份，超过当前月份的将不包含在内
                val currentYearMonth = YearMonth.now()
                
                while (!month.isAfter(endPeriod) && !month.isAfter(currentYearMonth)) {
                    // 添加月份标签 (例如 "12月")
                    timeLabels.add("${month.monthValue}月")
                    
                    // 获取当月开始和结束日期
                    val startDate = month.atDay(1).atStartOfDay().atOffset(ZoneOffset.UTC)
                    val endDate = month.atEndOfMonth().atTime(23, 59, 59).atOffset(ZoneOffset.UTC)
                    
                    // 初始化该月每个状态的任务计数为0
                    val monthStatusCounts = mutableMapOf<Long, Int>()
                    statuses.forEach { status -> 
                        monthStatusCounts[status.id!!] = 0
                    }
                    
                    // 遍历任务，统计该月每个状态的任务数量
                    tasks.forEach { task ->
                        // 检查任务在这个月是否存在或活跃
                        val taskCreatedAt = task.createdAt ?: return@forEach
                        
                        // 如果任务创建日期晚于这个月末，跳过
                        if (taskCreatedAt.isAfter(endDate)) {
                            return@forEach
                        }
                        
                        // 获取任务状态ID
                        val statusId = task.statusId ?: return@forEach
                        
                        // 如果这个状态在我们跟踪的状态列表中，增加计数
                        if (monthStatusCounts.containsKey(statusId)) {
                            monthStatusCounts[statusId] = monthStatusCounts[statusId]!! + 1
                        }
                    }
                    
                    // 将该月的统计数据添加到各状态的趋势列表中
                    statuses.forEach { status -> 
                        val statusId = status.id!!
                        val count = monthStatusCounts[statusId] ?: 0
                        statusTrends[statusId]?.add(count)
                    }
                    
                    // 移到下一个月
                    month = month.plusMonths(1)
                }
                
                // 将状态对象转换为StatusInfo对象
                val statusInfoList = statuses.map { status -> 
                    StatusInfo(
                        id = status.id!!, 
                        name = status.name,
                        color = status.color
                    )
                }
                
                Mono.just(
                    TaskStatusTrendData(
                        timeLabels = timeLabels,
                        statusList = statusInfoList,
                        statusTrends = statusTrends
                    )
                )
            }
    }
    
    /**
     * 更新任务状态
     * 将任务状态从一个状态变更为另一个状态，并记录历史
     *
     * @param taskId 任务ID
     * @param statusId 新状态ID
     * @param userId 操作者ID
     * @param history 任务历史记录（可选），如果不提供将自动创建
     * @param oldStatusId 原状态ID（可选），如果提供则进行校验，避免并发修改
     * @return 更新后的任务
     */
    fun updateTaskStatus(
        taskId: Long, 
        statusId: Long, 
        userId: Long, 
        history: TaskHistory? = null,
        oldStatusId: Long? = null
    ): Mono<Task> {
        log.info("更新任务状态，任务ID={}，新状态ID={}，用户ID={}", taskId, statusId, userId)
        
        // 1. 查询任务当前信息
        return findTaskById(taskId)
            .switchIfEmpty(Mono.error(IllegalArgumentException("任务不存在：$taskId")))
            .flatMap { task ->
                // 2. 如果提供了原状态ID，进行校验，避免并发修改
                if (oldStatusId != null && task.statusId != oldStatusId) {
                    log.warn("任务当前状态(ID:{})与期望的原状态(ID:{})不匹配，可能存在并发修改", 
                        task.statusId, oldStatusId)
                    return@flatMap Mono.error(IllegalStateException("任务当前状态已变更，请刷新后重试"))
                }
                
                // 3. 如果状态没有变化，直接返回任务
                if (task.statusId == statusId) {
                    log.info("任务状态未变化，跳过更新，任务ID={}", taskId)
                    return@flatMap Mono.just(task)
                }
                
                // 4. 记录历史
                val historyMono = if (history != null) {
                    taskHistoryRepository.save(history)
                } else {
                    // 自动创建历史记录
                    val newHistory = TaskHistory(
                        taskId = task.id,
                        userId = userId,
                        operationType = OperationType.STATUS_CHANGE,
                        fieldName = "statusId",
                        oldValue = task.statusId.toString(),
                        newValue = statusId.toString(),
                        description = "状态变更",
                        isMainTask = task.parentTaskId == null,
                        createdAt = OffsetDateTime.now(),
                        version = 1
                    )
                    taskHistoryRepository.save(newHistory)
                }
                
                // 5. 更新任务状态
                historyMono.then(Mono.defer {
                    // 修改领域对象的状态和更新时间
                    task.statusId = statusId
                    task.updatedAt = OffsetDateTime.now()
                    
                    // 保存修改后的完整对象
                    taskRepository.save(task)
                })
                .doOnSuccess { updatedTask ->
                    log.info("任务状态更新成功，任务ID={}，新状态={}", updatedTask.id, updatedTask.statusId)
                    
                    // 确定任务类型
                    val taskType = if (task.parentTaskId == null) TaskType.MAIN_TASK else TaskType.SUB_TASK
                    
                    // 发布任务状态变更事件
                    taskEventPublisher.publishTaskStatusChangedEvent(
                        taskId = updatedTask.id,
                        oldStatusId = task.statusId,
                        newStatusId = updatedTask.statusId,
                        userId = userId,
                        taskType = taskType
                    )
                }
                .doOnError { e ->
                    log.error("任务状态更新失败，任务ID={}，错误：{}", taskId, e.message, e)
                }
            }
    }
    
    /**
     * 使用命令模式更新任务状态
     * 接收ChangeStatusCommand命令对象，执行状态更新操作
     *
     * @param command 状态变更命令
     * @return 更新后的任务
     */
    fun updateTaskStatus(command: ChangeStatusCommand): Mono<Task> {
        log.info("收到状态变更命令：任务ID={}，从状态{}变更为状态{}", 
            command.taskId, command.oldStatusId, command.newStatusId)
        
        // 1. 验证命令
        val validationError = command.validate()
        if (validationError != null) {
            log.error("状态变更命令验证失败：{}", validationError)
            return Mono.error(IllegalArgumentException(validationError))
        }
        
        // 2. 创建历史记录
        val history = TaskHistory(
            taskId = command.taskId,
            userId = command.userId,
            operationType = OperationType.STATUS_CHANGE,
            fieldName = "statusId",
            oldValue = command.oldStatusId.toString(),
            newValue = command.newStatusId.toString(),
            description = command.reason ?: "状态变更",
            isMainTask = false,  // 先设置默认值，会在updateTaskStatus方法中根据实际情况重置
            createdAt = OffsetDateTime.now(),
            version = 1
        )
        
        // 3. 调用基础版本的updateTaskStatus方法，传入oldStatusId进行校验
        return updateTaskStatus(
            taskId = command.taskId, 
            statusId = command.newStatusId, 
            userId = command.userId, 
            history = history,
            oldStatusId = command.oldStatusId
        )
    }
}
