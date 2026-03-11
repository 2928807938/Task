package com.task.shared.exceptions

import com.task.shared.constants.ResponseCode

/**
 * 认证异常
 * 用于处理用户认证相关的异常情况，如令牌过期、无效令牌等
 */
class AuthenticationException(
    code: Int = ResponseCode.UNAUTHORIZED.code,
    message: String = ResponseCode.UNAUTHORIZED.message,
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