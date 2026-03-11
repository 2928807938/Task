package com.task.shared.exceptions

import com.task.shared.constants.ResponseCode

/**
 * 授权异常
 * 用于处理用户权限相关的异常情况，如权限不足等
 */
class AuthorizationException(
    code: Int = ResponseCode.FORBIDDEN.code,
    message: String = ResponseCode.FORBIDDEN.message,
    cause: Throwable? = null
) : BusinessException(code, message, cause) {
    constructor(responseCode: ResponseCode, cause: Throwable? = null) : this(
        code = responseCode.code,
        message = responseCode.message,
        cause = cause
    )

    constructor(responseCode: ResponseCode, message: String, cause: Throwable? = null) : this(
        code = responseCode.code,
        message = message,
        cause = cause
    )
}