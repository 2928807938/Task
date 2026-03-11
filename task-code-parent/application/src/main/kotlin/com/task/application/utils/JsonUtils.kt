package com.task.application.utils

import com.fasterxml.jackson.databind.JsonNode
import com.fasterxml.jackson.databind.ObjectMapper
import com.task.domain.model.llm.AnalyzerTypeEnum
import org.springframework.stereotype.Component

/**
 * 统一 JSON 解析工具
 */
@Component
class JsonUtils(
    private val objectMapper: ObjectMapper
) {

    fun parseRootJson(analyzerType: AnalyzerTypeEnum, rawResult: String): JsonNode {
        return parseRootJson(analyzerType.name, rawResult)
    }

    fun parseRootJson(sourceName: String, rawResult: String): JsonNode {
        if (rawResult.isBlank()) {
            throw IllegalStateException("${sourceName}分析结果为空，落库失败")
        }
        val jsonContent = extractJsonFromText(rawResult)
        return objectMapper.readTree(jsonContent)
    }

    private fun extractJsonFromText(raw: String): String {
        val codeBlockRegex = Regex("```(?:json)?\\s*([\\s\\S]*?)\\s*```")
        val codeBlockMatch = codeBlockRegex.find(raw)
        if (codeBlockMatch != null) {
            return codeBlockMatch.groupValues[1].trim()
        }

        val start = raw.indexOf('{')
        val end = raw.lastIndexOf('}')
        if (start >= 0 && end > start) {
            return raw.substring(start, end + 1)
        }

        return raw.trim()
    }
}

fun JsonNode.readText(vararg names: String): String? {
    names.forEach { name ->
        val value = this.path(name)
        if (!value.isMissingNode && !value.isNull) {
            val text = value.asText()
            if (text.isNotBlank()) {
                return text
            }
        }
    }
    return null
}

fun JsonNode.readInt(vararg names: String): Int? {
    names.forEach { name ->
        val value = this.path(name)
        if (!value.isMissingNode && !value.isNull) {
            if (value.isInt || value.isLong) {
                return value.asInt()
            }
            value.asText().toIntOrNull()?.let { return it }
        }
    }
    return null
}

fun JsonNode.readNode(vararg names: String): JsonNode? {
    names.forEach { name ->
        val value = this.path(name)
        if (!value.isMissingNode && !value.isNull) {
            return value
        }
    }
    return null
}

fun JsonNode.readStringArray(vararg names: String): List<String> {
    val node = readNode(*names) ?: return emptyList()
    if (!node.isArray) {
        return listOf(node.asText()).filter { it.isNotBlank() }
    }
    return node.map { it.asText() }.filter { it.isNotBlank() }
}

fun JsonNode.readFlexibleStringArray(vararg names: String): List<String> {
    val node = readNode(*names) ?: return emptyList()
    if (node.isArray) {
        return node.flatMap { splitTextToList(it.asText()) }
    }
    return splitTextToList(node.asText())
}

private fun splitTextToList(value: String): List<String> {
    val trimmed = value.trim()
    if (trimmed.isBlank()) {
        return emptyList()
    }
    if (!trimmed.contains(',') &&
        !trimmed.contains('，') &&
        !trimmed.contains('、') &&
        !trimmed.contains(';') &&
        !trimmed.contains('；') &&
        !trimmed.contains('\n')
    ) {
        return listOf(trimmed)
    }
    return trimmed
        .split(Regex("[,，、;；\\n]+"))
        .map { it.trim() }
        .filter { it.isNotBlank() }
}
