package com.task.shared.exceptions

import com.task.shared.constants.ResponseCode

/**
 * 参数验证异常
 * 用于处理请求参数校验失败的情况
 */
class ValidationException(
    code: Int = ResponseCode.INVALID_PARAMETER.code,
    message: String = ResponseCode.INVALID_PARAMETER.message,
    val errors: Map<String, String> = emptyMap(),
    cause: Throwable? = null
) : BusinessException(code, message, cause) {
    constructor(responseCode: ResponseCode, errors: Map<String, String> = emptyMap(), cause: Throwable? = null) : this(
        code = responseCode.code,
        message = responseCode.message,
        errors = errors,
        cause = cause
    )

    constructor(responseCode: ResponseCode, message: String, errors: Map<String, String> = emptyMap(), cause: Throwable? = null) : this(
        code = responseCode.code,
        message = message,
        errors = errors,
        cause = cause
    )
}