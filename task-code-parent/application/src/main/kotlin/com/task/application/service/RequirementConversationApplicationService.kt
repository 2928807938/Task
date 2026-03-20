package com.task.application.service

import com.task.application.request.CreateRequirementConversationRequest
import com.task.application.vo.RequirementConversationHistoryBriefVO
import com.task.application.vo.RequirementConversationHistoryDetailVO
import com.task.application.vo.RequirementConversationListBriefVO
import com.task.application.vo.RequirementConversationListDetailedVO
import com.task.domain.model.task.requirementcompleteness.Aspect
import com.task.domain.model.task.requirementcompleteness.OptimizationSuggestion
import com.task.domain.model.task.requirementpriority.Factors
import com.task.domain.model.task.requirementpriority.PriorityDetails
import com.task.domain.model.task.requirementpriority.Scheduling
import com.task.domain.model.task.requirementsuggestion.Suggestion
import com.task.domain.model.task.requirementsummaryanalysis.*
import com.task.domain.model.task.requirementtaskbreakdown.SubTask
import com.task.domain.service.*
import org.slf4j.LoggerFactory
import org.springframework.stereotype.Service
import reactor.core.publisher.Flux
import reactor.core.publisher.Mono
import java.time.OffsetDateTime

/**
 * 需求对话列表应用服务
 * 负责处理需求对话列表相关的应用层业务逻辑
 */
