package com.task.application.service

import com.fasterxml.jackson.databind.ObjectMapper
import com.task.domain.model.llm.LlmResultTypeEnum
import com.task.domain.service.LlmService
import org.slf4j.LoggerFactory
import org.springframework.beans.factory.annotation.Value
import org.springframework.stereotype.Service
import reactor.core.publisher.Flux
import reactor.core.publisher.Mono
import reactor.util.retry.Retry
import java.time.Duration
import java.util.LinkedHashMap

/**
 * 在综合分析前，对各分析结果进行压缩摘要，降低上下文体积。
 */
@Service
class AnalysisResultSummarizer(
    private val llmService: LlmService,
    private val objectMapper: ObjectMapper,
    @Value("\${analysis.summary.enabled:true}")
    private val summaryEnabled: Boolean
) {

    private val log = LoggerFactory.getLogger(this::class.java)

    private data class SummaryTarget(
        val resultTypeCode: Int,
        val analysisType: String,
        val summaryInputKey: String,
        val tokenBudget: Int
    )

    private val targets = listOf(
        SummaryTarget(
            resultTypeCode = LlmResultTypeEnum.TYPE_ANALYSIS.code,
            analysisType = "REQUIREMENT_TYPE",
            summaryInputKey = "type_analysis",
            tokenBudget = 30
        ),
        SummaryTarget(
            resultTypeCode = LlmResultTypeEnum.PRIORITY_ANALYSIS.code,
            analysisType = "PRIORITY",
            summaryInputKey = "priority_analysis",
            tokenBudget = 300
        ),
        SummaryTarget(
            resultTypeCode = LlmResultTypeEnum.WORKLOAD_ANALYSIS.code,
            analysisType = "WORKLOAD",
            summaryInputKey = "workload_analysis",
            tokenBudget = 100
        ),
        SummaryTarget(
            resultTypeCode = LlmResultTypeEnum.TASK_BREAKDOWN_ANALYSIS.code,
            analysisType = "TASK_BREAKDOWN",
            summaryInputKey = "task_breakdown",
            tokenBudget = 400
        ),
        SummaryTarget(
            resultTypeCode = LlmResultTypeEnum.COMPLETENESS_ANALYSIS.code,
            analysisType = "COMPLETENESS",
            summaryInputKey = "requirement_completeness",
            tokenBudget = 200
        ),
        SummaryTarget(
            resultTypeCode = LlmResultTypeEnum.SUGGESTION_ANALYSIS.code,
            analysisType = "SUGGESTION",
            summaryInputKey = "intelligent_suggestions",
            tokenBudget = 250
        )
    )

    /**
     * 对全部分析结果执行摘要并返回SUMMARY_ANALYSIS需要的输入结构。
     */
    fun summarizeAllResults(typeResults: Map<Int, String>): Mono<Map<String, String>> {
        val fallbackInputs = buildSummaryInputsFromRaw(typeResults)
        if (!summaryEnabled) {
            log.info("分析摘要功能已关闭，直接使用原始分析结果")
            return Mono.just(fallbackInputs)
        }

        val summarizeMonos = targets.map { target ->
            val rawResult = typeResults[target.resultTypeCode].orEmpty()
            if (rawResult.isBlank()) {
                Mono.just(target.summaryInputKey to "")
            } else {
                summarizeSingleResult(target.analysisType, rawResult, target.tokenBudget)
                    .doOnNext { summarized ->
                        log.info(
                            "分析摘要完成: analysisType={}, rawLength={}, summaryLength={}",
                            target.analysisType,
                            rawResult.length,
                            summarized.length
                        )
                    }
                    .onErrorResume { error ->
                        log.warn(
                            "分析摘要失败，回退原始结果: analysisType={}, error={}",
                            target.analysisType,
                            error.message
                        )
                        Mono.just(rawResult)
                    }
                    .map { summarized -> target.summaryInputKey to summarized }
            }
        }

        return Flux.merge(summarizeMonos)
            .collectMap({ it.first }, { it.second })
            .map<Map<String, String>> { summarized ->
                LinkedHashMap<String, String>().apply {
                    targets.forEach { target ->
                        this[target.summaryInputKey] = summarized[target.summaryInputKey].orEmpty()
                    }
                }
            }
            .onErrorReturn(fallbackInputs)
    }

    /**
     * 对单个分析结果进行摘要，默认使用分析类型预算。
     */
    fun summarizeSingleResult(
        analysisType: String,
        rawResult: String
    ): Mono<String> {
        val budget = targets.firstOrNull { it.analysisType == analysisType }?.tokenBudget ?: 200
        return summarizeSingleResult(analysisType, rawResult, budget)
    }

    private fun summarizeSingleResult(
        analysisType: String,
        rawResult: String,
        tokenBudget: Int
    ): Mono<String> {
        if (rawResult.isBlank()) {
            return Mono.just(rawResult)
        }

        val inputs = mapOf(
            "analysis_type" to analysisType,
            "raw_analysis_result" to rawResult,
            "token_budget" to tokenBudget.toString()
        )

        return llmService.generateText(content = rawResult, apiKey = SUMMARY_SCENE_KEY, inputs = inputs)
            .collectList()
            .flatMap { responses ->
                val errorResult = responses.firstOrNull { !it.success }
                if (errorResult != null) {
                    return@flatMap Mono.error(IllegalStateException(errorResult.errorMessage ?: "摘要模型调用失败"))
                }

                val summarized = responses.joinToString(separator = "") { it.content }.trim()
                if (summarized.isBlank()) {
                    return@flatMap Mono.error(IllegalStateException("摘要结果为空"))
                }
                if (!isUsableSummaryJson(summarized)) {
                    return@flatMap Mono.error(IllegalStateException("摘要结果非有效JSON或为错误回包"))
                }
                Mono.just(summarized)
            }
            .retryWhen(
                Retry.backoff(2, Duration.ofMillis(300))
                    .filter { error ->
                        log.warn("摘要调用重试: analysisType={}, error={}", analysisType, error.message)
                        true
                    }
            )
    }

    private fun buildSummaryInputsFromRaw(typeResults: Map<Int, String>): Map<String, String> {
        return LinkedHashMap<String, String>().apply {
            targets.forEach { target ->
                this[target.summaryInputKey] = typeResults[target.resultTypeCode].orEmpty()
            }
        }
    }

    private fun isUsableSummaryJson(content: String): Boolean {
        return runCatching {
            val node = objectMapper.readTree(content)
            node.isObject && !node.has("error")
        }.getOrDefault(false)
    }

    companion object {
        private const val SUMMARY_SCENE_KEY = "分析摘要"
    }
}
