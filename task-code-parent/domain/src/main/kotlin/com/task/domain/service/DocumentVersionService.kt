package com.task.domain.service

import com.task.domain.model.versioning.DocumentVersion
import org.springframework.stereotype.Service
import java.time.OffsetDateTime

/**
 * 文档版本领域服务
 * 处理文档版本相关的业务逻辑
 */
@Service
class DocumentVersionService {

    /**
     * 创建新文档版本
     *
     * @param documentId 文档ID
     * @param versionNumber 版本号
     * @param content 文档内容
     * @param createdById 创建用户ID
     * @param notes 版本说明
     * @param isMajorVersion 是否为主版本
     * @return 创建的文档版本对象
     */
    fun createVersion(
        documentId: Long,
        versionNumber: String,
        content: String,
        createdById: Long,
        notes: String? = null,
        isMajorVersion: Boolean = false
    ): DocumentVersion {
        return DocumentVersion(
            id = 0, // 临时ID，实际会由Repository生成
            documentId = documentId,
            versionNumber = versionNumber,
            content = content,
            notes = notes,
            createdById = createdById,
            createdAt = OffsetDateTime.now()
        )
    }

    /**
     * 生成下一个版本号
     *
     * @param currentVersion 当前版本号
     * @param isMajorVersion 是否为主版本
     * @return 下一个版本号
     */
    fun generateNextVersionNumber(currentVersion: String, isMajorVersion: Boolean): String {
        val parts = currentVersion.split(".")
        if (parts.size != 2) {
            // 如果当前版本号格式不正确，则返回默认版本号
            return if (isMajorVersion) "1.0" else "0.1"
        }

        try {
            val major = parts[0].toInt()
            val minor = parts[1].toInt()

            return if (isMajorVersion) {
                "${major + 1}.0"
            } else {
                "$major.${minor + 1}"
            }
        } catch (e: NumberFormatException) {
            // 如果解析失败，则返回默认版本号
            return if (isMajorVersion) "1.0" else "0.1"
        }
    }

    /**
     * 比较两个版本号
     *
     * @param version1 版本号1
     * @param version2 版本号2
     * @return 如果version1大于version2返回正数，相等返回0，小于返回负数
     */
    fun compareVersions(version1: String, version2: String): Int {
        val parts1 = version1.split(".").map { it.toIntOrNull() ?: 0 }
        val parts2 = version2.split(".").map { it.toIntOrNull() ?: 0 }

        val majorDiff = (parts1.getOrNull(0) ?: 0) - (parts2.getOrNull(0) ?: 0)
        if (majorDiff != 0) {
            return majorDiff
        }

        return (parts1.getOrNull(1) ?: 0) - (parts2.getOrNull(1) ?: 0)
    }

    /**
     * 查找文档的最新版本
     *
     * @param documentId 文档ID
     * @param versions 文档版本列表
     * @return 最新版本，如果没有则返回null
     */
    fun findLatestVersion(documentId: Long, versions: List<DocumentVersion>): DocumentVersion? {
        if (versions.isEmpty()) {
            return null
        }

        val documentVersions = versions.filter { it.documentId == documentId }
        if (documentVersions.isEmpty()) {
            return null
        }

        return documentVersions.maxByOrNull { version ->
            val parts = version.versionNumber.split(".")
            val major = parts.getOrNull(0)?.toIntOrNull() ?: 0
            val minor = parts.getOrNull(1)?.toIntOrNull() ?: 0
            major * 1000 + minor
        }
    }

    /**
     * 查找文档的主要版本
     *
     * @param documentId 文档ID
     * @param versions 文档版本列表
     * @return 主要版本列表
     */
    fun findMajorVersions(documentId: Long, versions: List<DocumentVersion>): List<DocumentVersion> {
        return versions.filter { it.documentId == documentId && it.isMajorVersion }
            .sortedByDescending { version ->
                val parts = version.versionNumber.split(".")
                val major = parts.getOrNull(0)?.toIntOrNull() ?: 0
                val minor = parts.getOrNull(1)?.toIntOrNull() ?: 0
                major * 1000 + minor
            }
    }
}