@Service
class RequirementConversationApplicationService(
    private val requirementConversationService: RequirementConversationService,
    private val requirementConversationListService: RequirementConversationListService,
    private val requirementConversationTurnService: RequirementConversationTurnService,
    private val requirementCategoryService: RequirementCategoryService,
    private val requirementCompletenessService: RequirementCompletenessService,
    private val requirementPriorityService: RequirementPriorityService,
    private val requirementSuggestionService: RequirementSuggestionService,
    private val requirementSummaryAnalysisService: RequirementSummaryAnalysisService,
    private val requirementTaskBreakdownService: RequirementTaskBreakdownService,
    private val requirementWorkloadService: RequirementWorkloadService,
    private val projectService: ProjectService
) {
    private val log = LoggerFactory.getLogger(this::class.java)


    /**
     * 获取30天内的需求对话列表
     * 只返回id、title、tags、colors和创建时间
     * @return 简化的需求对话列表视图对象流
     */
    fun listRecent(): Flux<RequirementConversationListBriefVO> {
        log.info("获取30天内的需求对话列表")
        val thirtyDaysAgo = OffsetDateTime.now().minusDays(30)
        
        return requirementConversationService.listRecentByDate(thirtyDaysAgo)
            .flatMap { conversationList ->
                val categoryId = conversationList.requirementCategoryId
                if (categoryId != null) {
                    requirementCategoryService.getById(categoryId)
                        .map { category -> 
                            RequirementConversationListBriefVO.fromDomain(conversationList, category)
                        }
                        .onErrorResume { 
                            // 如果分类获取失败，仍然返回对话列表，但没有标签和颜色
                            log.warn("获取需求分类失败, id={}, error={}", categoryId, it.message)
                            Mono.just(RequirementConversationListBriefVO.fromDomain(conversationList))
                        }
                } else {
                    // 没有关联分类ID的情况
                    Mono.just(RequirementConversationListBriefVO.fromDomain(conversationList))
                }
            }
    }

    /**
     * 查询项目下的历史会话列表
     */
    fun listProjectHistories(projectId: Long): Flux<RequirementConversationHistoryBriefVO> {
        log.info("查询项目历史会话列表, projectId={}", projectId)

        return projectService.findById(projectId)
            .switchIfEmpty(Mono.error(IllegalArgumentException("项目不存在，ID: $projectId")))
            .flatMapMany {
                requirementConversationListService.listByProjectId(projectId)
                    .flatMap { conversationList ->
                        requirementConversationService.getByConversationListId(requireNotNull(conversationList.id))
                            .map { conversation ->
                                RequirementConversationHistoryBriefVO.fromDomain(conversationList, conversation)
                            }
                            .switchIfEmpty(
                                Mono.just(RequirementConversationHistoryBriefVO.fromDomain(conversationList, null))
                            )
                    }
            }
    }

    /**
     * 根据会话锚点ID查询历史详情
     */
    fun getHistoryByConversationListId(conversationListId: Long): Mono<RequirementConversationHistoryDetailVO> {
        log.info("查询历史会话详情, conversationListId={}", conversationListId)

        return requirementConversationListService.getById(conversationListId)
            .flatMap { conversationList ->
                requirementConversationTurnService.listByConversationListId(conversationListId)
                    .map { turn -> com.task.application.vo.RequirementConversationTurnVO.fromDomain(turn) }
                    .collectList()
                    .flatMap { turns ->
                        requirementConversationService.getByConversationListId(conversationListId)
                            .map { conversation ->
                                RequirementConversationHistoryDetailVO.fromDomain(conversationList, conversation, turns)
                            }
                            .switchIfEmpty(
                                Mono.just(
                                    RequirementConversationHistoryDetailVO.fromDomain(
                                        conversationList = conversationList,
                                        conversation = null,
                                        turns = turns
                                    )
                                )
                            )
                    }
            }
    }

    /**
     * 根据ID获取需求对话列表
     * 包含所有关联表的详细数据
     * @param id 需求对话列表ID
     * @return 详细的需求对话列表视图对象
     */
    fun getById(id: Long): Mono<RequirementConversationListDetailedVO> {
        log.info("根据ID获取需求对话列表及关联数据, id={}", id)
        
        return requirementConversationService.getById(id)
            .flatMap { conversationList ->
                // 准备Mono容器，用于存放各个关联表的数据
                val categoryMono = if (conversationList.requirementCategoryId != null) {
                    requirementCategoryService.getById(conversationList.requirementCategoryId!!)
                        .onErrorResume { 
                            log.warn("获取需求分类失败, id={}, error={}", conversationList.requirementCategoryId, it.message)
                            Mono.empty()
                        }
                } else Mono.empty()
                
                val priorityMono = if (conversationList.requirementPriorityId != null) {
                    requirementPriorityService.getById(conversationList.requirementPriorityId!!)
                        .onErrorResume {
                            log.warn("获取需求优先级失败, id={}, error={}", conversationList.requirementPriorityId, it.message)
                            Mono.empty()
                        }
                } else Mono.empty()
                
                val workloadMono = if (conversationList.requirementWorkloadId != null) {
                    requirementWorkloadService.getById(conversationList.requirementWorkloadId!!)
                        .onErrorResume {
                            log.warn("获取需求工作量失败, id={}, error={}", conversationList.requirementWorkloadId, it.message)
                            Mono.empty()
                        }
                } else Mono.empty()
                
                val taskBreakdownMono = if (conversationList.requirementTaskBreakdownId != null) {
                    requirementTaskBreakdownService.getById(conversationList.requirementTaskBreakdownId!!)
                        .onErrorResume {
                            log.warn("获取需求任务拆分失败, id={}, error={}", conversationList.requirementTaskBreakdownId, it.message)
                            Mono.empty()
                        }
                } else Mono.empty()
                
                val completenessMono = if (conversationList.requirementCompletenessId != null) {
                    requirementCompletenessService.getById(conversationList.requirementCompletenessId!!)
                        .onErrorResume {
                            log.warn("获取需求完整度检查失败, id={}, error={}", conversationList.requirementCompletenessId, it.message)
                            Mono.empty()
                        }
                } else Mono.empty()
                
                val suggestionMono = if (conversationList.requirementSuggestionId != null) {
                    requirementSuggestionService.getById(conversationList.requirementSuggestionId!!)
                        .onErrorResume {
                            log.warn("获取需求智能建议失败, id={}, error={}", conversationList.requirementSuggestionId, it.message)
                            Mono.empty()
                        }
                } else Mono.empty()
                
                val summaryAnalysisMono = if (conversationList.requirementSummaryAnalysisId != null) {
                    requirementSummaryAnalysisService.getById(conversationList.requirementSummaryAnalysisId!!)
                        .onErrorResume {
                            log.warn("获取需求总结分析失败, id={}, error={}", conversationList.requirementSummaryAnalysisId, it.message)
                            Mono.empty()
                        }
                } else Mono.empty()
                
                // 使用zip合并所有Mono结果
                Mono.zip(
                    Mono.just(conversationList),
                    categoryMono,
                    priorityMono,
                    workloadMono,
                    taskBreakdownMono,
                    completenessMono,
                    suggestionMono,
                    summaryAnalysisMono
                ).map { tuple ->
                    // 从tuple中提取各个结果并创建DetailedVO
                    RequirementConversationListDetailedVO.fromDomain(
                        conversationList = tuple.t1,
                        category = tuple.t2,
                        priority = tuple.t3,
                        workload = tuple.t4,
                        taskBreakdown = tuple.t5,
                        completeness = tuple.t6,
                        suggestion = tuple.t7,
                        summaryAnalysis = tuple.t8
                    )
                }
            }
    }

    /**
     * 创建需求对话列表及其关联模型
     * @param request 创建需求对话列表请求
     * @return 创建后的需求对话列表ID
     */
    fun create(request: CreateRequirementConversationRequest): Mono<Long> {
        log.info("创建需求对话列表, title={}, conversationListId={}", request.title, request.conversationListId)
        
        // 将新的数据结构转换为领域模型需要的参数
        val category = request.requirementCategory
        val priority = request.priorityAnalysis.priority
        val scheduling = request.priorityAnalysis.scheduling
        val workload = request.workloadEstimation
        val taskBreakdown = request.taskBreakdown
        val completeness = request.requirementCompleteness
        val suggestions = request.requirementSuggestions
        val analysisSummary = request.requirementAnalysisSummary
        
        return requirementConversationService.createWithRelatedModels(
            title = request.title,
            conversationListId = request.conversationListId,
            startStatus = "draft", // 添加缺少的startStatus参数
            tags = category.tags,
            colors = category.colors,
            
            // 需求完整度
            overallCompleteness = completeness.overallCompleteness,
            aspects = completeness.aspects.map { aspect -> 
                Aspect(
                    name = aspect.name,
                    completeness = aspect.completeness
                )
            },
            optimizationSuggestions = completeness.optimizationSuggestions.map { suggestion ->
                OptimizationSuggestion(
                    icon = suggestion.icon,
                    content = suggestion.content
                )
            },
            
            // 优先级分析
            priority = PriorityDetails(
                level = priority.level,
                score = priority.score,
                analysis = priority.analysis
            ),
            scheduling = Scheduling(
                recommendation = scheduling.recommendation
            ),
            factors = Factors(
                difficulty = scheduling.factors.difficulty,
                resourceMatch = scheduling.factors.resourceMatch,
                dependencies = scheduling.factors.dependencies
            ),
            justification = scheduling.justification,
            
            // 智能建议
            suggestions = suggestions.suggestions.map { suggestion ->
                Suggestion(
                    type = suggestion.type,
                    title = suggestion.title,
                    icon = suggestion.icon,
                    color = suggestion.color,
                    description = suggestion.description
                )
            },
            
            // 需求分析总结
            summary = Summary(
                title = analysisSummary.summary.title,
                overview = analysisSummary.summary.overview,
                keyPoints = analysisSummary.summary.keyPoints,
                challenges = analysisSummary.summary.challenges,
                opportunities = analysisSummary.summary.opportunities
            ),
            taskArrangement = TaskArrangement(
                phases = analysisSummary.taskArrangement.phases.map { phase ->
                    Phase(
                        name = phase.name,
                        description = phase.description,
                        estimatedWorkload = phase.estimatedWorkload,
                        suggestedTimeframe = phase.suggestedTimeframe,
                        tasks = phase.tasks.map { task ->
                            ArrangementTask(
                                name = task.name,
                                priority = task.priority,
                                estimatedWorkload = task.estimatedWorkload,
                                dependencies = task.dependencies,
                                assignmentSuggestion = task.assignmentSuggestion
                            )
                        }
                    )
                },
                resourceRecommendations = ResourceRecommendation(
                    personnel = analysisSummary.taskArrangement.resourceRecommendations.personnel,
                    skills = analysisSummary.taskArrangement.resourceRecommendations.skills,
                    tools = analysisSummary.taskArrangement.resourceRecommendations.tools
                ),
                riskManagement = RiskManagement(
                    risk = analysisSummary.taskArrangement.riskManagement.map { it.risk },
                    impact = analysisSummary.taskArrangement.riskManagement.map { it.impact },
                    mitigation = analysisSummary.taskArrangement.riskManagement.map { it.mitigation }
                )
            ),
            
            // 任务拆分
            mainTask = taskBreakdown.mainTask,
            subTasks = taskBreakdown.subTasks.map { subTask ->
                SubTask(
                    id = null,
                    taskId = null, // 初始创建时没有taskId
                    description = subTask.description,
                    priority = when (subTask.priority.lowercase()) {
                        "high" -> 3
                        "medium" -> 2
                        "low" -> 1
                        else -> 0
                    }, // 使用字符串priority转换为数值
                    parallelGroup = subTask.parallelGroup
                )
            },
            parallelismScore = taskBreakdown.parallelismScore,
            parallelExecutionTips = taskBreakdown.parallelExecutionTips,
            
            // 工作量分析
            optimistic = workload.optimistic,
            mostLikely = workload.mostLikely,
            pessimistic = workload.pessimistic,
            expected = workload.expected,
            standardDeviation = workload.standardDeviation
        ).map { conversation -> conversation.id!! } // 从RequirementConversationList提取ID
    }

    /**
     * 删除需求对话列表及其关联模型
     * @param id 需求对话列表ID
     * @return Mono<Void>
     */
    fun delete(id: Long): Mono<Void> {
        log.info("删除需求对话列表及关联模型, id={}", id)
        return requirementConversationService.delete(id)
    }
} 
