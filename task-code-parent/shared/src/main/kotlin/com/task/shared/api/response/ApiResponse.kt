package com.task.shared.api.response

import org.slf4j.MDC
import java.io.Serializable
import java.time.Instant

/**
 * 响应式友好的API响应包装类
 * 用于统一API响应格式，适用于WebFlux响应式编程
 *
 * @param T 响应数据类型
 * @property success 请求是否成功
 * @property data 响应数据，成功时包含数据，失败时可能为null
 * @property code 响应代码，成功时默认为"200"，失败时表示错误代码
 * @property message 响应消息，成功时可能为null，失败时包含错误信息
 * @property timestamp 响应时间戳
 */
data class ApiResponse<T>(
    val success: Boolean,
    val data: T? = null,
    val code: String = if (success) "200" else "500",
    val message: String? = null,
    val timestamp: Long = Instant.now().toEpochMilli(),
    val traceId: String?
) : Serializable {

    companion object {
        private const val serialVersionUID = 1L
        
        /**
         * 获取当前请求的追踪ID
         * 使用MDC获取traceId，避免使用RequestContextHolder中的阻塞操作
         * 
         * 在应用中，TraceIdFilter和RequestContextFilter已经将traceId设置到MDC中
         * 因此我们只需要从MDC中获取即可
         */
        private fun getTraceId(): String? {
            // 从MDC获取traceId，这是非阻塞的操作
            return MDC.get("traceId")
        }

        /**
         * 创建成功响应
         *
         * @param data 响应数据
         * @param message 可选的成功消息
         * @return 成功的API响应
         */
        fun <T> success(data: T, message: String? = null): ApiResponse<T> =
            ApiResponse(
                success = true,
                data = data,
                code = "200",
                message = message,
                traceId = getTraceId()
            )
        /**
         * 创建成功响应
         *
         * @param data 响应数据
         * @param message 可选的成功消息
         * @return 成功的API响应
         */
        fun <T> success(): ApiResponse<T> =
            ApiResponse(
                success = true,
                code = "200",
                traceId = getTraceId()
            )

        /**
         * 创建无数据的成功响应
         *
         * @param message 可选的成功消息
         * @return 成功的API响应，数据为null
         */
        fun <T> successNoData(message: String? = null): ApiResponse<T> =
            ApiResponse(
                success = true,
                data = null,
                code = "200",
                message = message,
                traceId = getTraceId()
            )

        /**
         * 创建错误响应
         *
         * @param message 错误消息
         * @param code 错误代码
         * @return 错误的API响应
         */
        fun <T> error(message: String, code: String = "500"): ApiResponse<T> =
            ApiResponse(
                success = false,
                data = null,
                code = code,
                message = message,
                traceId = getTraceId()
            )

        /**
         * 创建资源未找到的错误响应
         *
         * @param message 错误消息，默认为"Resource not found"
         * @return 表示资源未找到的错误响应
         */
        fun <T> notFound(message: String = "Resource not found"): ApiResponse<T> =
            ApiResponse(
                success = false,
                data = null,
                code = "404",
                message = message,
                traceId = getTraceId()
            )

        /**
         * 创建无效请求的错误响应
         *
         * @param message 错误消息，默认为"Invalid request"
         * @return 表示无效请求的错误响应
         */
        fun <T> badRequest(message: String = "Invalid request"): ApiResponse<T> =
            ApiResponse(
                success = false,
                data = null,
                code = "400",
                message = message,
                traceId = getTraceId()
            )

        /**
         * 创建未授权的错误响应
         *
         * @param message 错误消息，默认为"Unauthorized"
         * @return 表示未授权的错误响应
         */
        fun <T> unauthorized(message: String = "Unauthorized"): ApiResponse<T> =
            ApiResponse(
                success = false,
                data = null,
                code = "401",
                message = message,
                traceId = getTraceId()
            )
    }
}
