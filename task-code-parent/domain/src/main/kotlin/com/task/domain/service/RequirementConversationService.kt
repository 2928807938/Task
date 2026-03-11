package com.task.domain.service

import com.task.domain.model.common.ComparisonOperator
import com.task.domain.model.common.SortDirection
import com.task.domain.model.common.SortField
import com.task.domain.model.common.fieldOf
import com.task.domain.model.task.requirementcompleteness.Aspect
import com.task.domain.model.task.requirementcompleteness.OptimizationSuggestion
import com.task.domain.model.task.requirementconversationlist.RequirementConversation
import com.task.domain.model.task.requirementpriority.Factors
import com.task.domain.model.task.requirementpriority.PriorityDetails
import com.task.domain.model.task.requirementpriority.Scheduling
import com.task.domain.model.task.requirementsuggestion.Suggestion
import com.task.domain.model.task.requirementsummaryanalysis.Summary
import com.task.domain.model.task.requirementsummaryanalysis.TaskArrangement
import com.task.domain.model.task.requirementtaskbreakdown.SubTask
import com.task.domain.repository.RequirementConversationListRepository
import com.task.domain.repository.RequirementConversationRepository
import com.task.domain.transaction.ReactiveTransactionalOutbox
import org.slf4j.LoggerFactory
import org.springframework.stereotype.Service
import reactor.core.publisher.Flux
import reactor.core.publisher.Mono
import java.time.OffsetDateTime

/**
 * 需求对话列表服务
 * 负责处理需求对话列表领域模型的业务逻辑
 */
