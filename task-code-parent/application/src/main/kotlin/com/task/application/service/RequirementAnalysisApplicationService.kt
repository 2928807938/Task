package com.task.application.service

import com.fasterxml.jackson.databind.ObjectMapper
import com.task.application.request.RequirementAnalysisRequest
import com.task.application.service.analyzer.AnalyzerFactory
import com.task.application.service.analyzer.SummaryAnalyzer
import com.task.application.vo.LlmResultVO
import com.task.domain.model.llm.AnalyzerTypeEnum
import com.task.domain.model.llm.LlmResult
import com.task.domain.model.llm.LlmResultTypeEnum
import org.slf4j.LoggerFactory
import org.springframework.stereotype.Service
import reactor.core.publisher.Flux
import java.time.Duration
import java.util.concurrent.ConcurrentHashMap

/**
 * 需求分析应用服务实现类
 */
@Service
class RequirementAnalysisApplicationService(
    private val analyzerFactory: AnalyzerFactory,
    private val summaryAnalyzer: SummaryAnalyzer,
    private val analysisResultSummarizer: AnalysisResultSummarizer,
    private val requirementAnalysisSessionService: RequirementAnalysisSessionService,
    private val objectMapper: ObjectMapper
) {

    private val log = LoggerFactory.getLogger(this::class.java)

    /**
     * 流式分析需求（支持多轮上下文）
     */
    fun analyzeRequirementStream(request: RequirementAnalysisRequest): Flux<LlmResultVO> {
        log.info(
            "开始流式分析需求: contentPreview={}, conversationListId={}, projectId={}",
            request.content.take(50) + "...",
            request.conversationListId,
            request.projectId
        )

        return requirementAnalysisSessionService.startTurn(request)
            .flatMapMany { state ->
                val typeResults = ConcurrentHashMap<Int, StringBuilder>()
                LlmResultTypeEnum.entries.forEach { resultType ->
                    typeResults[resultType.code] = StringBuilder()
                }

                val startEvent = Flux.just(
                    LlmResult(
                        content = "开始分析需求...",
                        success = true,
                        type = LlmResultTypeEnum.ANALYSIS_STARTED.code
                    )
                )

                val analyzerExecutionOrder = listOf(
                    AnalyzerTypeEnum.TASK_BREAKDOWN,
                    AnalyzerTypeEnum.PRIORITY,
                    AnalyzerTypeEnum.WORKLOAD,
                    AnalyzerTypeEnum.COMPLETENESS,
                    AnalyzerTypeEnum.SUGGESTION,
                    AnalyzerTypeEnum.REQUIREMENT_TYPE
                )

                val analyzerInputs = buildAnalyzerInputs(state, request.projectId)
                val analysisTasks = analyzerExecutionOrder.map { analyzerType ->
                    createAnalysisTask(analyzerType, request, state, analyzerInputs)
                }

                val completeEvent = Flux.just(
                    LlmResult(
                        content = "所有分析完成",
                        success = true,
                        type = LlmResultTypeEnum.ANALYSIS_COMPLETED.code
                    )
                )

                val mainFlow = Flux.concat(
                    startEvent,
                    Flux.concat(analysisTasks)
                )
                    .doOnNext { llmResult ->
                        collectResult(typeResults, state, llmResult)
                    }
                    .cache()

                val directResults = mainFlow

                val processedResults = mainFlow
                    .collectList()
                    .flatMapMany { results ->
                        log.info("所有分析结果收集完成，共{}个结果", results.size)

                        val typeCounts = results
                            .filter { it.success }
                            .groupBy { it.type }
                            .mapValues { it.value.size }
                        log.info("各类型结果数量: {}", typeCounts)

                        val comprehensiveResult = processCollectedResults(request, state, typeResults)
                        Flux.concat(comprehensiveResult, completeEvent)
                    }

                val outputFlow = Flux.concat(directResults, processedResults)

                outputFlow
                    .concatWith(
                        requirementAnalysisSessionService
                            .completeTurn(state, true)
                            .thenMany(Flux.empty())
                    )
                    .map { llmResult ->
                        log.info(
                            "准备发送分析结果: type={}, content={}",
                            if (llmResult.type == LlmResultTypeEnum.SUMMARY_ANALYSIS.code) "综合分析"
                            else LlmResultTypeEnum.fromCode(llmResult.type).description,
                            llmResult.content.take(30) + "..."
                        )
                        LlmResultVO.fromDomain(llmResult, state.streamDisplayInfo(llmResult.type))
                    }
                    .delayElements(Duration.ofMillis(5))
                    .onBackpressureBuffer(256)
                    .onErrorResume { error ->
                        requirementAnalysisSessionService.completeTurn(state, false, error.message)
                            .thenMany(
                                Flux.just(
                                    LlmResultVO.fromDomain(
                                        LlmResult(
                                            content = "分析过程中发生错误: ${error.message ?: "未知错误"}",
                                            success = false,
                                            errorMessage = error.message,
                                            type = LlmResultTypeEnum.ANALYSIS_ERROR.code
                                        ),
                                        state.streamDisplayInfo(LlmResultTypeEnum.ANALYSIS_ERROR.code)
                                    )
                                )
                            )
                    }
            }
            .onErrorResume { error ->
                log.error("流式分析初始化失败", error)
                Flux.just(
                    LlmResultVO.fromDomain(
                        LlmResult(
                            content = "分析初始化失败: ${error.message ?: "未知错误"}",
                            success = false,
                            errorMessage = error.message,
                            type = LlmResultTypeEnum.ANALYSIS_ERROR.code
                        )
                    )
                )
            }
    }

    private fun buildAnalyzerInputs(state: RequirementAnalysisGraphState, projectId: Long): Map<String, Any> {
        val inputs = linkedMapOf<String, Any>(
            "_conversation_id" to state.threadId,
            "root_main_task" to state.rootMainTask,
            "current_user_input" to state.currentUserInput,
            "previous_task_breakdown" to state.previousTaskBreakdownJson.orEmpty(),
            "previous_final_summary" to state.previousFinalSummaryJson.orEmpty(),
            "project_id" to projectId
        )
        return inputs
    }

    /**
     * 处理收集到的所有分析结果，并生成综合分析
     */
    private fun processCollectedResults(
        request: RequirementAnalysisRequest,
        state: RequirementAnalysisGraphState,
        typeResults: ConcurrentHashMap<Int, StringBuilder>
    ): Flux<LlmResult> {
        log.info("处理收集到的所有分析结果")

        val rawResults = mapOf(
            LlmResultTypeEnum.TYPE_ANALYSIS.code to typeResults[LlmResultTypeEnum.TYPE_ANALYSIS.code]?.toString().orEmpty(),
            LlmResultTypeEnum.PRIORITY_ANALYSIS.code to typeResults[LlmResultTypeEnum.PRIORITY_ANALYSIS.code]?.toString().orEmpty(),
            LlmResultTypeEnum.WORKLOAD_ANALYSIS.code to typeResults[LlmResultTypeEnum.WORKLOAD_ANALYSIS.code]?.toString().orEmpty(),
            LlmResultTypeEnum.TASK_BREAKDOWN_ANALYSIS.code to typeResults[LlmResultTypeEnum.TASK_BREAKDOWN_ANALYSIS.code]?.toString().orEmpty(),
            LlmResultTypeEnum.COMPLETENESS_ANALYSIS.code to typeResults[LlmResultTypeEnum.COMPLETENESS_ANALYSIS.code]?.toString().orEmpty(),
            LlmResultTypeEnum.SUGGESTION_ANALYSIS.code to typeResults[LlmResultTypeEnum.SUGGESTION_ANALYSIS.code]?.toString().orEmpty()
        )

        return analysisResultSummarizer.summarizeAllResults(rawResults)
            .flatMapMany { summarizedInputs ->
                val summaryInputs = summarizedInputs + mapOf(
                    "_conversation_id" to state.threadId,
                    "root_main_task" to state.rootMainTask,
                    "current_user_input" to state.currentUserInput,
                    "project_id" to request.projectId
                )
                val summaryContent = StringBuilder()
                summaryAnalyzer.analyze(content = request.content, inputs = summaryInputs)
                    .map { result ->
                        result.copy(type = LlmResultTypeEnum.SUMMARY_ANALYSIS.code)
                    }
                    .doOnNext { result ->
                        if (result.success) {
                            summaryContent.append(result.content)
                        }
                    }
                    .doOnComplete {
                        val summary = summaryContent.toString()
                        if (summary.isNotBlank()) {
                            state.analysisSummaryJson = summary
                            state.finalSummaryJson = summary
                            typeResults.computeIfAbsent(LlmResultTypeEnum.SUMMARY_ANALYSIS.code) { StringBuilder() }
                                .append(summary)
                        }
                    }
            }
    }

    /**
     * 创建分析任务
     */
    private fun createAnalysisTask(
        analyzerType: AnalyzerTypeEnum,
        request: RequirementAnalysisRequest,
        state: RequirementAnalysisGraphState,
        inputs: Map<String, Any>
    ): Flux<LlmResult> {
        val analyzer = analyzerFactory.getAnalyzer(analyzerType)
        return analyzer.analyze(request.content, request.projectId, inputs)
            .map { result ->
                val normalizedContent = if (analyzerType == AnalyzerTypeEnum.TASK_BREAKDOWN && result.success) {
                    enforceRootMainTask(result.content, state.rootMainTask)
                } else {
                    result.content
                }
                result.copy(content = normalizedContent, type = analyzerType.resultType.code)
            }
            .doOnNext { result ->
                log.debug("收到{}分析结果: {}", analyzerType.name, result.content.take(20) + "...")
            }
    }

    private fun collectResult(
        typeResults: ConcurrentHashMap<Int, StringBuilder>,
        state: RequirementAnalysisGraphState,
        llmResult: LlmResult
    ) {
        if (!llmResult.success) {
            return
        }
        typeResults.computeIfAbsent(llmResult.type) { StringBuilder() }
            .append(llmResult.content)

        when (llmResult.type) {
            LlmResultTypeEnum.TASK_BREAKDOWN_ANALYSIS.code -> state.latestTaskBreakdownJson = llmResult.content
            LlmResultTypeEnum.TYPE_ANALYSIS.code -> state.requirementTypeJson = llmResult.content
            LlmResultTypeEnum.PRIORITY_ANALYSIS.code -> state.priorityJson = llmResult.content
            LlmResultTypeEnum.WORKLOAD_ANALYSIS.code -> state.workloadJson = llmResult.content
            LlmResultTypeEnum.COMPLETENESS_ANALYSIS.code -> state.completenessJson = llmResult.content
            LlmResultTypeEnum.SUGGESTION_ANALYSIS.code -> state.suggestionJson = llmResult.content
        }
    }

    /**
     * 服务端强制覆盖任务拆分的main_task，避免主任务锚点漂移
     */
    private fun enforceRootMainTask(taskBreakdownJson: String, rootMainTask: String): String {
        return runCatching {
            val root = objectMapper.readTree(taskBreakdownJson)
            if (root.isObject) {
                (root as com.fasterxml.jackson.databind.node.ObjectNode).put("main_task", rootMainTask)
                objectMapper.writeValueAsString(root)
            } else {
                taskBreakdownJson
            }
        }.getOrElse {
            log.warn("任务拆分JSON解析失败，跳过main_task强制覆盖: {}", it.message)
            taskBreakdownJson
        }
    }
}
