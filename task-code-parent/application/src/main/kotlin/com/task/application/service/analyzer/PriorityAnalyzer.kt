package com.task.application.service.analyzer

import com.fasterxml.jackson.databind.ObjectMapper
import com.fasterxml.jackson.module.kotlin.registerKotlinModule
import com.task.domain.model.llm.LlmResult
import com.task.domain.model.project.Project
import com.task.domain.model.task.Priority
import com.task.domain.model.task.Task
import com.task.domain.service.LlmService
import com.task.domain.service.ProjectService
import com.task.domain.service.TaskService
import org.slf4j.LoggerFactory
import org.springframework.stereotype.Service
import reactor.core.publisher.Flux
import reactor.core.publisher.Mono
import reactor.core.scheduler.Schedulers
import java.time.OffsetDateTime

/**
 * 优先级分析器
 * 用于分析需求内容，评估优先级
 */
@Service("priorityAnalyzer")
class PriorityAnalyzer(
    private val llmService: LlmService,
    private val projectService: ProjectService,
    private val taskService: TaskService
) : LlmAnalyzer {
    private val logger = LoggerFactory.getLogger(PriorityAnalyzer::class.java)

    val objectMapper = ObjectMapper().registerKotlinModule()

    /**
     * 分析需求优先级，直接返回大模型的原始响应
     * 非阻塞实现，返回Flux<LlmResult>
     *
     * @param content 需求内容
     * @param projectId 项目ID，如果为null则使用默认参数
     * @return 大模型原始响应的Flux
     */
    override fun analyze(content: String, projectId: Long?, inputs: Map<String, Any>): Flux<LlmResult> {
        if (content.isBlank()) {
            return Flux.just(LlmResult("", true))
        }

        // 如果projectId为null，使用默认参数
        if (projectId == null) {
            return analyzeWithParams(content, null, createDefaultParams(), inputs)
        }

        // 使用项目ID获取相关参数
        return getProjectParams(projectId)
            .flatMapMany { params ->
                logger.info("获取项目参数成功，项目ID={}，参数={}", projectId, params)
                analyzeWithParams(content, projectId, params, inputs)
            }
    }

    /**
     * 获取项目相关参数
     */
    private fun getProjectParams(projectId: Long): Mono<Map<String, Any>> {
        logger.info("开始获取项目参数，项目ID={}", projectId)
        
        // 定义所有需要获取的数据源
        val projectMono = projectService.findById(projectId)
            .doOnNext { project -> logger.info("获取到项目信息: {}", project) }
            .doOnError { e -> logger.error("获取项目信息失败: {}", e.message, e) }
            // 添加默认值，避免返回null
            .defaultIfEmpty(
                Project(
                    id = projectId,
                    name = "未知项目",
                    description = "无项目描述",
                    teamId = 0L,
                    creatorId = 0L,
                    version = 1
                )
            )
            .subscribeOn(Schedulers.boundedElastic())

        val highPriorityTaskCountMono = getHighPriorityTaskCount(projectId)
            .doOnNext { count -> logger.info("获取到高优先级任务数量: {}", count) }
            .onErrorReturn(0)
            .subscribeOn(Schedulers.boundedElastic())

        val blockingTaskCountMono = getBlockingTaskCount(projectId)
            .doOnNext { count -> logger.info("获取到阻塞任务数量: {}", count) }
            .onErrorReturn(0)
            .subscribeOn(Schedulers.boundedElastic())

        val upcomingDeadlineTasksMono = getUpcomingDeadlineTasks(projectId)
            .doOnNext { count -> logger.info("获取到即将到期任务数量: {}", count) }
            .onErrorReturn(0)
            .subscribeOn(Schedulers.boundedElastic())

        val taskCountsMono = taskService.countProjectTasks(projectId)
            .doOnNext { counts -> logger.info("获取到任务计数: {}", counts) }
            .onErrorReturn(Pair(0L, 0L))
            .subscribeOn(Schedulers.boundedElastic())

        val teamMemberCountMono = getTeamMemberCount(projectId)
            .doOnNext { count -> logger.info("获取到团队成员数量: {}", count) }
            .onErrorReturn(0)
            .subscribeOn(Schedulers.boundedElastic())

        logger.info("开始组合所有数据源，项目ID={}", projectId)
        
        // 组合所有数据源
        return Mono.zip(
            projectMono,
            highPriorityTaskCountMono,
            blockingTaskCountMono,
            upcomingDeadlineTasksMono,
            taskCountsMono,
            teamMemberCountMono
        )
        .doOnSubscribe { logger.info("Mono.zip已订阅，项目ID={}", projectId) }
        .doOnNext { logger.info("Mono.zip已发出值，项目ID={}", projectId) }
        .doOnError { e -> logger.error("Mono.zip发生错误: {}", e.message, e) }
        .flatMap { tuple ->
            logger.info("进入flatMap处理，项目ID={}", projectId)
            
            val project = tuple.t1
            val highPriorityTaskNum = tuple.t2
            val blockingTaskNum = tuple.t3
            val upcomingDeadlineTaskNum = tuple.t4
            val taskCounts = tuple.t5
            val teamMemberNum = tuple.t6

            // 计算工作负载，使用已获取的数据
            val inProgressTasks = taskCounts.first.toInt()
            calculateWorkload(inProgressTasks, teamMemberNum)
                .doOnNext { workload -> logger.info("计算得到工作负载: {}", workload) }
                .map { workload ->
                    // 使用 Map<String, Any> 而不是 MutableMap<String, Any>
                    val params: Map<String, Any> = mapOf(
                        // 项目相关参数
                        "projectDescription" to (project.description ?: "无项目描述"),
                        "progress" to calculateProgress(taskCounts.first, taskCounts.second),

                        // 任务相关参数
                        "highPriorityTaskNum" to highPriorityTaskNum,
                        "blockingTaskNum" to blockingTaskNum,
                        "upcomingDeadlineTaskNum" to upcomingDeadlineTaskNum,
                        "allTaskNum" to inProgressTasks,
                        "completedTaskNum" to taskCounts.second.toInt(),

                        // 团队相关参数
                        "teamMemberNum" to teamMemberNum,
                        "workload" to workload,
                    )
                    
                    logger.info("组装完成参数: {}", params)
                    params
                }
        }
        .defaultIfEmpty(
            // 提供默认参数，避免返回null
            mapOf(
                "projectDescription" to "无项目描述",
                "progress" to 0,
                "highPriorityTaskNum" to 0,
                "blockingTaskNum" to 0,
                "upcomingDeadlineTaskNum" to 0,
                "allTaskNum" to 0,
                "completedTaskNum" to 0,
                "teamMemberNum" to 0,
                "workload" to 1
            )
        )
        .doOnSuccess { params -> 
            if (params == null) {
                logger.error("getProjectParams返回了null值，这可能导致后续操作不执行")
            } else {
                logger.info("getProjectParams成功完成，返回参数: {}", params) 
            }
        }
        .onErrorResume { e ->
            logger.error("获取项目参数失败，返回默认参数: {}", e.message, e)
            Mono.just(mapOf(
                "error" to "获取项目参数失败: ${e.message}",
                "projectId" to projectId,
                "defaultParams" to true
            ))
        }
    }
    
    /**
     * 使用获取到的参数进行分析
     */
    private fun analyzeWithParams(
        content: String,
        projectId: Long?,
        params: Map<String, Any>,
        sessionInputs: Map<String, Any>
    ): Flux<LlmResult> {
        val mergedInputs = params + sessionInputs
        val conversationId = sessionInputs["_conversation_id"]?.toString()
        logger.info("开始使用参数进行分析，项目ID={}，参数={}", projectId, mergedInputs)
        
        // 调用领域层的LlmService，传递inputs
        return llmService.generateText(content, "优先级分析", conversationId = conversationId, inputs = mergedInputs)
            .doOnSubscribe { logger.info("LlmService.generateText已订阅，项目ID={}", projectId) }
            .doOnNext { result -> logger.info("LlmService返回结果: {}", result) }
            .doOnError { e -> logger.error("LlmService发生错误: {}", e.message, e) }
    }
    
    /**
     * 获取高优先级任务数量（使用百分制评分系统）
     * 将优先级分为高中低三个等级，平分100分
     *
     * @param projectId 项目ID
     * @return 高优先级任务数量的Mono
     */
    private fun getHighPriorityTaskCount(projectId: Long): Mono<Int> {
        logger.info("开始计算项目高优先级任务数量，项目ID={}", projectId)
        
        // 1. 获取项目中的所有任务
        return taskService.getByProjectId(projectId)
            .collectList()
            .flatMap { tasks ->
                if (tasks.isEmpty()) {
                    logger.info("项目没有任务，高优先级任务数量为0，项目ID={}", projectId)
                    return@flatMap Mono.just(0)
                }
                
                // 2. 获取所有任务的优先级ID
                val priorityIds = tasks.mapNotNull { it.priorityId }.distinct()
                
                // 3. 查询这些优先级的详细信息
                val priorityMonos = priorityIds.map { priorityId ->
                    taskService.findPriorityById(priorityId)
                }
                
                // 4. 合并所有优先级查询结果
                Mono.zip(priorityMonos) { prioritiesArray ->
                    val priorities = prioritiesArray.map { it as Priority }
                    
                    // 5. 计算高优先级任务数量
                    countHighPriorityTasks(tasks, priorities)
                }
            }
            .doOnSuccess { count ->
                logger.info("项目高优先级任务数量计算完成，项目ID={}，高优先级任务数量={}", projectId, count)
            }
            .onErrorResume { e ->
                logger.error("计算项目高优先级任务数量失败，项目ID={}，错误：{}", projectId, e.message, e)
                Mono.just(0)
            }
    }
    
    /**
     * 计算高优先级任务数量
     * 将优先级分为高中低三个等级，平分100分
     * 高优先级：67-100分
     * 中优先级：34-66分
     * 低优先级：0-33分
     * 
     * @param tasks 任务列表
     * @param priorities 优先级列表
     * @return 高优先级任务数量
     */
    private fun countHighPriorityTasks(
        tasks: List<Task>,
        priorities: List<Priority>
    ): Int {
        // 1. 如果优先级列表为空，返回0
        if (priorities.isEmpty()) {
            return 0
        }
        
        // 2. 定义优先级分数范围
        val highPriorityRange = 67..100
        val mediumPriorityRange = 34..66
        val lowPriorityRange = 0..33
        
        // 3. 计算每个任务的优先级分数
        val taskPriorityScores = calculateTaskPriorityScores(tasks, priorities)
        
        // 4. 统计各优先级任务数量
        val highPriorityCount = taskPriorityScores.count { (_, score) -> score in highPriorityRange }
        val mediumPriorityCount = taskPriorityScores.count { (_, score) -> score in mediumPriorityRange }
        val lowPriorityCount = taskPriorityScores.count { (_, score) -> score in lowPriorityRange }
        
        logger.info("优先级任务统计：高优先级={}，中优先级={}，低优先级={}", 
            highPriorityCount, mediumPriorityCount, lowPriorityCount)
        
        return highPriorityCount
    }
    
    /**
     * 计算所有任务的优先级分数
     * 
     * @param tasks 任务列表
     * @param priorities 优先级列表
     * @return 任务ID到优先级分数的映射
     */
    private fun calculateTaskPriorityScores(
        tasks: List<Task>,
        priorities: List<Priority>
    ): Map<Long, Int> {
        // 1. 创建优先级ID到优先级对象的映射
        val priorityMap = priorities.associateBy { it.id }
        
        // 2. 检查是否所有优先级都有score值
        val allHaveScore = priorities.all { it.score > 0 }
        
        // 3. 如果所有优先级都有score值，直接使用score
        if (allHaveScore) {
            return tasks.associate { task ->
                val priorityScore = priorityMap[task.priorityId]?.score ?: 0
                task.id to priorityScore
            }
        }
        
        // 4. 如果有优先级没有score值，使用level进行归一化计算
        // 找出最高和最低level，用于归一化
        val maxLevel = priorities.maxOf { it.level }
        val minLevel = priorities.minOf { it.level }
        val levelRange = maxLevel - minLevel
        
        // 如果所有优先级level相同，使用默认分数
        if (levelRange == 0) {
            val defaultScore = 50 // 中等优先级
            return tasks.associate { task -> task.id to defaultScore }
        }
        
        // 5. 计算每个优先级的归一化分数
        val normalizedScores = priorities.associate { priority ->
            val normalizedScore = ((priority.level - minLevel) * 100.0 / levelRange).toInt().coerceIn(0, 100)
            priority.id to normalizedScore
        }
        
        // 6. 为每个任务分配优先级分数
        return tasks.associate { task ->
            val priorityScore = normalizedScores[task.priorityId] ?: 0
            task.id to priorityScore
        }
    }

    /**
     * 计算项目进度百分比
     */
    private fun calculateProgress(totalTasks: Long, completedTasks: Long): Int {
        if (totalTasks == 0L) return 0
        return ((completedTasks.toDouble() / totalTasks) * 100).toInt().coerceIn(0, 100)
    }
    
    /**
     * 获取即将到期的任务数
     * 即将到期的任务是指截止日期在未来7天内且未完成的任务
     *
     * @param projectId 项目ID
     * @return 即将到期任务数量的Mono
     */
    private fun getUpcomingDeadlineTasks(projectId: Long): Mono<Int> {
        logger.info("开始计算项目即将到期任务数量，项目ID={}", projectId)
        
        // 获取当前时间
        val now = OffsetDateTime.now()
        // 定义"即将到期"的时间范围（未来3天内）
        val deadline = now.plusDays(3)
        
        // 获取项目中的所有任务
        return taskService.getByProjectId(projectId)
            .collectList()
            .flatMap { tasks ->
                if (tasks.isEmpty()) {
                    logger.info("项目没有任务，即将到期任务数量为0，项目ID={}", projectId)
                    return@flatMap Mono.just(0)
                }
                
                // 获取已完成任务和总任务数
                taskService.countProjectTasks(projectId)
                    .map { taskCounts ->
                        val totalTasks = taskCounts.first
                        val completedTasks = taskCounts.second
                        
                        // 计算未完成任务比例
                        val incompleteRatio = if (totalTasks > 0) {
                            (totalTasks - completedTasks).toDouble() / totalTasks
                        } else {
                            0.0
                        }
                        
                        // 统计即将到期的任务
                        val upcomingDeadlineTasks = tasks.filter { task ->
                            // 任务有截止日期，且截止日期在未来7天内
                            task.dueDate != null && 
                            task.dueDate!!.isAfter(now) &&
                            task.dueDate!!.isBefore(deadline)
                        }
                        
                        // 由于我们无法精确知道哪些任务是未完成的，使用未完成任务比例估算
                        val upcomingDeadlineCount = (upcomingDeadlineTasks.size * incompleteRatio).toInt()
                        
                        logger.info("项目即将到期任务数量计算完成，项目ID={}，即将到期任务数量={}", projectId, upcomingDeadlineCount)
                        upcomingDeadlineCount
                    }
            }
            .onErrorResume { e ->
                logger.error("计算项目即将到期任务数量失败，项目ID={}，错误：{}", projectId, e.message, e)
                Mono.just(0)
            }
    }

    /**
     * 获取团队成员数量
     * 
     * @param projectId 项目ID
     * @return 团队成员数量的Mono
     */
    private fun getTeamMemberCount(projectId: Long): Mono<Int> {
        logger.info("开始获取项目团队成员数量，项目ID={}", projectId)
        
        return projectService.findById(projectId)
            .map { project ->
                val teamId = project.teamId
                // 如果有teamId，可以查询团队成员数量
                // 这里简化处理，返回默认值
                val memberCount = 5
                
                logger.info("项目团队成员数量获取完成，项目ID={}，团队ID={}，成员数量={}", 
                    projectId, teamId, memberCount)
                
                memberCount
            }
            .onErrorResume { e ->
                logger.error("获取项目团队成员数量失败，项目ID={}，错误：{}", projectId, e.message, e)
                Mono.just(0)
            }
    }
    
    /**
     * 计算当前工作负载
     * 
     * @param inProgressTasks 进行中的任务数量
     * @param teamMemberCount 团队成员数量
     * @return 工作负载百分比的Mono
     */
    private fun calculateWorkload(inProgressTasks: Int, teamMemberCount: Int): Mono<Int> {
        logger.info("开始计算工作负载，进行中任务数量={}，团队成员数量={}", inProgressTasks, teamMemberCount)
        
        return Mono.fromCallable {
            if (teamMemberCount == 0) {
                logger.info("团队成员数量为0，工作负载设为100%")
                return@fromCallable 100
            }
            
            // 简单估算：每个团队成员同时处理2个任务为适中负载(50%)
            val workload = (inProgressTasks.toDouble() / (teamMemberCount * 2)) * 100
            val result = workload.toInt().coerceIn(0, 100)
            
            logger.info("工作负载计算完成，工作负载={}%", result)
            result
        }.onErrorResume { e ->
            logger.error("计算工作负载失败，错误：{}", e.message, e)
            Mono.just(50) // 默认中等工作负载
        }
    }

    /**
     * 获取阻塞任务数量
     * 阻塞任务是指高优先级且未完成的任务，这些任务可能会阻碍项目进展
     *
     * @param projectId 项目ID
     * @return 阻塞任务数量的Mono
     */
    private fun getBlockingTaskCount(projectId: Long): Mono<Int> {
        logger.info("开始计算项目阻塞任务数量，项目ID={}", projectId)
        
        // 1. 获取项目中的所有任务
        return taskService.getByProjectId(projectId)
            .collectList()
            .flatMap { tasks ->
                if (tasks.isEmpty()) {
                    logger.info("项目没有任务，阻塞任务数量为0，项目ID={}", projectId)
                    return@flatMap Mono.just(0)
                }
                
                // 2. 获取所有任务的优先级
                val priorityIds = tasks.mapNotNull { it.priorityId }.distinct()
                val priorityMonos = priorityIds.map { priorityId ->
                    taskService.findPriorityById(priorityId)
                }
                
                if (priorityMonos.isEmpty()) {
                    return@flatMap Mono.just(0)
                }
                
                // 3. 获取已完成任务和总任务数
                val taskCountsMono = taskService.countProjectTasks(projectId)
                
                // 4. 组合优先级和任务计数的结果
                Mono.zip(
                    Mono.zip(priorityMonos) { prioritiesArray ->
                        prioritiesArray.map { it as Priority }
                    },
                    taskCountsMono
                ).map { tuple ->
                    val priorities = tuple.t1
                    val taskCounts = tuple.t2
                    
                    // 5. 计算每个任务的优先级分数
                    val taskPriorityScores = calculateTaskPriorityScores(tasks, priorities)
                    
                    // 6. 统计高优先级任务数量
                    val highPriorityTasks = tasks.filter { task ->
                        val score = taskPriorityScores[task.id] ?: 0
                        score >= 67  // 高优先级阈值
                    }
                    
                    // 7. 计算阻塞任务数量
                    // 阻塞任务 = 高优先级任务 * 未完成任务比例
                    val totalTasks = taskCounts.first
                    val completedTasks = taskCounts.second
                    
                    val blockingCount = if (totalTasks > 0) {
                        val incompleteRatio = (totalTasks - completedTasks).toDouble() / totalTasks
                        (highPriorityTasks.size * incompleteRatio).toInt()
                    } else {
                        0
                    }
                    
                    logger.info("项目阻塞任务数量计算完成，项目ID={}，高优先级任务数量={}，阻塞任务数量={}", 
                        projectId, highPriorityTasks.size, blockingCount)
                    
                    blockingCount
                }
            }
            .onErrorResume { e ->
                logger.error("计算项目阻塞任务数量失败，项目ID={}，错误：{}", projectId, e.message, e)
                Mono.just(0)
            }
    }

    /**
     * 创建默认参数
     */
    private fun createDefaultParams(): Map<String, Any> {
        return mapOf(
            "projectDescription" to "无项目描述",
            "progress" to 0,
            "highPriorityTaskNum" to 0,
            "blockingTaskNum" to 0,
            "upcomingDeadlineTaskNum" to 0,
            "allTaskNum" to 0,
            "completedTaskNum" to 0,
            "teamMemberNum" to 0,
            "workload" to 1
        )
    }
}