@Service
class RequirementConversationService(
    private val requirementConversationRepository: RequirementConversationRepository,
    private val requirementConversationListRepository: RequirementConversationListRepository,
    // 注入其他服务
    private val requirementCategoryService: RequirementCategoryService,
    private val requirementCompletenessService: RequirementCompletenessService,
    private val requirementPriorityService: RequirementPriorityService,
    private val requirementSuggestionService: RequirementSuggestionService,
    private val requirementSummaryAnalysisService: RequirementSummaryAnalysisService,
    private val requirementTaskBreakdownService: RequirementTaskBreakdownService,
    private val requirementWorkloadService: RequirementWorkloadService
) {
    private val log = LoggerFactory.getLogger(this::class.java)

    /**
     * 根据ID获取需求对话列表
     */
    fun getById(id: Long): Mono<RequirementConversation> {
        log.info("根据ID获取需求对话列表, id={}", id)
        return requirementConversationRepository.findById(id)
    }

    /**
     * 获取指定日期之后的需求对话列表
     * @param date 起始日期，只返回此日期之后的数据
     * @return 需求对话列表领域模型流
     */
    fun listRecentByDate(date: OffsetDateTime): Flux<RequirementConversation> {
        log.info("获取指定日期后的需求对话列表, date={}", date)
        return requirementConversationRepository.list {
            fieldOf(RequirementConversation::createdAt, ComparisonOperator.GREATER_OR_EQUAL, date)
            orderBy(SortField(RequirementConversation::createdAt.name, SortDirection.DESC))
        }
    }

    /**
     * 创建需求对话列表
     * 同时创建并关联所有相关的领域模型
     * 
     * @param title 对话列表标题
     * @param conversationListId 需求对话列表基础记录ID（来自 t_requirement_conversation_list.id）
     * @param startStatus 开始状态
     * @param tags 创建分类时使用的标签
     * @param colors 创建分类时使用的颜色
     * @param overallCompleteness 创建完整度检查时使用的总体完整度
     * @param aspects 创建完整度检查时使用的各方面完整度
     * @param optimizationSuggestions 创建完整度检查时使用的优化建议
     * @param priority 创建优先级时使用的优先级详情
     * @param scheduling 创建优先级时使用的排期信息
     * @param factors 创建优先级时使用的因素信息
     * @param justification 创建优先级时使用的优先级理由
     * @param suggestions 创建智能建议时使用的建议列表
     * @param summary 创建摘要分析时使用的摘要信息
     * @param taskArrangement 创建摘要分析时使用的任务安排
     * @param mainTask 创建任务拆分时使用的主任务描述
     * @param subTasks 创建任务拆分时使用的子任务列表
     * @param parallelismScore 创建任务拆分时使用的并行度评分
     * @param parallelExecutionTips 创建任务拆分时使用的并行执行提示
     * @param optimistic 创建工作量时使用的乐观估计工作量
     * @param mostLikely 创建工作量时使用的最可能工作量
     * @param pessimistic 创建工作量时使用的悲观估计工作量
     * @param expected 创建工作量时使用的预期工作量
     * @param standardDeviation 创建工作量时使用的标准偏差
     */
    @ReactiveTransactionalOutbox
    fun createWithRelatedModels(
        title: String,
        conversationListId: Long,
        startStatus: String,
        tags: List<String>,
        colors: List<String>,
        overallCompleteness: String,
        aspects: List<Aspect>,
        optimizationSuggestions: List<OptimizationSuggestion>,
        priority: PriorityDetails,
        scheduling: Scheduling,
        factors: Factors,
        justification: String,
        suggestions: List<Suggestion>,
        summary: Summary,
        taskArrangement: TaskArrangement,
        mainTask: String,
        subTasks: List<SubTask>,
        parallelismScore: Int,
        parallelExecutionTips: String,
        optimistic: String,
        mostLikely: String,
        pessimistic: String,
        expected: String,
        standardDeviation: String
    ): Mono<RequirementConversation> {
        log.info(
            "创建需求对话列表及关联模型, title={}, conversationListId={}, startStatus={}",
            title,
            conversationListId,
            startStatus
        )

        // 必须是已存在的基础记录ID
        return requirementConversationListRepository.findById(conversationListId)
            .switchIfEmpty(Mono.defer {
                val message = "conversationListId=$conversationListId 不存在于 t_requirement_conversation_list"
                log.warn(message)
                Mono.error(IllegalArgumentException(message))
            })
            // conversationListId 已存在时直接复用既有记录，避免重复新增
            .flatMap {
                requirementConversationRepository.exists<RequirementConversation> {
                    fieldOf(RequirementConversation::conversationListId, ComparisonOperator.EQUALS, conversationListId)
                }
            }
            .flatMap { exists ->
                if (exists) {
                    log.info("conversationListId={} 已存在，执行增量更新流程", conversationListId)
                    return@flatMap requirementConversationRepository.findOne<RequirementConversation> {
                        fieldOf(RequirementConversation::conversationListId, ComparisonOperator.EQUALS, conversationListId)
                    }.switchIfEmpty(Mono.defer {
                        val message = "conversationListId=$conversationListId 已存在但无法查询到对应需求对话列表"
                        log.error(message)
                        Mono.error(IllegalStateException(message))
                    }).flatMap { existingConversation ->
                        updateWithRelatedModels(
                            id = existingConversation.id
                                ?: return@flatMap Mono.error(IllegalStateException("conversationListId=$conversationListId 的会话ID为空")),
                            title = title,
                            startStatus = startStatus,
                            tags = tags,
                            colors = colors,
                            overallCompleteness = overallCompleteness,
                            aspects = aspects,
                            optimizationSuggestions = optimizationSuggestions,
                            priority = priority,
                            scheduling = scheduling,
                            factors = factors,
                            justification = justification,
                            suggestions = suggestions,
                            summary = summary,
                            taskArrangement = taskArrangement,
                            mainTask = mainTask,
                            subTasks = subTasks,
                            parallelismScore = parallelismScore,
                            parallelExecutionTips = parallelExecutionTips,
                            optimistic = optimistic,
                            mostLikely = mostLikely,
                            pessimistic = pessimistic,
                            expected = expected,
                            standardDeviation = standardDeviation
                        )
                    }
                }

                // 1. 创建并保存对话列表
                RequirementConversation.create(
                    title = title,
                    startStatus = startStatus,
                    conversationListId = conversationListId
                )
                .let { requirementConversationRepository.save(it) }
                .flatMap { savedList ->
                    log.info("已创建需求对话列表，id={}", savedList.id)

                    // 2. 创建需求分类并关联（必须先完成）
                    requirementCategoryService.create(
                        tags = tags,
                        colors = colors,
                        conversationList = savedList
                    ).onErrorResume { error ->
                        log.error("创建需求分类失败: {}", error.message, error)
                        // 即使分类创建失败，仍然将原始对话列表返回以继续流程
                        Mono.just(savedList)
                    }
                }
                // 3. 串行创建需求完整度检查并关联
                .flatMap { updatedList ->
                    val conversation = updatedList as RequirementConversation
                    log.info("已关联需求分类，继续关联需求完整度检查，id={}", conversation.id)
                    log.debug("开始创建需求完整度检查: overallCompleteness={}, aspects.size={}, suggestions.size={}",
                        overallCompleteness, aspects.size, optimizationSuggestions.size)
                    requirementCompletenessService.create(
                        overallCompleteness = overallCompleteness,
                        aspects = aspects,
                        optimizationSuggestions = optimizationSuggestions,
                        conversationList = conversation
                    ).onErrorResume { error ->
                        log.error("创建需求完整度失败: {}", error.message, error)
                        // 继续下一步
                        Mono.just(conversation)
                    }
                }
                // 4. 串行创建需求优先级并关联
                .flatMap { updatedList ->
                    val conversation = updatedList as RequirementConversation
                    log.info("已关联需求完整度检查，继续关联需求优先级，id={}", conversation.id)
                    log.debug("开始创建需求优先级: priority={}, scheduling={}, justification={}",
                        priority.level, scheduling.recommendation, justification)
                    requirementPriorityService.create(
                        priority = priority,
                        scheduling = scheduling,
                        factors = factors,
                        justification = justification,
                        conversationList = conversation
                    ).onErrorResume { error ->
                        log.error("创建需求优先级失败: {}", error.message, error)
                        // 继续下一步
                        Mono.just(conversation)
                    }
                }
                // 5. 串行创建需求智能建议并关联
                .flatMap { updatedList ->
                    val conversation = updatedList as RequirementConversation
                    log.info("已关联需求优先级，继续关联需求智能建议，id={}", conversation.id)
                    log.debug("开始创建需求智能建议: suggestions.size={}", suggestions.size)
                    requirementSuggestionService.create(
                        suggestions = suggestions,
                        conversationList = conversation
                    ).onErrorResume { error ->
                        log.error("创建需求智能建议失败: {}", error.message, error)
                        // 继续下一步
                        Mono.just(conversation)
                    }
                }
                // 6. 串行创建需求摘要分析并关联
                .flatMap { updatedList ->
                    val conversation = updatedList as RequirementConversation
                    log.info("已关联需求智能建议，继续关联需求摘要分析，id={}", conversation.id)
                    log.debug("开始创建需求摘要分析: summary.title={}, phases.size={}",
                        summary.title, taskArrangement.phases.size)
                    requirementSummaryAnalysisService.create(
                        summary = summary,
                        taskArrangement = taskArrangement,
                        conversationList = conversation
                    ).onErrorResume { error ->
                        log.error("创建需求摘要分析失败: {}", error.message, error)
                        // 继续下一步
                        Mono.just(conversation)
                    }
                }
                // 7. 串行创建需求任务拆分并关联
                .flatMap { updatedList ->
                    val conversation = updatedList as RequirementConversation
                    log.info("已关联需求摘要分析，继续关联需求任务拆分，id={}", conversation.id)
                    log.debug("开始创建需求任务拆分: mainTask={}, subTasks.size={}, parallelismScore={}",
                        mainTask, subTasks.size, parallelismScore)
                    requirementTaskBreakdownService.create(
                        mainTask = mainTask,
                        subTasks = subTasks,
                        parallelismScore = parallelismScore,
                        parallelExecutionTips = parallelExecutionTips,
                        conversationList = conversation
                    ).onErrorResume { error ->
                        log.error("创建需求任务拆分失败: {}", error.message, error)
                        // 继续下一步
                        Mono.just(conversation)
                    }
                }
                // 8. 串行创建需求工作量并关联
                .flatMap { updatedList ->
                    val conversation = updatedList as RequirementConversation
                    log.info("已关联需求任务拆分，继续关联需求工作量，id={}", conversation.id)
                    log.debug("开始创建需求工作量: optimistic={}, mostLikely={}, pessimistic={}, expected={}",
                        optimistic, mostLikely, pessimistic, expected)
                    requirementWorkloadService.create(
                        optimistic = optimistic,
                        mostLikely = mostLikely,
                        pessimistic = pessimistic,
                        expected = expected,
                        standardDeviation = standardDeviation,
                        conversationList = conversation
                    ).onErrorResume { error ->
                        log.error("创建需求工作量失败: {}", error.message, error)
                        // 继续下一步
                        Mono.just(conversation)
                    }
                }
                // 9. 最后获取完整的对话列表并返回
                .flatMap { finalList ->
                    val conversation = finalList as RequirementConversation
                    log.info("所有关联实体创建完成，返回最终结果，id={}", conversation.id)
                    // 重新查询最新的对话列表以确保数据一致性
                    requirementConversationRepository.findById(conversation.id!!)
                        .switchIfEmpty(Mono.defer {
                            log.warn("无法找到最终的对话列表，返回当前对象, id={}", conversation.id)
                            Mono.just(conversation)
                        })
                        .doOnSuccess { result ->
                            log.info("最终结果: id={}, 分类Id={}, 完整度Id={}, 优先级Id={}, 建议Id={}, 分析Id={}, 任务拆分Id={}, 工作量Id={}",
                                result.id, result.requirementCategoryId, result.requirementCompletenessId,
                                result.requirementPriorityId, result.requirementSuggestionId,
                                result.requirementSummaryAnalysisId, result.requirementTaskBreakdownId,
                                result.requirementWorkloadId)
                        }
                }
                // 10. 添加错误处理和日志记录
                .doOnError { error ->
                    log.error("创建需求对话列表及关联模型失败: {}", error.message, error)
                }
                // 添加通用的错误恢复，确保即使出错也不会完全失败
                .onErrorResume { error ->
                    log.error("需求对话列表创建过程发生异常，尝试恢复: {}", error.message, error)
                    // 尝试获取已创建的对话列表
                    requirementConversationRepository.findOne {
                        fieldOf(RequirementConversation::title, ComparisonOperator.EQUALS, title)
                    }
                    .switchIfEmpty(Mono.defer {
                        log.error("无法通过标题找到对话列表，项目创建完全失败")
                        Mono.error(error)
                    })
                }
            }
    }
    
   
    /**
     * 更新需求对话列表
     */
    fun update(id: Long, title: String, startStatus: String): Mono<RequirementConversation> {
        log.info("更新需求对话列表, id={}, title={}, startStatus={}", id, title, startStatus)
        return requirementConversationRepository.findById(id)
            .flatMap { conversationList ->
                val updated = conversationList.copy(
                    title = title,
                    startStatus = startStatus
                )
                requirementConversationRepository.update(updated)
            }
    }

    /**
     * 更新需求对话列表及其所有关联模型
     * 同时更新所有关联的领域模型
     * 
     * @param id 需要更新的对话列表ID
     * @param title 对话列表标题
     * @param startStatus 开始状态
     * @param tags 更新分类时使用的标签
     * @param colors 更新分类时使用的颜色
     * @param overallCompleteness 更新完整度检查时使用的总体完整度
     * @param aspects 更新完整度检查时使用的各方面完整度
     * @param optimizationSuggestions 更新完整度检查时使用的优化建议
     * @param priority 更新优先级时使用的优先级详情
     * @param scheduling 更新优先级时使用的排期信息
     * @param factors 更新优先级时使用的因素信息
     * @param justification 更新优先级时使用的优先级理由
     * @param suggestions 更新智能建议时使用的建议列表
     * @param summary 更新摘要分析时使用的摘要信息
     * @param taskArrangement 更新摘要分析时使用的任务安排
     * @param mainTask 更新任务拆分时使用的主任务描述
     * @param subTasks 更新任务拆分时使用的子任务列表
     * @param parallelismScore 更新任务拆分时使用的并行度评分
     * @param parallelExecutionTips 更新任务拆分时使用的并行执行提示
     * @param optimistic 更新工作量时使用的乐观估计工作量
     * @param mostLikely 更新工作量时使用的最可能工作量
     * @param pessimistic 更新工作量时使用的悲观估计工作量
     * @param expected 更新工作量时使用的预期工作量
     * @param standardDeviation 更新工作量时使用的标准偏差
     */
    @ReactiveTransactionalOutbox
    fun updateWithRelatedModels(
        id: Long,
        title: String,
        startStatus: String,
        tags: List<String>,
        colors: List<String>,
        overallCompleteness: String,
        aspects: List<Aspect>,
        optimizationSuggestions: List<OptimizationSuggestion>,
        priority: PriorityDetails,
        scheduling: Scheduling,
        factors: Factors,
        justification: String,
        suggestions: List<Suggestion>,
        summary: Summary,
        taskArrangement: TaskArrangement,
        mainTask: String,
        subTasks: List<SubTask>,
        parallelismScore: Int,
        parallelExecutionTips: String,
        optimistic: String,
        mostLikely: String,
        pessimistic: String,
        expected: String,
        standardDeviation: String
    ): Mono<RequirementConversation> {
        log.info("更新需求对话列表及关联模型, id={}, title={}, startStatus={}", id, title, startStatus)
        
        // 1. 查找并更新对话列表基本信息
        return requirementConversationRepository.findById(id)
            .flatMap { conversationList ->
                val updated = conversationList.copy(
                    title = title,
                    startStatus = startStatus
                )
                requirementConversationRepository.update(updated)
            }
            .flatMap { updatedList ->
                log.info("已更新需求对话列表基本信息，id={}", updatedList.id)
                
                // 2. 更新需求分类（必须先完成）
                val categoryId = updatedList.requirementCategoryId
                if (categoryId == null) {
                    log.warn("需求对话列表没有关联的需求分类，创建新的分类")
                    return@flatMap requirementCategoryService.create(
                        tags = tags,
                        colors = colors,
                        conversationList = updatedList
                    ) .map { it as RequirementConversation }
                }
                
                requirementCategoryService.update(
                    id = categoryId,
                    tags = tags,
                    colors = colors,
                    conversationList = updatedList
                ).flatMap { updatedListWithCategory ->
                    log.info("已更新需求分类，conversationListId={}", updatedList.id)

                    val conversation = updatedListWithCategory as RequirementConversation

                    // 串行更新关联模型，始终使用上一步返回的最新会话版本，避免并发回写触发乐观锁冲突
                    Mono.just(conversation)
                        .flatMap { currentConversation ->
                            currentConversation.requirementCompletenessId?.let { completenessId ->
                                requirementCompletenessService.update(
                                    id = completenessId,
                                    overallCompleteness = overallCompleteness,
                                    aspects = aspects,
                                    optimizationSuggestions = optimizationSuggestions,
                                    conversationList = currentConversation
                                )
                            } ?: requirementCompletenessService.create(
                                overallCompleteness = overallCompleteness,
                                aspects = aspects,
                                optimizationSuggestions = optimizationSuggestions,
                                conversationList = currentConversation
                            )
                        }
                        .map { it as RequirementConversation }
                        .flatMap { currentConversation ->
                            currentConversation.requirementPriorityId?.let { priorityId ->
                                requirementPriorityService.update(
                                    id = priorityId,
                                    priority = priority,
                                    scheduling = scheduling,
                                    factors = factors,
                                    justification = justification,
                                    conversationList = currentConversation
                                )
                            } ?: requirementPriorityService.create(
                                priority = priority,
                                scheduling = scheduling,
                                factors = factors,
                                justification = justification,
                                conversationList = currentConversation
                            )
                        }
                        .map { it as RequirementConversation }
                        .flatMap { currentConversation ->
                            currentConversation.requirementSuggestionId?.let { suggestionId ->
                                requirementSuggestionService.update(
                                    id = suggestionId,
                                    suggestions = suggestions,
                                    conversationList = currentConversation
                                )
                            } ?: requirementSuggestionService.create(
                                suggestions = suggestions,
                                conversationList = currentConversation
                            )
                        }
                        .map { it as RequirementConversation }
                        .flatMap { currentConversation ->
                            currentConversation.requirementSummaryAnalysisId?.let { summaryId ->
                                requirementSummaryAnalysisService.update(
                                    id = summaryId,
                                    summary = summary,
                                    taskArrangement = taskArrangement,
                                    conversationList = currentConversation
                                )
                            } ?: requirementSummaryAnalysisService.create(
                                summary = summary,
                                taskArrangement = taskArrangement,
                                conversationList = currentConversation
                            )
                        }
                        .map { it as RequirementConversation }
                        .flatMap { currentConversation ->
                            currentConversation.requirementTaskBreakdownId?.let { taskBreakdownId ->
                                requirementTaskBreakdownService.update(
                                    id = taskBreakdownId,
                                    mainTask = mainTask,
                                    subTasks = subTasks,
                                    parallelismScore = parallelismScore,
                                    parallelExecutionTips = parallelExecutionTips,
                                    conversationList = currentConversation
                                )
                            } ?: requirementTaskBreakdownService.create(
                                mainTask = mainTask,
                                subTasks = subTasks,
                                parallelismScore = parallelismScore,
                                parallelExecutionTips = parallelExecutionTips,
                                conversationList = currentConversation
                            )
                        }
                        .map { it as RequirementConversation }
                        .flatMap { currentConversation ->
                            currentConversation.requirementWorkloadId?.let { workloadId ->
                                requirementWorkloadService.update(
                                    id = workloadId,
                                    optimistic = optimistic,
                                    mostLikely = mostLikely,
                                    pessimistic = pessimistic,
                                    expected = expected,
                                    standardDeviation = standardDeviation,
                                    conversationList = currentConversation
                                )
                            } ?: requirementWorkloadService.create(
                                optimistic = optimistic,
                                mostLikely = mostLikely,
                                pessimistic = pessimistic,
                                expected = expected,
                                standardDeviation = standardDeviation,
                                conversationList = currentConversation
                            )
                        }
                        .map { it as RequirementConversation }
                        .flatMap { finalConversation ->
                            log.info("已更新所有关联模型，conversationListId={}", finalConversation.id)
                            getById(finalConversation.id!!)
                        }
                }
            }
    }

    /**
     * 删除需求对话列表
     * 级联删除相关联的所有实体：
     * - 需求分类
     * - 需求完整度检查
     * - 需求优先级
     * - 需求智能建议
     * - 需求摘要分析
     * - 需求任务拆分
     * - 需求工作量
     */
    @ReactiveTransactionalOutbox
    fun delete(id: Long): Mono<Void> {
        log.info("删除需求对话列表及关联模型, id={}", id)
        
        return requirementConversationRepository.findById(id)
            .flatMap { conversationList ->
                log.info("找到需求对话列表，开始删除关联实体, id={}", id)
                
                // 收集所有需要删除的实体ID对应的删除操作
                val deleteOperations = mutableListOf<Mono<Void>>()
                
                // 1. 删除需求分类
                conversationList.requirementCategoryId?.let { categoryId ->
                    log.info("删除关联的需求分类, categoryId={}", categoryId)
                    deleteOperations.add(requirementCategoryService.delete(categoryId))
                }
                
                // 2. 删除需求完整度检查
                conversationList.requirementCompletenessId?.let { completenessId ->
                    log.info("删除关联的需求完整度检查, completenessId={}", completenessId)
                    deleteOperations.add(requirementCompletenessService.delete(completenessId))
                }
                
                // 3. 删除需求优先级
                conversationList.requirementPriorityId?.let { priorityId ->
                    log.info("删除关联的需求优先级, priorityId={}", priorityId)
                    deleteOperations.add(requirementPriorityService.delete(priorityId))
                }
                
                // 4. 删除需求智能建议
                conversationList.requirementSuggestionId?.let { suggestionId ->
                    log.info("删除关联的需求智能建议, suggestionId={}", suggestionId)
                    deleteOperations.add(requirementSuggestionService.delete(suggestionId))
                }
                
                // 5. 删除需求摘要分析
                conversationList.requirementSummaryAnalysisId?.let { summaryId ->
                    log.info("删除关联的需求摘要分析, summaryId={}", summaryId)
                    deleteOperations.add(requirementSummaryAnalysisService.delete(summaryId))
                }
                
                // 6. 删除需求任务拆分
                conversationList.requirementTaskBreakdownId?.let { taskBreakdownId ->
                    log.info("删除关联的需求任务拆分, taskBreakdownId={}", taskBreakdownId)
                    deleteOperations.add(requirementTaskBreakdownService.delete(taskBreakdownId))
                }
                
                // 7. 删除需求工作量
                conversationList.requirementWorkloadId?.let { workloadId ->
                    log.info("删除关联的需求工作量, workloadId={}", workloadId)
                    deleteOperations.add(requirementWorkloadService.delete(workloadId))
                }
                
                // 组合所有删除操作，然后删除对话列表
                if (deleteOperations.isEmpty()) {
                    // 如果没有关联实体，直接删除对话列表
                    requirementConversationRepository.delete(id)
                } else {
                    // 先执行所有关联实体的删除操作，然后删除对话列表本身
                    Mono.empty<Void>()
                        .then(Mono.defer {
                            val chain = deleteOperations.fold(Mono.empty<Void>()) { acc, mono ->
                                acc.then(mono)
                            }
                            chain.then(requirementConversationRepository.delete(id))
                        })
                }
            }
            .doOnSuccess { log.info("成功删除需求对话列表及所有关联实体, id={}", id) }
            .doOnError { error -> log.error("删除需求对话列表及关联实体时发生错误, id={}, error={}", id, error.message, error) }
    }
} 
