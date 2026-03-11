package com.task.application.service.analyzer

import com.task.domain.model.llm.AnalyzerTypeEnum
import org.springframework.stereotype.Service

@Service
class AnalyzerFactory(private val analyzers: Map<String, LlmAnalyzer>) {

    fun getAnalyzer(type: AnalyzerTypeEnum): LlmAnalyzer {
        return analyzers[type.beanName] ?: throw IllegalArgumentException("未找到分析器: ${type.name}")
    }
}