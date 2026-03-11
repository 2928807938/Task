package com.task.shared.exceptions

import com.task.shared.constants.ResponseCode

/**
 * 资源不存在异常
 * 用于处理请求的资源不存在的情况
 */
class ResourceNotFoundException(
    code: Int = ResponseCode.NOT_FOUND.code,
    message: String = ResponseCode.NOT_FOUND.message,
    val resourceId: Any? = null,
    val resourceType: String? = null,
    cause: Throwable? = null
) : BusinessException(code, message, cause) {
    constructor(responseCode: ResponseCode, resourceId: Any? = null, resourceType: String? = null, cause: Throwable? = null) : this(
        code = responseCode.code,
        message = responseCode.message,
        resourceId = resourceId,
        resourceType = resourceType,
        cause = cause
    )

    constructor(responseCode: ResponseCode, message: String, resourceId: Any? = null, resourceType: String? = null, cause: Throwable? = null) : this(
        code = responseCode.code,
        message = message,
        resourceId = resourceId,
        resourceType = resourceType,
        cause = cause
    )
}